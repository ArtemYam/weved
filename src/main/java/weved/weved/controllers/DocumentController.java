package weved.weved.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import weved.weved.entity.Document;
import weved.weved.service.DocumentService;


import java.util.Map;
import static java.util.Collections.singletonMap;


@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Возвращает следующий доступный номер документа.
     * @return JSON с ключом "documentNumber"
     */
    @GetMapping("/next-number")
    public ResponseEntity<Map<String, String>> getNextNumber() {
        try {
            String number = documentService.generateNextNumber();
            return ResponseEntity.ok(singletonMap("documentNumber", number));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(singletonMap("error", e.getMessage()));
        }
    }

    /**
     * Сохраняет документ. Если номер занят — генерирует новый.
     * @param document JSON‑объект документа
     * @return сохранённый документ или ошибка
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveDocument(@RequestBody Document document) {
        try {
            Document saved = documentService.saveDocument(document);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(singletonMap("error", e.getMessage()));
        }
    }
}
