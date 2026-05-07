package com.virtualstudyroom.aiservice.config;

import okhttp3.OkHttpClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAIConfig {

    @Bean
    public OkHttpClient openAIHttpClient() {
        return new OkHttpClient();
    }
}
