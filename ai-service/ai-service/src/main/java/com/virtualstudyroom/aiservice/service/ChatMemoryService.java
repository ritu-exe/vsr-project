package com.virtualstudyroom.aiservice.service;

import com.virtualstudyroom.aiservice.model.ChatMessage;
import com.virtualstudyroom.aiservice.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatMemoryService {

    private final ChatMessageRepository repository;

    public ChatMemoryService(ChatMessageRepository repository) {
        this.repository = repository;
    }

    public void saveUserMessage(String message) {
        repository.save(new ChatMessage("user", message));
    }

    public void saveAssistantMessage(String message) {
        repository.save(new ChatMessage("assistant", message));
    }

    public List<ChatMessage> getLastMessages(int limit) {
        long total = repository.count();
        int skip = (int) Math.max(total - limit, 0);
        return repository.findAll().stream()
                .skip(skip)
                .collect(java.util.stream.Collectors.toList());
    }
}
