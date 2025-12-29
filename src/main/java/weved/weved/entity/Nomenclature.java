package weved.weved.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
public class Nomenclature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_number", length = 50)
    private String documentNumber;

    @Column(name = "article", length = 50)
    private String article;

    @Column(name = "invoice_number", length = 50)
    private String invoiceNumber;

    @Column(name = "invoice_currency", length = 3)
    private String invoiceCurrency;

    @Column(name = "tnved_code", length = 10)
    private String tnvedCode;

    @Column(name = "import_permit", length = 100)
    private String importPermit;

    @Column(name = "invoice_name", length = 200)
    private String invoiceName;

    @Column(name = "russian_name", length = 200)
    private String russianName;

    // УБРАНО precision/scale для Double
    @Column(name = "weight")
    private Double weight;

    // ОСТАВЛЕНО для BigDecimal (здесь precision/scale допустимы)
    @Column(name = "total_weight", precision = 12, scale = 3)
    private BigDecimal totalWeight;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "total_quantity")
    private Integer totalQuantity;

    @Column(name = "shipped_quantity")
    private Integer shippedQuantity;

    @Column(name = "remaining_quantity")
    private Integer remainingQuantity;

    @Column(name = "country_of_origin", length = 2)
    private String countryOfOrigin;

    @Column(name = "unit", length = 10)
    private String unit;

    @Column(name = "vat", length = 10)
    private String vat;

    @Column(name = "duty", length = 10)
    private String duty;

    // УБРАНО precision/scale для Double
    @Column(name = "price_per_unit")
    private Double pricePerUnit;

    // УБРАНО precision/scale для Double
    @Column(name = "total_price")
    private Double totalPrice;
}
