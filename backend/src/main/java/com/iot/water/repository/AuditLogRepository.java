package com.iot.water.repository;

import com.iot.water.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    List<AuditLog> findByUserIdOrderByTsDesc(Long userId);
    
    Page<AuditLog> findAllByOrderByTsDesc(Pageable pageable);
    
    List<AuditLog> findByActionOrderByTsDesc(String action);
    
    @Query("SELECT a FROM AuditLog a WHERE a.entityType = :entityType AND a.entityId = :entityId ORDER BY a.ts DESC")
    List<AuditLog> findByEntity(
        @Param("entityType") String entityType,
        @Param("entityId") Long entityId
    );
    
    @Query("SELECT a FROM AuditLog a WHERE a.ts BETWEEN :from AND :to ORDER BY a.ts DESC")
    List<AuditLog> findByTimeRange(
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );
}
