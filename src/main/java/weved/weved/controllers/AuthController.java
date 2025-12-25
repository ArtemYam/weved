package weved.weved.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import weved.weved.dto.AuthRequest;
import weved.weved.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        if (authService.authenticate(authRequest)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(401)
                    .body("{\"message\": \"Неверные учётные данные\"}");
        }
    }
}
