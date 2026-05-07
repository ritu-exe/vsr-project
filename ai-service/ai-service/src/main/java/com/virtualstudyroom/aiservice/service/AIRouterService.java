package com.virtualstudyroom.aiservice.service;

import org.springframework.stereotype.Service;

@Service
public class AIRouterService {

    private final YouTubeAIService youTubeAIService;
    private final ChatAIService chatAIService;

    public AIRouterService(ChatAIService chatAIService,
                           YouTubeAIService youTubeAIService) {
        this.chatAIService = chatAIService;
        this.youTubeAIService = youTubeAIService;
    }
public String route(String userMessage) {

    String msg = userMessage.toLowerCase();

    if (msg.startsWith("learn:")) {
        String topic = userMessage.substring(6).trim();
        return chatAIService.activeLearningResponse(topic);
    }

    if (msg.startsWith("notes:")) {
        String content = userMessage.substring(6).trim();
        return chatAIService.generateSmartNotes(content);
    }

    if (msg.startsWith("youtube:")) {
        String transcript = userMessage.substring(8).trim();
        return chatAIService.summarizeTranscript(transcript);
    }

    return chatAIService.followUpResponse(userMessage);
}


}
