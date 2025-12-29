package weved.weved.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import weved.weved.entity.Nomenclature;

import java.util.List;

@Repository
public interface NomenclatureRepository extends JpaRepository<Nomenclature, Long> {
    List<Nomenclature> findByDocumentNumber(String documentNumber);

}




