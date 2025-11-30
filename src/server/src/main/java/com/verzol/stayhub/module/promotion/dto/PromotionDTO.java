package com.verzol.stayhub.module.promotion.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class PromotionDTO {
    private String code;
    private Integer discountPercent;
    private BigDecimal maxDiscountAmount;
    
    // datetime-local input format: "yyyy-MM-ddTHH:mm"
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime startDate;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime endDate;
    
    private Integer maxUsage;
    private Boolean isActive;
}
