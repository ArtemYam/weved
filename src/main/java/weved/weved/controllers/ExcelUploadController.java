package weved.weved.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import weved.weved.dto.DocumentWithNomenclatures;
import weved.weved.entity.Nomenclature;
import weved.weved.dto.UploadResponse;
import weved.weved.entity.Document;
import weved.weved.service.ExcelService;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ExcelUploadController {

    @Autowired
    private ExcelService excelService;

    // GET: получить номенклатуру по номеру документа
    @GetMapping("/nomenclature/{documentNumber}")
    public ResponseEntity<List<Nomenclature>> getNomenclatureByDocumentNumber(
            @PathVariable String documentNumber) {

        try {
            List<Nomenclature> nomenclatures = excelService.getNomenclatureByDocumentNumber(documentNumber);
            if (nomenclatures.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(nomenclatures);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    // POST: сохранить документ в БД
    @PostMapping("/save-document")
    public ResponseEntity<String> saveDocument(@RequestBody DocumentWithNomenclatures data) {
        try {
            excelService.saveDocument(data.getDocument());

            for (Nomenclature nomenclature : data.getNomenclatures()) {
                excelService.saveNomenclature(nomenclature);
            }

            return ResponseEntity.ok("Документ и номенклатуры сохранены");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Ошибка: " + e.getMessage());
        }
    }


    // Существующий метод для парсинга Excel
    @PostMapping("/parse-excel")
    public ResponseEntity<UploadResponse> parseExcel(@RequestParam("file") MultipartFile file) {
        try {
            List<Nomenclature> nomenclatures = excelService.processExcel(file);
            return ResponseEntity.ok(new UploadResponse(nomenclatures));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UploadResponse("Ошибка обработки файла: " + e.getMessage()));
        }
    }
}
