package com.iot.water.repository;

import com.iot.water.entity.Alert;
import com.iot.water.entity.Device;
import com.iot.water.entity.User;
import com.iot.water.entity.enums.AlertSeverity;
import com.iot.water.entity.enums.AlertType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    
    List<Alert> findByUserOrderByTsDesc(User user);
    
    Page<Alert> findByUserOrderByTsDesc(User user, Pageable pageable);
    
    List<Alert> findByUserAndIsReadOrderByTsDesc(User user, Boolean isRead);
    
    Page<Alert> findByUserAndIsReadOrderByTsDesc(User user, Boolean isRead, Pageable pageable);
    
    List<Alert> findByDeviceOrderByTsDesc(Device device);
    
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.user.id = :userId AND a.isRead = false")
    Long countUnreadByUserId(@Param("userId") Long userId);
    
    @Query("SELECT a FROM Alert a WHERE a.user.id = :userId AND a.severity = :severity ORDER BY a.ts DESC")
    List<Alert> findByUserIdAndSeverity(
        @Param("userId") Long userId,
        @Param("severity") AlertSeverity severity
    );
    
    @Query("SELECT a FROM Alert a WHERE a.device.id = :deviceId AND a.type = :type AND a.ts > :since")
    List<Alert> findRecentAlertsByDeviceAndType(
        @Param("deviceId") Long deviceId,
        @Param("type") AlertType type,
        @Param("since") LocalDateTime since
    );
}
