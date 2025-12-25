package weved.weved.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import weved.weved.entity.Application;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
}
