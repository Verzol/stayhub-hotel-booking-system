package com.verzol.stayhub.module.promotion.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.module.promotion.dto.PublicPromotionDTO;
import com.verzol.stayhub.module.promotion.service.PromotionService;

import lombok.RequiredArgsConstructor;

/**
 * Public controller for promotions
 * No authentication required
 */
@RestController
@RequestMapping("/api/public/promotions")
@RequiredArgsConstructor
public class PublicPromotionController {

    private final PromotionService promotionService;

    /**
     * Get all active promotions for public display
     * GET /api/public/promotions
     */
    @GetMapping
    public ResponseEntity<List<PublicPromotionDTO>> getActivePromotions() {
        return ResponseEntity.ok(promotionService.getActivePromotions());
    }
}

