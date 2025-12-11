package com.verzol.stayhub.module.room.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.room.entity.RoomAvailability;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomAvailabilityRepository extends JpaRepository<RoomAvailability, Long> {
    List<RoomAvailability> findByRoomIdAndDateBetween(Long roomId, LocalDate startDate, LocalDate endDate);
    Optional<RoomAvailability> findByRoomIdAndDate(Long roomId, LocalDate date);
    List<RoomAvailability> findByBookingId(Long bookingId);
    List<RoomAvailability> findByRoomId(Long roomId);
}
