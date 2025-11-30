package com.verzol.stayhub.module.promotion.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.hotel.repository.HotelRepository;
import com.verzol.stayhub.module.promotion.dto.PromotionDTO;
import com.verzol.stayhub.module.promotion.dto.PublicPromotionDTO;
import com.verzol.stayhub.module.promotion.entity.Promotion;
import com.verzol.stayhub.module.promotion.repository.PromotionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final HotelRepository hotelRepository;

    @Transactional
    public Promotion createPromotion(Long hotelId, PromotionDTO dto) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        Promotion promotion = new Promotion();
        promotion.setHotelId(hotelId);
        mapDtoToEntity(dto, promotion);
        return promotionRepository.save(promotion);
    }

    public List<Promotion> getHotelPromotions(Long hotelId) {
        // Assuming findByHotelId exists or using stream filter
        return promotionRepository.findAll().stream()
                .filter(p -> p.getHotelId() != null && p.getHotelId().equals(hotelId))
                .collect(Collectors.toList());
    }

    @Transactional
    public Promotion updatePromotion(Long id, PromotionDTO dto) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
        mapDtoToEntity(dto, promotion);
        return promotionRepository.save(promotion);
    }

    @Transactional
    public void togglePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
        promotion.setIsActive(!promotion.getIsActive());
        promotionRepository.save(promotion);
    }

    /**
     * Get all active promotions for public display
     * Includes hotel information for better UX
     */
    @Transactional(readOnly = true)
    public List<PublicPromotionDTO> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> promotions = promotionRepository.findActivePromotions(now);
        
        if (promotions.isEmpty()) {
            return List.of();
        }
        
        // Get all hotel IDs
        List<Long> hotelIds = promotions.stream()
                .map(Promotion::getHotelId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        
        // Batch load all hotels
        Map<Long, Hotel> hotelMap = hotelRepository.findAllById(hotelIds).stream()
                .collect(Collectors.toMap(Hotel::getId, h -> h));
        
        // Batch load hotel thumbnails (optimized - avoids N+1 queries)
        Map<Long, String> thumbnailMap = hotelRepository.findFirstImageByHotelIds(hotelIds);
        
        // Map promotions to DTOs with hotel info
        return promotions.stream()
                .map(promotion -> {
                    PublicPromotionDTO dto = new PublicPromotionDTO();
                    dto.setId(promotion.getId());
                    dto.setCode(promotion.getCode());
                    dto.setDiscountPercent(promotion.getDiscountPercent());
                    dto.setMaxDiscountAmount(promotion.getMaxDiscountAmount());
                    dto.setStartDate(promotion.getStartDate());
                    dto.setEndDate(promotion.getEndDate());
                    dto.setMaxUsage(promotion.getMaxUsage());
                    dto.setCurrentUsage(promotion.getCurrentUsage());
                    
                    // Add hotel information
                    Hotel hotel = hotelMap.get(promotion.getHotelId());
                    if (hotel != null) {
                        dto.setHotelId(hotel.getId());
                        dto.setHotelName(hotel.getName());
                        dto.setHotelCity(hotel.getCity());
                        dto.setHotelAddress(hotel.getAddress());
                        dto.setHotelStarRating(hotel.getStarRating());
                        
                        // Get thumbnail URL from batch-loaded map
                        String thumbnailUrl = thumbnailMap.get(hotel.getId());
                        dto.setHotelThumbnailUrl(thumbnailUrl);
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private void mapDtoToEntity(PromotionDTO dto, Promotion promotion) {
        promotion.setCode(dto.getCode());
        promotion.setDiscountPercent(dto.getDiscountPercent());
        promotion.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        promotion.setStartDate(dto.getStartDate());
        promotion.setEndDate(dto.getEndDate());
        promotion.setMaxUsage(dto.getMaxUsage());
        promotion.setIsActive(dto.getIsActive());
    }
}
