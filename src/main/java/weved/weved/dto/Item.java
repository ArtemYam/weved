package weved.weved.dto;

import lombok.Data;

@Data
public class Item {
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
