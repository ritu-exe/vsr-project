package com.virtualstudyroom.aiservice.controller;

import com.virtualstudyroom.aiservice.service.AIRouterService;
import com.virtualstudyroom.aiservice.service.PdfAIService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@CrossOrigin
public class AIController {

    private final AIRouterService aiRouterService;
    private final PdfAIService pdfAIService;

    public AIController(AIRouterService aiRouterService, PdfAIService pdfAIService) {
        this.aiRouterService = aiRouterService;
        this.pdfAIService = pdfAIService;
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String reply = aiRouterService.route(message);
        return Map.of("reply", reply);
    }

    @PostMapping("/pdf")
public Map<String, String> processPdf(
        @RequestParam("file") MultipartFile file,
        @RequestParam("action") String action,
        @RequestParam(value = "question", required = false) String question
) {
    String result = pdfAIService.processPdf(file, action, question);
    return Map.of("reply", result);
}
}
