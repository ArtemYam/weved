package weved.weved.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import weved.weved.service.DocumentService;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/zaproskp")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/next-number")
    public ResponseEntity<Map<String, String>> getNextDocumentNumber() {
        String nextNumber = documentService.getNextDocumentNumber();

        return ResponseEntity.ok(Collections.singletonMap("number", nextNumber));
    }
}
