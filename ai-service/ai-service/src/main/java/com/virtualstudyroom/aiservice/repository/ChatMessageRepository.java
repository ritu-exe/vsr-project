package com.virtualstudyroom.aiservice.repository;

import com.virtualstudyroom.aiservice.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
}
