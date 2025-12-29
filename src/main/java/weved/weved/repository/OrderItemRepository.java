package weved.weved.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import weved.weved.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    void deleteByDocumentNumber(String documentNumber);
}
