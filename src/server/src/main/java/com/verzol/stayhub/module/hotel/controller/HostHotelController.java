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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id, @AuthenticationPrincipal User user) {
        hotelService.deleteHotel(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<Void> uploadImages(@PathVariable Long id, @RequestParam("files") org.springframework.web.multipart.MultipartFile[] files) {
        hotelService.uploadImages(id, files);
        return ResponseEntity.ok().build();
    }
}
