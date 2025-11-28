package com.verzol.stayhub.module.hotel.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Data
public class HotelDTO {
    private String name;
    private String description;
    private String address;
    private String city;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer starRating;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String policies;
    private List<Long> amenityIds;
}
