package weved.weved.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "order_headers")
@Data
public class OrderHeader {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_number", length = 50)
    private String documentNumber;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "manager", length = 50)
    private String manager;

    @Column(name = "status", length = 50)
    private String status;
}
