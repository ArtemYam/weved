package weved.weved.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "documents")
@Data
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_number", unique = true, nullable = false, length = 6)
    private String documentNumber; // Исправлено: было 'number'

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt;

    @Column(name = "manager", nullable = false)
    private String manager;

    @Column(name = "status", nullable = false)
    private String status;
}
