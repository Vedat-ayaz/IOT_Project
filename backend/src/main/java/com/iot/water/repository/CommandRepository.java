package com.iot.water.repository;

import com.iot.water.entity.Command;
import com.iot.water.entity.Device;
import com.iot.water.entity.enums.CommandStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommandRepository extends JpaRepository<Command, Long> {
    
    List<Command> findByDeviceOrderByRequestedAtDesc(Device device);
    
    Page<Command> findByDeviceOrderByRequestedAtDesc(Device device, Pageable pageable);
    
    List<Command> findByDeviceAndStatusOrderByRequestedAtDesc(Device device, CommandStatus status);
    
    Optional<Command> findByCorrelationId(String correlationId);
    
    @Query("SELECT c FROM Command c WHERE c.device.id = :deviceId AND c.status = :status ORDER BY c.requestedAt ASC")
    List<Command> findPendingCommandsByDeviceId(
        @Param("deviceId") Long deviceId,
        @Param("status") CommandStatus status
    );
    
    @Query("SELECT c FROM Command c WHERE c.device.deviceUid = :deviceUid AND c.status = :status ORDER BY c.requestedAt ASC")
    List<Command> findPendingCommandsByDeviceUid(
        @Param("deviceUid") String deviceUid,
        @Param("status") CommandStatus status
    );
    
    @Query("SELECT c FROM Command c WHERE c.status = :status AND c.requestedAt < :threshold")
    List<Command> findExpiredCommands(
        @Param("status") CommandStatus status,
        @Param("threshold") LocalDateTime threshold
    );
    
    List<Command> findByRequestedByUserIdOrderByRequestedAtDesc(Long userId);
}
