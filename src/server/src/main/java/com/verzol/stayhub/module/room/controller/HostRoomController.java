package com.verzol.stayhub.module.room.controller;

import com.verzol.stayhub.module.room.dto.RoomDTO;
import com.verzol.stayhub.module.room.entity.Room;
import com.verzol.stayhub.module.room.entity.RoomAvailability;
import com.verzol.stayhub.module.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/host")
@RequiredArgsConstructor
public class HostRoomController {

    private final RoomService roomService;

    @PostMapping("/hotels/{hotelId}/rooms")
    public ResponseEntity<Room> createRoom(@PathVariable Long hotelId, @RequestBody RoomDTO dto) {
        return ResponseEntity.ok(roomService.createRoom(hotelId, dto));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody RoomDTO dto) {
        return ResponseEntity.ok(roomService.updateRoom(id, dto));
    }

    @GetMapping("/hotels/{hotelId}/rooms")
    public ResponseEntity<List<Room>> getHotelRooms(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.getHotelRooms(hotelId));
    }

    @GetMapping("/rooms/{id}/availability")
    public ResponseEntity<List<RoomAvailability>> getAvailability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(roomService.getAvailability(id, start, end));
    }

    @PostMapping("/rooms/{id}/availability")
    public ResponseEntity<Void> updateAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        
        LocalDate date = LocalDate.parse((String) payload.get("date"));
        Boolean isAvailable = (Boolean) payload.get("isAvailable");
        BigDecimal customPrice = payload.get("customPrice") != null ? new BigDecimal(payload.get("customPrice").toString()) : null;

        roomService.updateAvailability(id, date, isAvailable, customPrice);
        return ResponseEntity.ok().build();
    }
}
