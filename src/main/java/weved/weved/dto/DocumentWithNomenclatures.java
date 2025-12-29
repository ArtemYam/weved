package weved.weved.dto;

import lombok.Data;
import weved.weved.entity.Document;
import weved.weved.entity.Nomenclature;

import java.util.List;

@Data
public class DocumentWithNomenclatures {
    private Document document;
    private List<Nomenclature> nomenclatures;

}
