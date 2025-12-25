package weved.weved.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import weved.weved.dto.AuthRequest;
import weved.weved.repository.UserRepository;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean authenticate(AuthRequest authRequest) {
        return userRepository.findByUsername(authRequest.getUsername())
                .map(user -> passwordEncoder.matches(authRequest.getPassword(), user.getPassword()))
                .orElse(false);
    }
}
