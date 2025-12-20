package com.iot.water.service;

import com.iot.water.entity.AuditLog;
import com.iot.water.entity.User;
import com.iot.water.repository.AuditLogRepository;
import com.iot.water.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public void logUserAction(Long userId, String action, String entityType, Long entityId, String details) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();
        
        auditLogRepository.save(log);
    }
    
    @Transactional
    public void logAction(String action, String entityType, Long entityId, String details) {
        logUserAction(null, action, entityType, entityId, details);
    }
}
