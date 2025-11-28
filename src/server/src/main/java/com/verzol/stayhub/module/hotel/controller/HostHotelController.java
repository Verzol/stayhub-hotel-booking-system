package com.verzol.stayhub.module.hotel.controller;

import com.verzol.stayhub.module.hotel.dto.HotelDTO;
import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.hotel.service.HotelService;
import com.verzol.stayhub.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/host/hotels")
@RequiredArgsConstructor
public class HostHotelController {

    private final HotelService hotelService;

    @PostMapping
    public ResponseEntity<Hotel> createHotel(@RequestBody HotelDTO dto, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(hotelService.createHotel(dto, user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Hotel> updateHotel(@PathVariable Long id, @RequestBody HotelDTO dto, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(hotelService.updateHotel(id, dto, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<Hotel>> getMyHotels(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(hotelService.getMyHotels(user.getId()));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<Void> uploadImages(@PathVariable Long id, @RequestBody Map<String, List<String>> payload) {
        List<String> urls = payload.get("urls");
        hotelService.uploadImages(id, urls);
        return ResponseEntity.ok().build();
    }
}
