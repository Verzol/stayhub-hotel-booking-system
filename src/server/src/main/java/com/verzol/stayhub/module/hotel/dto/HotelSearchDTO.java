package com.verzol.stayhub.module.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Lightweight DTO for hotel search results
 * Only includes essential data needed for search listing
 * Reduces response size significantly (from 5-10MB to 50-100KB for 10 hotels)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelSearchDTO {
    private Long id;
    private String name;
    private String description;
    private String city;
    private String country;
    private String address;
    private Integer starRating;
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    // Only first image URL (thumbnail) - not the entire images list
    private String thumbnailUrl;
    
    // Minimum price from rooms - not all room details
    private BigDecimal minPrice;
    
    // Optional: Count of rooms (for display purposes)
    private Integer roomCount;
}

