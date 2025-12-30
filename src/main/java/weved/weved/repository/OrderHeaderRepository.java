package weved.weved.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import weved.weved.entity.OrderHeader;

import java.util.List;

public interface OrderHeaderRepository extends JpaRepository<OrderHeader, Long> {
    OrderHeader findByDocumentNumber(String documentNumber);


    @Query("SELECT o FROM OrderHeader o " +
            "WHERE o.status <> 'завершена' " +  // Исключаем завершённые
            "  AND (o.documentNumber, o.createdAt) IN (" +
            "      SELECT oh.documentNumber, MAX(oh.createdAt) " +
            "      FROM OrderHeader oh " +
            "      GROUP BY oh.documentNumber" +
            ")")
    List<OrderHeader> findLatestActiveOrders();


    }


