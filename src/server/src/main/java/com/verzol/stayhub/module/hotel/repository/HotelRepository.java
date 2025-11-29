package com.verzol.stayhub.module.hotel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.verzol.stayhub.module.hotel.entity.Hotel;

public interface HotelRepository extends JpaRepository<Hotel, Long>, JpaSpecificationExecutor<Hotel> {
    
    /**
     * Get distinct cities from active and approved hotels
     */
    @Query("SELECT DISTINCT h.city FROM Hotel h WHERE h.isActive = true AND h.isApproved = true ORDER BY h.city")
    List<String> findDistinctCities();
    
    /**
     * Search cities and hotel names for autocomplete
     */
    @Query("SELECT DISTINCT h.city FROM Hotel h WHERE h.isActive = true AND h.isApproved = true AND LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY h.city")
    List<String> searchCities(@Param("query") String query);
    
    /**
     * Search hotel names for autocomplete
     */
    @Query("SELECT DISTINCT h.name FROM Hotel h WHERE h.isActive = true AND h.isApproved = true AND LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY h.name")
    List<String> searchHotelNames(@Param("query") String query);
}
