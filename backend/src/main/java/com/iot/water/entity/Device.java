package com.iot.water.entity;

import com.iot.water.entity.enums.DeviceStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "devices", indexes = {
    @Index(name = "idx_devices_device_uid", columnList = "device_uid"),
    @Index(name = "idx_devices_owner_user_id", columnList = "owner_user_id"),
    @Index(name = "idx_devices_status", columnList = "status"),
    @Index(name = "idx_devices_last_seen", columnList = "last_seen_at")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Device extends BaseEntity {
    
    @Column(name = "device_uid", nullable = false, unique = true, length = 100)
    private String deviceUid;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 255)
    private String location;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id", foreignKey = @ForeignKey(name = "fk_devices_owner"))
    private User owner;
    
    @Column(length = 100)
    private String model;
    
    @Column(name = "firmware_version", length = 50)
    private String firmwareVersion;
    
    @Column(name = "device_api_key")
    private String deviceApiKey;
    
    @Column(name = "install_date")
    private LocalDate installDate;
    
    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DeviceStatus status = DeviceStatus.INACTIVE;
}
