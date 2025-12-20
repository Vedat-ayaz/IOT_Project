package com.iot.water.service;

import com.iot.water.dto.auth.AuthResponse;
import com.iot.water.dto.auth.LoginRequest;
import com.iot.water.dto.auth.RegisterRequest;
import com.iot.water.entity.User;
import com.iot.water.entity.enums.UserRole;
import com.iot.water.entity.enums.UserStatus;
import com.iot.water.exception.ResourceAlreadyExistsException;
import com.iot.water.repository.UserRepository;
import com.iot.water.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already registered");
        }
        
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .surname(request.getSurname())
                .phoneNumber(request.getPhoneNumber())
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();
        
        user = userRepository.save(user);
        
        auditService.logUserAction(null, "USER_REGISTERED", "USER", user.getId(), 
                "User registered: " + user.getEmail());
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        String token = jwtTokenProvider.generateToken(user.getEmail(), claims);
        
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
    
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        String token = jwtTokenProvider.generateToken(user.getEmail(), claims);
        
        auditService.logUserAction(user.getId(), "USER_LOGIN", "USER", user.getId(), 
                "User logged in: " + user.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
