import React, { useState, useEffect } from "react";
import { getMe, sendFriendRequest, acceptFriendRequest, acceptServerInvite } from "../services/api";

function Friends() {
  const [data, setData] = useState({ friends: [], friendRequests: [], serverInvites: [] });
  const [newFriend, setNewFriend] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const me = await getMe();
      setData(me);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll every 5s for invites (discord style)
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendRequest = async () => {
    if (!newFriend.trim()) return;
    try {
      await sendFriendRequest(newFriend);
      alert(`Friend request sent to ${newFriend}!`);
      setNewFriend("");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAcceptRequest = async (username) => {
    try {
      await acceptFriendRequest(username);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAcceptInvite = async (serverId) => {
    try {
      await acceptServerInvite(serverId);
      alert("Successfully joined the server! Please refresh your sidebar to see it.");
      loadData();
      window.location.reload(); // Quick refresh to update the sidebar servers
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={styles.container}>Loading friends...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Friends & Invites</h2>

      <div style={styles.addFriendBox}>
        <h3 style={styles.subtitle}>Add Friend</h3>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 10 }}>
          You can add friends with their Virtual Study Room username.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            placeholder="Enter username"
            style={styles.input}
          />
          <button onClick={handleSendRequest} style={styles.btn}>Send Friend Request</button>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.subtitle}>Pending Requests ({data.friendRequests.length})</h3>
        {data.friendRequests.length === 0 && <p style={styles.empty}>No pending friend requests.</p>}
        {data.friendRequests.map((r, i) => (
          <div key={i} style={styles.card}>
            <div>
              <strong>{r.from}</strong> wants to be friends.
            </div>
            <button onClick={() => handleAcceptRequest(r.from)} style={styles.btnAccept}>Accept</button>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.subtitle}>Server Invites ({data.serverInvites.length})</h3>
        {data.serverInvites.length === 0 && <p style={styles.empty}>No pending server invites.</p>}
        {data.serverInvites.map((inv, i) => (
          <div key={i} style={styles.card}>
            <div>
              <strong>{inv.from}</strong> invited you to <strong>{inv.serverName}</strong>
            </div>
            <button onClick={() => handleAcceptInvite(inv.serverId)} style={styles.btnAccept}>Join Server</button>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.subtitle}>My Friends ({data.friends.length})</h3>
        {data.friends.length === 0 && <p style={styles.empty}>You haven't added any friends yet.</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {data.friends.map((f, i) => (
            <div key={i} style={styles.friendBadge}>👤 {f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    color: "#f1f5f9",
    maxWidth: 800,
    margin: "0 auto",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#e2e8f0",
  },
  addFriendBox: {
    background: "rgba(99, 102, 241, 0.1)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 10,
    color: "#c7d2fe",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 8,
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    outline: "none",
  },
  btn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 30,
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    marginBottom: 10,
  },
  empty: {
    color: "#64748b",
    fontStyle: "italic",
  },
  btnAccept: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
  },
  friendBadge: {
    padding: "8px 16px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.1)",
  }
};

export default Friends;
