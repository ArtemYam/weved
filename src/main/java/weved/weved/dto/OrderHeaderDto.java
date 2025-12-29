package weved.weved.dto;


import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OrderHeaderDto {
    private String documentNumber;
    private LocalDateTime createdAt;
    private String manager;
    private String status;

    public OrderHeaderDto(String documentNumber, LocalDateTime  createdAt, String manager, String status) {
        this.documentNumber = documentNumber;
        this.createdAt = createdAt;
        this.manager = manager;
        this.status = status;
    }
}
