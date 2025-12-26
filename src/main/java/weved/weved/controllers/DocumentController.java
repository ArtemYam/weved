package weved.weved.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import weved.weved.dto.DocumentRequest;
import weved.weved.entity.Document;
import weved.weved.service.DocumentService;


import java.time.LocalDate;
import java.time.LocalDateTime;
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
     *   JSON‑объект документа
     * @return сохранённый документ или ошибка
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveDocument(@RequestBody DocumentRequest request) {
        try {
            LocalDate createdAt = LocalDate.parse(request.getCreatedAt());  // Работает для "2025-12-26"
            String manager = request.getManager();  // ← Получаем строку "имя фамилия"
            String status= request.getStatus();

            Document saved = documentService.saveDocument(
                    request.getDocumentNumber(),
                    createdAt,
                    manager,
                    status
            );

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(singletonMap("error", e.getMessage()));
        }
    }
}
