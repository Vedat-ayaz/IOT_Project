package com.iot.water.repository;

import com.iot.water.entity.Device;
import com.iot.water.entity.User;
import com.iot.water.entity.enums.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    
    Optional<Device> findByDeviceUid(String deviceUid);
    
    boolean existsByDeviceUid(String deviceUid);
    
    List<Device> findByOwner(User owner);
    
    List<Device> findByOwnerId(Long ownerId);
    
    List<Device> findByStatus(DeviceStatus status);
    
    List<Device> findByOwnerIsNull();
    
    @Query("SELECT d FROM Device d WHERE d.lastSeenAt < :threshold")
    List<Device> findOfflineDevices(@Param("threshold") LocalDateTime threshold);
    
    @Query("SELECT d FROM Device d WHERE d.owner.id = :userId AND d.status = :status")
    List<Device> findByOwnerIdAndStatus(@Param("userId") Long userId, @Param("status") DeviceStatus status);
    
    Optional<Device> findByDeviceApiKey(String apiKey);
}
