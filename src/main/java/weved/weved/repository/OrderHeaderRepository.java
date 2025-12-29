package weved.weved.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import weved.weved.entity.OrderHeader;

public interface OrderHeaderRepository extends JpaRepository<OrderHeader, Long> {
    OrderHeader findByDocumentNumber(String documentNumber);
}


