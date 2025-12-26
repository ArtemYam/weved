package weved.weved.controllers;

import org.hibernate.cache.spi.support.AbstractReadWriteAccess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import weved.weved.dto.Item;
import weved.weved.dto.UploadResponse;
import weved.weved.service.ExcelService;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ExcelUploadController {

    @Autowired
    private ExcelService excelService;

    @PostMapping("/upload-excel")
    public ResponseEntity<UploadResponse> uploadExcel(@RequestParam("file") MultipartFile file) {
        try {
            List<Item> items = excelService.processExcel(file);
            return ResponseEntity.ok(new UploadResponse(String.valueOf(items)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UploadResponse("Ошибка обработки файла: " + e.getMessage()));
        }
    }
}
