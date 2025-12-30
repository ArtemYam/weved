package weved.weved.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import weved.weved.dto.DocumentRequest;
import weved.weved.entity.Document;
import weved.weved.entity.Nomenclature;
import weved.weved.repository.DocumentRepository;
import weved.weved.repository.NomenclatureRepository;
import weved.weved.service.DocumentService;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
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
            LocalDateTime createdAt = LocalDateTime.parse(request.getCreatedAt());
            String manager = request.getManager();
            String status = request.getStatus();

            // Преобразуем DTO в сущности Nomenclature
            List<Nomenclature> nomenclatures = request.getNomenclatures().stream()
                    .map(dto -> {
                        Nomenclature n = new Nomenclature();
                        n.setArticle(dto.getArticle());
                        n.setTnvedCode(dto.getTnvedCode());
                        n.setInvoiceName(dto.getInvoiceName());
                        n.setRussianName(dto.getRussianName());
                        n.setWeight(dto.getWeight());
                        n.setQuantity(dto.getQuantity());
                        n.setUnit(dto.getUnit());
                        n.setVat(dto.getVat());
                        n.setDuty(dto.getDuty());
                        n.setPricePerUnit(dto.getPricePerUnit());
                        n.setTotalPrice(dto.getTotalPrice());
                        return n;
                    })
                    .toList();

            Document saved = documentService.saveOrUpdateDocument(
                    request.getDocumentNumber(),
                    createdAt,
                    manager,
                    status,
                    nomenclatures
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

    @GetMapping("/active")
    public ResponseEntity<List<Document>> getActiveDocuments() {
        List<Document> documents = documentRepository.findAll(); // Или фильтруйте по статусу
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{documentNumber}/full")
    public ResponseEntity<Map<String, Object>> getDocumentWithNomenclatures(@PathVariable String documentNumber) {
        Document doc = documentRepository.findByDocumentNumber(documentNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Документ не найден"));

        List<Nomenclature> items = nomenclatureRepository.findByDocumentNumber(documentNumber);


        Map<String, Object> response = new HashMap<>();
        response.put("document", doc);
        response.put("nomenclatures", items);


        return ResponseEntity.ok(response);
    }

    @PutMapping("/{documentNumber}")
    public ResponseEntity<?> updateDocument(
            @PathVariable String documentNumber,
            @RequestBody DocumentRequest request
    ) {
        try {
            Document existingDoc = documentRepository.findByDocumentNumber(documentNumber)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Документ не найден"
                    ));

            existingDoc.setManager(request.getManager());
            existingDoc.setStatus(request.getStatus());

            Document updatedDoc = documentRepository.save(existingDoc);

            return ResponseEntity.ok(updatedDoc);

        } catch (ResponseStatusException e) {
            // Возвращаем JSON с ошибкой
            Map<String, String> errorBody = Map.of("error", e.getReason());
            return ResponseEntity
                    .status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorBody);
        } catch (Exception e) {
            // Любая другая ошибка → 500 + JSON
            Map<String, String> errorBody = Map.of("error", "Внутренняя ошибка сервера: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorBody);
        }
    }

}
