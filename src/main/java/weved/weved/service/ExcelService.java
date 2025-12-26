package weved.weved.service;

import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import weved.weved.dto.Item;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExcelService {

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
        // Добавьте другие варианты названий при необходимости
    }


    public List<Item> processExcel(MultipartFile file) throws IOException {
        List<Item> items = new ArrayList<>();
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

            Item item = new Item();

            for (int colIndex = 0; colIndex <= row.getLastCellNum(); colIndex++) {
                Cell cell = row.getCell(colIndex);
                String fieldName = columnMapping.getOrDefault(colIndex, "unknown");


                if ("unknown".equals(fieldName)) continue;

                setFieldValue(item, fieldName, cell);
            }

            items.add(item);
        }

        workbook.close();
        return items;
    }

    private void setFieldValue(Item item, String fieldName, Cell cell) {
        if (cell == null) return;

        switch (fieldName) {
            case "article":
                item.setArticle(getStringValue(cell));
                break;
            case "tnvedCode":
                item.setTnvedCode(getStringValue(cell));
                break;
            case "invoiceName":
                item.setInvoiceName(getStringValue(cell));
                break;
            case "russianName":
                item.setRussianName(getStringValue(cell));
                break;
            case "weight":
                item.setWeight(getDoubleValue(cell));
                break;
            case "quantity":
                item.setQuantity(getIntValue(cell));
                break;
            case "unit":
                item.setUnit(getStringValue(cell));
                break;
            case "vat":
                item.setVat(getStringValue(cell));
                break;
            case "duty":
                item.setDuty(getStringValue(cell));
                break;
            case "pricePerUnit":
                item.setPricePerUnit(getDoubleValue(cell));
                break;
            case "totalPrice":
                item.setTotalPrice(getDoubleValue(cell));
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
}
