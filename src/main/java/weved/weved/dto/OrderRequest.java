package weved.weved.dto;

import java.util.List;
import lombok.Data;
import weved.weved.entity.Document;

@Data
public class OrderRequest {
    private Document document;
    private List<NomenclatureDto> nomenclatures;
}
