package weved.weved.dto;

import lombok.Data;
import weved.weved.entity.Nomenclature;

import java.util.ArrayList;
import java.util.List;

@Data
public class UploadResponse {
    private List<Nomenclature> nomenclatures;
    private String message;

    public UploadResponse(List<Nomenclature> nomenclatures) {
        this.nomenclatures = nomenclatures;
        this.message = "Успешно";
    }

    public UploadResponse(String message) {
        this.nomenclatures = new ArrayList<>();
        this.message = message;
    }
}
