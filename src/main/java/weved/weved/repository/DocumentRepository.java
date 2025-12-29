package weved.weved.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import weved.weved.entity.Document;
import weved.weved.entity.Nomenclature;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query(
            value = "SELECT document_number FROM documents ORDER BY CAST(document_number AS INTEGER) DESC LIMIT 1",
            nativeQuery = true
    )
    String findLastNumber();

    boolean existsByDocumentNumber(String documentNumber);


    // Стандартный метод Spring Data JPA
    Optional<Document> findByDocumentNumber(String documentNumber);
}

