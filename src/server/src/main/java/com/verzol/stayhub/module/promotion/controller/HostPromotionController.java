package com.verzol.stayhub.module.promotion.controller;

import com.verzol.stayhub.module.promotion.dto.PromotionDTO;
import com.verzol.stayhub.module.promotion.entity.Promotion;
import com.verzol.stayhub.module.promotion.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/host/hotels")
@RequiredArgsConstructor
public class HostPromotionController {

    private final PromotionService promotionService;

    @PostMapping("/{hotelId}/promotions")
    public ResponseEntity<Promotion> createPromotion(@PathVariable Long hotelId, @RequestBody PromotionDTO dto) {
        return ResponseEntity.ok(promotionService.createPromotion(hotelId, dto));
    }

    @GetMapping("/{hotelId}/promotions")
    public ResponseEntity<List<Promotion>> getHotelPromotions(@PathVariable Long hotelId) {
        return ResponseEntity.ok(promotionService.getHotelPromotions(hotelId));
    }
}
