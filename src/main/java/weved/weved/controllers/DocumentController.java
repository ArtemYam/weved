package weved.weved.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import weved.weved.dto.DocumentRequest;
import weved.weved.entity.Document;
import weved.weved.entity.Nomenclature;
import weved.weved.repository.DocumentRepository;
import weved.weved.repository.NomenclatureRepository;
import weved.weved.service.DocumentService;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import static java.util.Collections.singletonMap;


@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private NomenclatureRepository nomenclatureRepository;

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
            LocalDateTime  createdAt = LocalDateTime .parse(request.getCreatedAt());  // Работает для "2025-12-26"
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

    @GetMapping("/documents/{documentNumber}")
    public ResponseEntity<Document> getDocument(@PathVariable String documentNumber) {
        return documentRepository.findByDocumentNumber(documentNumber)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/nomenclatures/{documentNumber}")
    public ResponseEntity<List<Nomenclature>> getNomenclatures(@PathVariable String documentNumber) {
        List<Nomenclature> noms = nomenclatureRepository.findByDocumentNumber(documentNumber);
        return noms.isEmpty()
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(noms);
    }
}
