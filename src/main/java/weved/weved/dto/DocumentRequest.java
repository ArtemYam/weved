package weved.weved.dto;

import lombok.Data;

@Data
public class DocumentRequest {
    private String documentNumber;
    private String createdAt;
    private String manager;
}
