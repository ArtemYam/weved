package weved.weved.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import weved.weved.entity.Document;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    // Находим максимальный номер документа для генерации следующего
    @Query("SELECT MAX(d.number) FROM Document d")
    String findMaxDocumentNumber();


}
