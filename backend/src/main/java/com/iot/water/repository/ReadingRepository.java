package com.iot.water.repository;

import com.iot.water.entity.Device;
import com.iot.water.entity.Reading;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReadingRepository extends JpaRepository<Reading, Long> {
    
    List<Reading> findByDeviceOrderByTsDesc(Device device);
    
    Page<Reading> findByDeviceOrderByTsDesc(Device device, Pageable pageable);
    
    List<Reading> findByDeviceAndTsBetweenOrderByTsDesc(
        Device device, 
        LocalDateTime from, 
        LocalDateTime to
    );
    
    @Query("SELECT r FROM Reading r WHERE r.device.id = :deviceId AND r.ts BETWEEN :from AND :to ORDER BY r.ts DESC")
    List<Reading> findByDeviceIdAndTimeRange(
        @Param("deviceId") Long deviceId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );
    
    @Query("SELECT SUM(r.volumeLitersDelta) FROM Reading r WHERE r.device.id = :deviceId AND r.ts BETWEEN :from AND :to")
    BigDecimal sumVolumeByDeviceIdAndTimeRange(
        @Param("deviceId") Long deviceId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );
    
    @Query(value = "SELECT DATE_FORMAT(ts, :format) as period, " +
                   "AVG(flow_rate_lpm) as avg_flow_rate, " +
                   "SUM(volume_liters_delta) as total_volume " +
                   "FROM readings " +
                   "WHERE device_id = :deviceId AND ts BETWEEN :from AND :to " +
                   "GROUP BY period " +
                   "ORDER BY period", 
           nativeQuery = true)
    List<Object[]> getAggregatedReadings(
        @Param("deviceId") Long deviceId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        @Param("format") String format
    );
    
    @Query("SELECT r FROM Reading r WHERE r.device.id = :deviceId ORDER BY r.ts DESC LIMIT 1")
    Reading findLatestByDeviceId(@Param("deviceId") Long deviceId);
}
