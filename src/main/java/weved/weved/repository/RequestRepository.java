package weved.weved.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import weved.weved.entity.Request;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
}

