package weved.weved.service;

import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import weved.weved.dto.NomenclatureDto;
import weved.weved.entity.Document;
import weved.weved.entity.Nomenclature;
import weved.weved.repository.DocumentRepository;
import weved.weved.repository.NomenclatureRepository;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

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
    public void saveNomenclatures(List<NomenclatureDto> dtoList) {
        if (dtoList.isEmpty()) {
            return; // Ничего не делаем, если список пуст
        }

        // Получаем documentNumber из первого элемента (предполагаем, что все элементы имеют одинаковый documentNumber)
        String documentNumber = dtoList.get(0).getDocumentNumber();

        // 1. Получаем все существующие записи для этого documentNumber
        List<Nomenclature> existingRecords = nomenclatureRepository.findByDocumentNumber(documentNumber);

        // Создаём множество артикулов из переданных DTO
        Set<String> keptArticles = dtoList.stream()
                .filter(dto -> !dto.isDeleted()) // Учитываем только не удалённые строки
                .map(NomenclatureDto::getArticle)
                .collect(Collectors.toSet());

        // 2. Удаляем все записи, которых нет в keptArticles
        for (Nomenclature record : existingRecords) {
            if (!keptArticles.contains(record.getArticle())) {
                nomenclatureRepository.delete(record);
                System.out.println("Удалена номенклатура: " + record.getArticle() +
                        " (документ " + documentNumber + ")");
            }
        }

        // 3. Обрабатываем оставшиеся записи (обновление/создание)
        for (NomenclatureDto dto : dtoList) {
            if (dto.isDeleted()) {
                continue; // Уже удалены выше
            }

            Nomenclature existing = nomenclatureRepository
                    .findByDocumentNumberAndArticle(dto.getDocumentNumber(), dto.getArticle());

            if (existing != null) {
                // Обновляем существующую запись
                updateNomenclatureFromDto(existing, dto);
                System.out.println("Обновлена номенклатура: " + dto.getArticle() +
                        " (документ " + dto.getDocumentNumber() + ")");
            } else {
                // Создаём новую запись
                Nomenclature newNomenclature = createNomenclatureFromDto(dto);
                nomenclatureRepository.save(newNomenclature);
                System.out.println("Добавлена новая номенклатура: " + dto.getArticle() +
                        " (документ " + dto.getDocumentNumber() + ")");
            }
        }
    }

    private void updateNomenclatureFromDto(Nomenclature entity, NomenclatureDto dto) {
        entity.setTnvedCode(dto.getTnvedCode());
        entity.setInvoiceName(dto.getInvoiceName());
        entity.setRussianName(dto.getRussianName());
        entity.setWeight(dto.getWeight());
        entity.setQuantity(dto.getQuantity());
        entity.setUnit(dto.getUnit());
        entity.setVat(dto.getVat());
        entity.setDuty(dto.getDuty());
        entity.setPricePerUnit(dto.getPricePerUnit());
        entity.setTotalPrice(dto.getTotalPrice());
    }

    private Nomenclature createNomenclatureFromDto(NomenclatureDto dto) {
        Nomenclature nomenclature = new Nomenclature();
        nomenclature.setArticle(dto.getArticle());
        nomenclature.setTnvedCode(dto.getTnvedCode());
        nomenclature.setInvoiceName(dto.getInvoiceName());
        nomenclature.setRussianName(dto.getRussianName());
        nomenclature.setWeight(dto.getWeight());
        nomenclature.setQuantity(dto.getQuantity());
        nomenclature.setUnit(dto.getUnit());
        nomenclature.setVat(dto.getVat());
        nomenclature.setDuty(dto.getDuty());
        nomenclature.setPricePerUnit(dto.getPricePerUnit());
        nomenclature.setTotalPrice(dto.getTotalPrice());
        nomenclature.setDocumentNumber(dto.getDocumentNumber());
        return nomenclature;
    }

}

