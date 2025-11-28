package com.verzol.stayhub.module.hotel.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "hotel_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @Column(nullable = false)
    private String url;

    @Column(name = "is_primary", columnDefinition = "boolean default false")
    private Boolean isPrimary;
}
