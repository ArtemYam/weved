package weved.weved.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import weved.weved.entity.Nomenclature;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NomenclatureRepository extends JpaRepository<Nomenclature, Long> {
    List<Nomenclature> findByDocumentNumber(String documentNumber);

    // Новый метод: найти номенклатуру по документу и артикулу
    Nomenclature findByDocumentNumberAndArticle(String documentNumber, String article);

    @Modifying
    @Query("DELETE FROM Nomenclature n WHERE n.documentNumber = :documentNumber")
    void deleteByDocumentNumber(String documentNumber);
}
