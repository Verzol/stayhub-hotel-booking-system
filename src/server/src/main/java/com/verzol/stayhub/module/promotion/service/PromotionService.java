package com.verzol.stayhub.module.promotion.service;

import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.hotel.repository.HotelRepository;
import com.verzol.stayhub.module.promotion.dto.PromotionDTO;
import com.verzol.stayhub.module.promotion.entity.Promotion;
import com.verzol.stayhub.module.promotion.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
