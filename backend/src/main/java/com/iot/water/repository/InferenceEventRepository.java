package com.iot.water.repository;

import com.iot.water.entity.InferenceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InferenceEventRepository extends JpaRepository<InferenceEvent, Long> {
    
    List<InferenceEvent> findByDeviceIdOrderByEventStartTsDesc(Long deviceId);
    
    List<InferenceEvent> findByDeviceIdAndEventStartTsBetweenOrderByEventStartTsDesc(
            Long deviceId, LocalDateTime from, LocalDateTime to);
    
    @Query("SELECT i FROM InferenceEvent i WHERE i.device.id = :deviceId " +
           "ORDER BY i.eventStartTs DESC LIMIT :limit")
    List<InferenceEvent> findTopByDeviceIdOrderByEventStartTsDesc(Long deviceId, Integer limit);
    
    @Query("SELECT i.predictedFixture as fixture, COUNT(i) as count, SUM(i.liters) as totalLiters " +
           "FROM InferenceEvent i WHERE i.device.id = :deviceId " +
           "AND i.eventStartTs >= :from GROUP BY i.predictedFixture ORDER BY count DESC")
    List<Object[]> getFixtureUsageStats(Long deviceId, LocalDateTime from);
}
