package weved.weved.dto;


import lombok.Data;

import java.time.LocalDate;
@Data
public class OrderHeaderDto {
    private String documentNumber;
    private LocalDate createdAt;
    private String manager;
    private String status;

    public OrderHeaderDto(String documentNumber, LocalDate createdAt, String manager, String status) {
        this.documentNumber = documentNumber;
        this.createdAt = createdAt;
        this.manager = manager;
        this.status = status;
    }
}
