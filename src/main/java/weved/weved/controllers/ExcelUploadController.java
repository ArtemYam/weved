package weved.weved.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import weved.weved.entity.Item;
import weved.weved.dto.UploadResponse;
import weved.weved.entity.Document;
import weved.weved.service.ExcelService;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ExcelUploadController {

    @Autowired
    private ExcelService excelService;

    // Только парсинг файла — без сохранения в БД
    @PostMapping("/parse-excel")
    public ResponseEntity<UploadResponse> parseExcel(@RequestParam("file") MultipartFile file) {
        try {
            List<Item> items = excelService.processExcel(file);
            return ResponseEntity.ok(new UploadResponse(items));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UploadResponse("Ошибка обработки файла: " + e.getMessage()));
        }
    }

    // Endpoint для сохранения (пока не используется)
    @PostMapping("/save-document")
    public ResponseEntity<String> saveDocument(@RequestBody Document data) {
        // Здесь будет логика сохранения в БД (позже)
        return ResponseEntity.ok("Сохранено (временно)");
    }
}

