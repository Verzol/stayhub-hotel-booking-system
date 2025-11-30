package com.verzol.stayhub.module.hotel.service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.module.amenity.entity.Amenity;
import com.verzol.stayhub.module.amenity.repository.AmenityRepository;
import com.verzol.stayhub.module.hotel.dto.HotelDTO;
import com.verzol.stayhub.module.hotel.dto.HotelSearchDTO;
import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.hotel.entity.HotelImage;
import com.verzol.stayhub.module.hotel.repository.HotelRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final AmenityRepository amenityRepository;

    @Transactional
    public Hotel createHotel(HotelDTO dto, Long ownerId) {
        Hotel hotel = new Hotel();
        hotel.setOwnerId(ownerId);
        mapDtoToEntity(dto, hotel);
        return hotelRepository.save(hotel);
    }

    @Transactional
    public Hotel updateHotel(Long id, HotelDTO dto, Long ownerId) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        if (!hotel.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized access to hotel");
        }

        mapDtoToEntity(dto, hotel);
        return hotelRepository.save(hotel);
    }

    @Transactional(readOnly = true)
    public List<Hotel> getMyHotels(Long ownerId) {
        // Use optimized query - findByOwnerId uses database index
        return hotelRepository.findByOwnerId(ownerId);
    }

    private final com.verzol.stayhub.common.service.FileStorageService fileStorageService;
    private final com.verzol.stayhub.common.service.ImageProcessingService imageProcessingService;

    @Transactional
    public void uploadImages(Long hotelId, org.springframework.web.multipart.MultipartFile[] files) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        List<HotelImage> images = java.util.Arrays.stream(files).map(file -> {
            String filename = fileStorageService.store(file);
            String fileUrl = "/uploads/" + filename;
            
            // Generate thumbnail from original file
            String thumbnailFilename = imageProcessingService.generateThumbnail(
                file, 
                filename, 
                fileStorageService.load(filename).getParent()
            );
            String thumbnailUrl = thumbnailFilename != null ? "/uploads/" + thumbnailFilename : null;
            
            HotelImage img = new HotelImage();
            img.setHotelId(hotelId);
            img.setUrl(fileUrl);
            img.setThumbnailUrl(thumbnailUrl);
            img.setIsPrimary(false); // Default
            return img;
        }).collect(Collectors.toList());

        if (hotel.getImages() == null) {
            hotel.setImages(images);
        } else {
            hotel.getImages().addAll(images);
        }
        hotelRepository.save(hotel);
    }

    private void mapDtoToEntity(HotelDTO dto, Hotel hotel) {
        hotel.setName(dto.getName());
        hotel.setDescription(dto.getDescription());
        hotel.setAddress(dto.getAddress());
        hotel.setCity(dto.getCity());
        hotel.setCountry(dto.getCountry());
        hotel.setLatitude(dto.getLatitude());
        hotel.setLongitude(dto.getLongitude());
        hotel.setStarRating(dto.getStarRating());
        hotel.setCheckInTime(dto.getCheckInTime());
        hotel.setCheckOutTime(dto.getCheckOutTime());
        hotel.setPolicies(dto.getPolicies());

        if (dto.getAmenityIds() != null) {
            List<Amenity> amenities = amenityRepository.findAllById(dto.getAmenityIds());
            hotel.setAmenities(new HashSet<>(amenities));
        }
    }

    /**
     * Search hotels with optimized DTO response
     * Maps Hotel entities to HotelSearchDTO to reduce response size
     * Only loads necessary data, avoiding N+1 queries and large responses
     */
    public Page<HotelSearchDTO> searchHotelsOptimized(Specification<Hotel> spec, Pageable pageable) {
        // Use Specification to filter (with all existing filters)
        // Note: With LAZY loading, images and rooms won't be loaded automatically
        // We'll query them separately in batch to avoid N+1
        Page<Hotel> hotels = hotelRepository.findAll(spec, pageable);
        
        // Get hotel IDs for batch queries
        List<Long> hotelIds = hotels.getContent().stream()
            .map(Hotel::getId)
            .collect(Collectors.toList());
        
        // Batch load first images for all hotels (1 query instead of N)
        java.util.Map<Long, String> thumbnailMap = hotelRepository.findFirstImageByHotelIds(hotelIds);
        
        // Batch load min prices for all hotels (1 query instead of N)
        java.util.Map<Long, java.math.BigDecimal> minPriceMap = hotelRepository.findMinPriceByHotelIds(hotelIds);
        
        // Batch load room counts (1 query instead of N)
        java.util.Map<Long, Integer> roomCountMap = hotelRepository.findRoomCountByHotelIds(hotelIds);
        
        // Map to DTO using batch-loaded data
        return hotels.map(hotel -> {
            String thumbnailUrl = thumbnailMap.get(hotel.getId());
            java.math.BigDecimal minPrice = minPriceMap.get(hotel.getId());
            Integer roomCount = roomCountMap.getOrDefault(hotel.getId(), 0);
            
            return new HotelSearchDTO(
                hotel.getId(),
                hotel.getName(),
                hotel.getDescription(),
                hotel.getCity(),
                hotel.getCountry(),
                hotel.getAddress(),
                hotel.getStarRating(),
                hotel.getLatitude(),
                hotel.getLongitude(),
                thumbnailUrl,
                minPrice,
                roomCount
            );
        });
    }
}
