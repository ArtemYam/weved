package weved.weved.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import weved.weved.entity.Document;
import weved.weved.repository.DocumentRepository;

import java.time.LocalDateTime;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Transactional
    public String getNextDocumentNumber() {
        // Получаем максимальный номер из БД
        String maxNumberStr = documentRepository.findMaxDocumentNumber();

        long nextNumber;
        if (maxNumberStr == null || maxNumberStr.isEmpty()) {
            nextNumber = 1;
        } else {
            try {
                nextNumber = Long.parseLong(maxNumberStr) + 1;
            } catch (NumberFormatException e) {
                nextNumber = 1; // если формат не числовой — начинаем с 1
            }
        }

        // Создаём и сохраняем документ
        Document document = new Document();
        document.setNumber(String.valueOf(nextNumber));
        document.setCreatedAt(LocalDateTime.now());
        documentRepository.save(document);

        return String.valueOf(nextNumber);
    }
}
