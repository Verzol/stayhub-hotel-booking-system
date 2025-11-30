package com.verzol.stayhub.module.room.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.verzol.stayhub.module.amenity.entity.Amenity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice;

    @Column(nullable = false)
    private Integer capacity;

    private BigDecimal area;

    @Column(columnDefinition = "integer default 1")
    private Integer bedrooms;

    @Column(columnDefinition = "integer default 1")
    private Integer bathrooms;

    @Column(name = "bed_config", columnDefinition = "text")
    private String bedConfig;

    @Column(columnDefinition = "integer default 1")
    private Integer quantity;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "is_active", columnDefinition = "boolean default true")
    private Boolean isActive;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "roomId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RoomImage> images;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "room_amenities",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private Set<Amenity> amenities;
}
