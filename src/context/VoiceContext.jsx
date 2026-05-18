import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { io } from "socket.io-client";

const VoiceContext = createContext(null);

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

// Single shared socket for entire app
const socket = io(SOCKET_URL);

export function VoiceProvider({ children }) {
  const [currentVoiceRoom, setCurrentVoiceRoom] = useState(null); // { id, name }
  const [participants, setParticipants] = useState([]); // [{ peerId, username, stream }]
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peersRef = useRef({}); // { peerId -> RTCPeerConnection }
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);

  const username = localStorage.getItem("username") || "User";

  // ── Cleanup a single peer ─────────────────────────────
  const removePeer = useCallback((peerId) => {
    if (peersRef.current[peerId]) {
      peersRef.current[peerId].close();
      delete peersRef.current[peerId];
    }
    setParticipants((prev) => prev.filter((p) => p.peerId !== peerId));
  }, []);

  // ── Create RTCPeerConnection for a peer ───────────────
  const createPeerConnection = useCallback((peerId, peerUsername) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // ICE candidates
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit("voice-ice-candidate", { targetId: peerId, candidate });
      }
    };

    // Remote stream
    pc.ontrack = ({ streams }) => {
      const remoteStream = streams[0];
      setParticipants((prev) => {
        const exists = prev.find((p) => p.peerId === peerId);
        if (exists) {
          return prev.map((p) =>
            p.peerId === peerId ? { ...p, stream: remoteStream } : p
          );
        }
        return [...prev, { peerId, username: peerUsername, stream: remoteStream }];
      });
    };

    // Renegotiate when tracks change (e.g. turning on camera)
    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("voice-offer", { targetId: peerId, sdp: pc.localDescription });
      } catch (err) {
        console.error("Negotiation error:", err);
      }
    };

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        removePeer(peerId);
      }
    };

    peersRef.current[peerId] = pc;
    return pc;
  }, [removePeer]);

  // ── Socket event handlers ─────────────────────────────
  useEffect(() => {
    // Existing peers when we join
    socket.on("voice-room-peers", async (peers) => {
      for (const { peerId, username: peerUsername } of peers) {
        const pc = createPeerConnection(peerId, peerUsername);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("voice-offer", { targetId: peerId, sdp: offer });
      }
    });

    // New peer joined after us
    socket.on("voice-new-peer", ({ peerId, username: peerUsername }) => {
      // They will send us an offer; just add a placeholder
      setParticipants((prev) => {
        if (prev.find((p) => p.peerId === peerId)) return prev;
        return [...prev, { peerId, username: peerUsername, stream: null }];
      });
    });

    // Received offer from a peer
    socket.on("voice-offer", async ({ fromId, sdp }) => {
      let pc = peersRef.current[fromId];
      if (!pc) {
        const peerName = participants.find((p) => p.peerId === fromId)?.username || "User";
        pc = createPeerConnection(fromId, peerName);
      }
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("voice-answer", { targetId: fromId, sdp: answer });
    });

    // Received answer
    socket.on("voice-answer", async ({ fromId, sdp }) => {
      const pc = peersRef.current[fromId];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    // ICE candidate
    socket.on("voice-ice-candidate", async ({ fromId, candidate }) => {
      const pc = peersRef.current[fromId];
      if (pc) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      }
    });

    // Peer left
    socket.on("voice-peer-left", ({ peerId }) => removePeer(peerId));

    return () => {
      socket.off("voice-room-peers");
      socket.off("voice-new-peer");
      socket.off("voice-offer");
      socket.off("voice-answer");
      socket.off("voice-ice-candidate");
      socket.off("voice-peer-left");
    };
  }, [createPeerConnection, removePeer, participants]);

  // ── Join a voice room ─────────────────────────────────
  const joinVoiceRoom = useCallback(async (room) => {
    // Get microphone (audio only by default)
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
      alert("Microphone access denied. Please allow microphone access.");
      return;
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    setIsMuted(false);
    setIsCameraOn(false);
    setCurrentVoiceRoom(room);
    setParticipants([]);

    // Close any old peers
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};

    socket.emit("join-voice-room", { roomId: room.id, username });
  }, [username]);

  // ── Leave voice room ──────────────────────────────────
  const leaveVoiceRoom = useCallback(() => {
    socket.emit("leave-voice-room");

    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    // Close all peer connections
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};

    setLocalStream(null);
    setCurrentVoiceRoom(null);
    setParticipants([]);
    setIsMuted(false);
    setIsCameraOn(false);
    setIsScreenSharing(false);
  }, []);

  // ── Toggle Mute ───────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  }, []);

  // ── Toggle Camera ─────────────────────────────────────
  const toggleCamera = useCallback(async () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];

    if (videoTrack) {
      // Camera already on — turn off
      videoTrack.stop();
      localStreamRef.current.removeTrack(videoTrack);
      Object.values(peersRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track === videoTrack);
        if (sender) pc.removeTrack(sender);
      });
      setIsCameraOn(false);
    } else {
      // Turn on camera
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = camStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(newVideoTrack);
        Object.values(peersRef.current).forEach((pc) => {
          pc.addTrack(newVideoTrack, localStreamRef.current);
        });
        setIsCameraOn(true);
        // Update local stream reference for UI
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      } catch {
        alert("Camera access denied.");
      }
    }
  }, []);

  // ── Screen Share ──────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share, revert to camera/nothing
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        // Replace screen track with camera track in all peers
        Object.values(peersRef.current).forEach((pc) => {
          const sender = pc.getSenders().find(
            (s) => s.track === screenTrackRef.current
          );
          if (sender) pc.removeTrack(sender);
        });
        localStreamRef.current?.removeTrack(screenTrackRef.current);
        screenTrackRef.current = null;
      }
      setIsScreenSharing(false);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;

      // Replace video track in all peers
      Object.values(peersRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
        else pc.addTrack(screenTrack, localStreamRef.current);
      });

      localStreamRef.current?.addTrack(screenTrack);
      setIsScreenSharing(true);
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

      // Auto-stop when user clicks browser's "Stop Sharing"
      screenTrack.onended = () => {
        setIsScreenSharing(false);
        screenTrackRef.current = null;
      };
    } catch {
      // User cancelled
    }
  }, [isScreenSharing]);

  return (
    <VoiceContext.Provider
      value={{
        socket,
        currentVoiceRoom,
        participants,
        localStream,
        isMuted,
        isCameraOn,
        isScreenSharing,
        joinVoiceRoom,
        leaveVoiceRoom,
        toggleMute,
        toggleCamera,
        startScreenShare,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  return useContext(VoiceContext);
}

export { socket };
