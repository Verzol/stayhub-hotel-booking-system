package com.verzol.stayhub.module.room.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class RoomDTO {
    private String name;
    private String description;
    private BigDecimal basePrice;
    private Integer capacity;
    private BigDecimal area;
    private Integer bedrooms;
    private Integer bathrooms;
    private String bedConfig;
    private Integer quantity;
    private List<Long> amenityIds;
}
