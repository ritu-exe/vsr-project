package com.virtualstudyroom.aiservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ChatAIService {

    @Value("${openrouter.api.key}")
    private String openRouterApiKey;

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();
    private final ChatMemoryService memoryService;

    public ChatAIService(ChatMemoryService memoryService) {
        this.memoryService = memoryService;
    }

    public String getAIResponse(String userMessage) {
        try {
            memoryService.saveUserMessage(userMessage);

            var history = memoryService.getLastMessages(6);

            ArrayNode messages = mapper.createArrayNode();

            ObjectNode system = mapper.createObjectNode();
            system.put("role", "system");
            system.put("content",
                "You are a helpful AI assistant inside a virtual study room. " +
                "Give clear, concise, and human-like answers. " +
                "Do NOT use headings like ANSWER or NEXT YOU CAN. " +
                "Avoid unnecessary formatting. " +
                "Be natural, like a tutor helping a student.");
            messages.add(system);

            for (var msg : history) {
                ObjectNode node = mapper.createObjectNode();
                node.put("role", msg.getRole());
                node.put("content", msg.getContent());
                messages.add(node);
            }

            ObjectNode requestBody = mapper.createObjectNode();
            requestBody.put("model", "openai/gpt-4o-mini");
            requestBody.set("messages", messages);

            RequestBody body = RequestBody.create(
                mapper.writeValueAsString(requestBody),
                MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                .url(OPENROUTER_URL)
                .addHeader("Authorization", "Bearer " + openRouterApiKey)
                .addHeader("HTTP-Referer", "http://localhost:8082")
                .addHeader("X-Title", "Virtual Study Room")
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    return "OpenRouter error: " + response.code();
                }
                JsonNode root = mapper.readTree(response.body().string());
                String aiReply = root.get("choices").get(0).get("message").get("content").asText();
                memoryService.saveAssistantMessage(aiReply);
                return aiReply;
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "AI error occurred.";
        }
    }

    public String summarizeTranscript(String transcript) {
        return getAIResponse(
            "Summarize this YouTube transcript into clean and easy-to-understand study notes:\n\n" + transcript
        );
    }

    public String generateSmartNotes(String content) {
        return getAIResponse(
            "Convert this into structured study notes with bullet points, key ideas, and simple explanations:\n\n" + content
        );
    }

    public String activeLearningResponse(String topic) {
        return getAIResponse(
            "Teach this topic in a simple and engaging way. " +
            "First explain briefly, then ask one conceptual question, then one application-based question.\n\nTopic:\n" + topic
        );
    }

    public String followUpResponse(String content) {
        return getAIResponse(content);
    }
}
