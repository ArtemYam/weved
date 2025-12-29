package weved.weved.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_number", nullable = false, length = 50)
    private String documentNumber;

    @Column(name = "article", length = 50)
    private String article;

    @Column(name = "tnved_code", length = 10)
    private String tnvedCode;

    @Column(name = "invoice_name", length = 200)
    private String invoiceName;

    @Column(name = "russian_name", length = 200)
    private String russianName;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit", length = 10)
    private String unit;

    @Column(name = "vat", length = 10)
    private String vat;

    @Column(name = "duty", length = 10)
    private String duty;

    @Column(name = "price_per_unit")
    private Double pricePerUnit;

    @Column(name = "total_price")
    private Double totalPrice;
}
