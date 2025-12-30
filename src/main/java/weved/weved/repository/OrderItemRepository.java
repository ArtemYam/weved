package weved.weved.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import weved.weved.entity.OrderItem;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    void deleteByDocumentNumber(String documentNumber);
    List<OrderItem> findByDocumentNumber(String documentNumber);

}



