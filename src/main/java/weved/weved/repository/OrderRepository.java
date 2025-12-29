package weved.weved.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import weved.weved.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
