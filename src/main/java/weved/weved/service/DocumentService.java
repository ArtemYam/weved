package weved.weved.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import weved.weved.entity.Document;
import weved.weved.entity.Nomenclature;
import weved.weved.repository.DocumentRepository;
import weved.weved.repository.NomenclatureRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private NomenclatureRepository nomenclatureRepository;

    @Transactional
    public Document saveDocument(String documentNumber, LocalDateTime createdAt,
                                 String manager, String status) {

        Document newDoc = new Document();
        newDoc.setDocumentNumber(documentNumber);
        newDoc.setCreatedAt(createdAt);
        newDoc.setManager(manager);
        newDoc.setStatus(status);


        return documentRepository.save(newDoc);  // ← Всегда INSERT
    }

    public String generateNextNumber() {
        // Получаем последний сохранённый номер
        String lastNumber = documentRepository.findLastNumber();

        // Если в БД нет документов — начинаем с "000001"
        if (lastNumber == null || lastNumber.trim().isEmpty()) {
            return "000001";
        }

        try {
            // Преобразуем строку в число, увеличиваем на 1
            int nextInt = Integer.parseInt(lastNumber.trim()) + 1;
            // Форматируем в строку с ведущими нулями (6 знаков)
            return String.format("%06d", nextInt);
        } catch (NumberFormatException e) {
            // Если номер в БД не числовой — логируем ошибку и возвращаем начальный номер
            System.err.println("Ошибка формата номера в БД: " + lastNumber);
            return "000001";
        }
    }

    @Transactional
    public Document saveOrUpdateDocument(String documentNumber, LocalDateTime createdAt,
                                         String manager, String status,
                                         List<Nomenclature> nomenclatures) {

        // 1. Ищем существующий документ по номеру
        Document document = documentRepository.findByDocumentNumber(documentNumber)
                .orElse(new Document());

        // 2. Обновляем поля документа
        document.setDocumentNumber(documentNumber);
        document.setCreatedAt(createdAt);
        document.setManager(manager);
        document.setStatus(status);

        // 3. Сохраняем документ (ID может быть новым или существующим)
        document = documentRepository.save(document);

        // 4. Удаляем всю старую номенклатуру для этого документа
        nomenclatureRepository.deleteByDocumentNumber(documentNumber);

        // 5. Сохраняем новую номенклатуру
        for (Nomenclature item : nomenclatures) {
            item.setDocumentNumber(documentNumber); // Убедимся, что номер документа задан
            nomenclatureRepository.save(item);
        }

        return document;
    }
}


