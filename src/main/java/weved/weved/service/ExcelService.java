package weved.weved.service;

import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import weved.weved.entity.Document;
import weved.weved.entity.Nomenclature;
import weved.weved.repository.DocumentRepository;
import weved.weved.repository.NomenclatureRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExcelService {

    @Autowired
    private NomenclatureRepository nomenclatureRepository;

    @Autowired
    private DocumentRepository documentRepository;

    // Сопоставление возможных названий столбцов Excel с полями модели
    private static final Map<String, String> COLUMN_MAPPING = new HashMap<>();
    static {
        COLUMN_MAPPING.put("артикул", "article");
        COLUMN_MAPPING.put("код тнвд", "tnvedCode");
        COLUMN_MAPPING.put("наименование в инвойсе", "invoiceName");
        COLUMN_MAPPING.put("наименование на русском", "russianName");
        COLUMN_MAPPING.put("вес", "weight");
        COLUMN_MAPPING.put("количество", "quantity");
        COLUMN_MAPPING.put("единица измерения", "unit");
        COLUMN_MAPPING.put("ндс", "vat");
        COLUMN_MAPPING.put("пошлина", "duty");
        COLUMN_MAPPING.put("цена за шт", "pricePerUnit");
        COLUMN_MAPPING.put("стоимость итого", "totalPrice");
        //  другие варианты названий при необходимости
    }


    public List<Nomenclature> processExcel(MultipartFile file) throws IOException {
        List<Nomenclature> nomenclatures = new ArrayList<>();
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        // Читаем заголовки из первой строки
        Row headerRow = sheet.getRow(0);
        Map<Integer, String> columnMapping = new HashMap<>();


        for (Cell cell : headerRow) {
            String header = cell.getStringCellValue().trim().toLowerCase();
            String fieldName = COLUMN_MAPPING.getOrDefault(header, "unknown");
            columnMapping.put(cell.getColumnIndex(), fieldName);
        }

        // Обрабатываем данные (начиная со 2‑й строки)
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            Nomenclature nomenclature = new Nomenclature();

            for (int colIndex = 0; colIndex <= row.getLastCellNum(); colIndex++) {
                Cell cell = row.getCell(colIndex);
                String fieldName = columnMapping.getOrDefault(colIndex, "unknown");


                if ("unknown".equals(fieldName)) continue;

                setFieldValue(nomenclature, fieldName, cell);
            }

            nomenclatures.add(nomenclature);
        }

        workbook.close();
        return nomenclatures;
    }

    private void setFieldValue(Nomenclature nomenclature, String fieldName, Cell cell) {
        if (cell == null) return;

        switch (fieldName) {
            case "article":
                nomenclature.setArticle(getStringValue(cell));
                break;
            case "tnvedCode":
                nomenclature.setTnvedCode(getStringValue(cell));
                break;
            case "invoiceName":
                nomenclature.setInvoiceName(getStringValue(cell));
                break;
            case "russianName":
                nomenclature.setRussianName(getStringValue(cell));
                break;
            case "weight":
                nomenclature.setWeight(getDoubleValue(cell));
                break;
            case "quantity":
                nomenclature.setQuantity(getIntValue(cell));
                break;
            case "unit":
                nomenclature.setUnit(getStringValue(cell));
                break;
            case "vat":
                nomenclature.setVat(getStringValue(cell));
                break;
            case "duty":
                nomenclature.setDuty(getStringValue(cell));
                break;
            case "pricePerUnit":
                nomenclature.setPricePerUnit(getDoubleValue(cell));
                break;
            case "totalPrice":
                nomenclature.setTotalPrice(getDoubleValue(cell));
                break;
        }
    }
    // Утилиты для извлечения значений
    private String getStringValue(Cell cell) {
        return cell != null ? cell.toString() : "";
    }

    private Double getDoubleValue(Cell cell) {
        return cell != null && cell.getCellType() == CellType.NUMERIC
                ? cell.getNumericCellValue() : 0.0;
    }

    private Integer getIntValue(Cell cell) {
        return cell != null && cell.getCellType() == CellType.NUMERIC
                ? (int) cell.getNumericCellValue() : 0;
    }

    public List<Nomenclature> getNomenclatureByDocumentNumber(String documentNumber) {
        return nomenclatureRepository.findByDocumentNumber(documentNumber);
    }

    @Transactional
    public void saveDocument(Document data) {
        documentRepository.save(data);
    }

    @Transactional
    public void saveNomenclature (Nomenclature nomenclature) {
        nomenclatureRepository.save(nomenclature);
    }

}
