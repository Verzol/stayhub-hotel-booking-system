package com.verzol.stayhub.module.room.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "room_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "is_available", columnDefinition = "boolean default true")
    private Boolean isAvailable;

    @Column(name = "custom_price")
    private BigDecimal customPrice;

    @Column(name = "block_reason")
    private String blockReason;

    @Column(name = "booking_id")
    private Long bookingId;
}
