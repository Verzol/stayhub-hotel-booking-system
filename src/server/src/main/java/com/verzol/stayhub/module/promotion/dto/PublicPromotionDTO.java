package com.verzol.stayhub.module.promotion.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

/**
 * DTO for public promotion display
 * Includes hotel information for better UX
 */
@Data
public class PublicPromotionDTO {
    private Long id;
    private String code;
    private Integer discountPercent;
    private BigDecimal maxDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer maxUsage;
    private Integer currentUsage;
    
    // Hotel information
    private Long hotelId;
    private String hotelName;
    private String hotelCity;
    private String hotelAddress;
    private Integer hotelStarRating;
    private String hotelThumbnailUrl;
}

