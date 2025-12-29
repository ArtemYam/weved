package weved.weved.dto;

import lombok.Data;
import weved.weved.entity.Document;
import weved.weved.entity.Nomenclature;

import java.util.List;

@Data
public class DocumentWithNomenclatures {
    private Document document;
    private List<NomenclatureDto> nomenclatures;  // ← Теперь Dto с isDeleted


    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }

    public List<NomenclatureDto> getNomenclatures() { return nomenclatures; }
    public void setNomenclatures(List<NomenclatureDto> nomenclatures) { this.nomenclatures = nomenclatures; }
}
