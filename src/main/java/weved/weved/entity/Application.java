package weved.weved.entity;

import jakarta.persistence.*;
import lombok.Data;


import java.time.LocalDate;
@Data
@Entity
@Table (name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String applicationNumber;
    private LocalDate applicationDate;
    private String manager;

}
