package weved.weved.service;

import org.springframework.stereotype.Service;
import weved.weved.entity.User;
import weved.weved.repository.UserRepository;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getManagers() {
        return userRepository.findByRole("manager");  // ← укажите нужную роль
    }
}