package com.verzol.stayhub.module.search.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class SearchRequest {
    private String query; // City or Hotel Name
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer guests;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private List<Integer> stars;
    private List<Long> amenities;
    private String sortBy; // price_asc, price_desc, rating_desc
}
