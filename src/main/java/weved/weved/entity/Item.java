package weved.weved.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Обязательно для JPA


    private String documentNumber;
    private String article;
    private String tnvedCode;
    private String invoiceName;
    private String russianName;
    private Double weight;
    private Integer quantity;
    private String unit;
    private String vat;
    private String duty;
    private Double pricePerUnit;
    private Double totalPrice;
}
