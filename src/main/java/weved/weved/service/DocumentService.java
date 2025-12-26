package weved.weved.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import weved.weved.entity.Document;
import weved.weved.repository.DocumentRepository;

import java.time.LocalDate;

@Service
@Transactional
public class DocumentService {

    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    /**
     * Генерирует следующий 6‑значный номер документа.
     * Пример: 000001, 000002, ..., 999999.
     * @return новый номер в формате "00000X"
     * @throws RuntimeException если превышен лимит (999 999)
     */
    public String generateNextNumber() {
        String lastNumber = documentRepository.findLastNumber();
        int nextSequence = 1;

        if (lastNumber != null) {
            try {
                int currentSequence = Integer.parseInt(lastNumber);
                nextSequence = currentSequence + 1;

                if (nextSequence > 999_999) {
                    throw new RuntimeException("Превышено максимальное число документов (999 999)");
                }
            } catch (NumberFormatException e) {
                throw new RuntimeException("Некорректный формат номера в БД: " + lastNumber, e);
            }
        }

        return String.format("%06d", nextSequence);
    }

    /**
     * Сохраняет документ. Если номер уже существует — генерирует новый.
     * @return сохранённый документ с уникальным номером
     */
    public Document saveDocument(String documentNumber, LocalDate createdAt, String manager,String status) {
        Document document = new Document();

        if (documentNumber == null || documentRepository.existsByDocumentNumber(documentNumber)) {
            documentNumber = generateNextNumber();
        }

        document.setDocumentNumber(documentNumber);
        document.setCreatedAt(createdAt);  // Теперь LocalDate
        document.setManager(manager);  // ← Сохраняем "имя фамилия"
        document.setStatus(status);

        return documentRepository.save(document);
    }

}
