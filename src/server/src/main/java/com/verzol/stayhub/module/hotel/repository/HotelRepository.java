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
    
    /**
     * Batch load first image URL for multiple hotels (avoids N+1 queries)
     * Gets primary image if exists, otherwise first image by ID
     * Note: This query returns one row per hotel (the first image)
     */
    @Query("SELECT img.hotelId, COALESCE(img.thumbnailUrl, img.url) " +
           "FROM HotelImage img " +
           "WHERE img.hotelId IN :hotelIds " +
           "AND (img.isPrimary = true OR img.id = (" +
           "    SELECT MIN(img2.id) FROM HotelImage img2 WHERE img2.hotelId = img.hotelId" +
           "))")
    List<Object[]> findFirstImagesByHotelIds(@Param("hotelIds") List<Long> hotelIds);
    
    /**
     * Helper method to convert query results to Map
     */
    default java.util.Map<Long, String> findFirstImageByHotelIds(List<Long> hotelIds) {
        if (hotelIds == null || hotelIds.isEmpty()) {
            return new java.util.HashMap<>();
        }
        List<Object[]> results = findFirstImagesByHotelIds(hotelIds);
        return results.stream()
            .collect(java.util.stream.Collectors.toMap(
                row -> (Long) row[0],
                row -> (String) row[1],
                (existing, replacement) -> existing // Keep first if duplicate
            ));
    }
    
    /**
     * Batch load minimum price for multiple hotels (avoids N+1 queries)
     */
    @Query("SELECT r.hotelId, MIN(r.basePrice) " +
           "FROM Room r " +
           "WHERE r.hotelId IN :hotelIds " +
           "GROUP BY r.hotelId")
    List<Object[]> findMinPricesByHotelIds(@Param("hotelIds") List<Long> hotelIds);
    
    /**
     * Helper method to convert query results to Map
     */
    default java.util.Map<Long, java.math.BigDecimal> findMinPriceByHotelIds(List<Long> hotelIds) {
        if (hotelIds == null || hotelIds.isEmpty()) {
            return new java.util.HashMap<>();
        }
        List<Object[]> results = findMinPricesByHotelIds(hotelIds);
        return results.stream()
            .collect(java.util.stream.Collectors.toMap(
                row -> (Long) row[0],
                row -> (java.math.BigDecimal) row[1]
            ));
    }
    
    /**
     * Batch load room count for multiple hotels (avoids N+1 queries)
     */
    @Query("SELECT r.hotelId, COUNT(r.id) " +
           "FROM Room r " +
           "WHERE r.hotelId IN :hotelIds " +
           "GROUP BY r.hotelId")
    List<Object[]> findRoomCountsByHotelIds(@Param("hotelIds") List<Long> hotelIds);
    
    /**
     * Helper method to convert query results to Map
     */
    default java.util.Map<Long, Integer> findRoomCountByHotelIds(List<Long> hotelIds) {
        if (hotelIds == null || hotelIds.isEmpty()) {
            return new java.util.HashMap<>();
        }
        List<Object[]> results = findRoomCountsByHotelIds(hotelIds);
        return results.stream()
            .collect(java.util.stream.Collectors.toMap(
                row -> (Long) row[0],
                row -> ((Number) row[1]).intValue()
            ));
    }
    
    /**
     * Find all hotels by owner ID (optimized for dashboard)
     */
    List<Hotel> findByOwnerId(Long ownerId);
}
