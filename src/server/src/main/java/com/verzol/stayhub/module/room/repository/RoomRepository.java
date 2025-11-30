package com.verzol.stayhub.module.room.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.verzol.stayhub.module.room.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
    /**
     * Find all rooms by hotel ID
     * Much more efficient than loading all rooms and filtering in memory
     */
    List<Room> findByHotelId(Long hotelId);
    
    /**
     * Count rooms for multiple hotels (optimized for dashboard)
     */
    @Query("SELECT COUNT(r) FROM Room r WHERE r.hotelId IN :hotelIds")
    int countByHotelIdIn(@Param("hotelIds") List<Long> hotelIds);
}
