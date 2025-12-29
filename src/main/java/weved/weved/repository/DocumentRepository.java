package weved.weved.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import weved.weved.entity.Document;
import weved.weved.entity.Nomenclature;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    //Находит максимальный номер документа в числовом порядке
    @Query(
            value = "SELECT document_number FROM documents ORDER " +
                    "BY CAST(document_number AS INTEGER) DESC LIMIT 1",
            nativeQuery = true
    )
    String findLastNumber();

    //Проверяет существование документа по номеру.
    boolean existsByDocumentNumber(String documentNumber);

    List<Nomenclature> findByDocumentNumber(String documentNumber);

}
