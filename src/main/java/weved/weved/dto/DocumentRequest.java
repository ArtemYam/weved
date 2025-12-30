package weved.weved.dto;

import lombok.Data;

import java.util.List;

@Data
public class DocumentRequest {
    private String documentNumber;
    private String createdAt;
    private String manager;
    private String status;
    private List<NomenclatureDto> nomenclatures;
}
