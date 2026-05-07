package com.virtualstudyroom.aiservice.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PdfAIService {

    private final ChatAIService chatAIService;

    public PdfAIService(ChatAIService chatAIService) {
        this.chatAIService = chatAIService;
    }

    public String processPdf(MultipartFile file, String action, String question) {

        try (PDDocument document = PDDocument.load(file.getInputStream())) {

            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            // 🔥 LIMIT TEXT (IMPORTANT FOR API)
            if (text.length() > 12000) {
                text = text.substring(0, 12000);
            }

            // 🔥 ACTION HANDLING

            // 📝 NOTES
            if ("notes".equalsIgnoreCase(action)) {
                return chatAIService.generateSmartNotes(text);
            }

            // ❓ QUESTION ANSWERING
            if ("qa".equalsIgnoreCase(action)) {
                return chatAIService.getAIResponse(
                    "Answer this question based ONLY on the PDF:\n\n"
                    + "Question: " + question + "\n\n"
                    + "PDF Content:\n" + text
                );
            }

            // 📄 DEFAULT → SUMMARY
            return chatAIService.getAIResponse(
                "Summarize this PDF into clear and simple points:\n\n" + text
            );

        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to process PDF";
        }
    }
}