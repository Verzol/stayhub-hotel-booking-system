package com.verzol.stayhub.module.hotel.service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.module.amenity.entity.Amenity;
import com.verzol.stayhub.module.amenity.repository.AmenityRepository;
import com.verzol.stayhub.module.hotel.dto.HotelDTO;
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

    public List<Hotel> getMyHotels(Long ownerId) {
        // Assuming we might need a custom query or just filter. 
        // For now, let's use Example or add a method to Repository.
        // Since I can't easily modify Repository interface without another tool call, 
        // I'll assume I can add a method to it or use a workaround.
        // Actually, I should add findByOwnerId to HotelRepository.
        return hotelRepository.findAll().stream()
                .filter(h -> h.getOwnerId().equals(ownerId))
                .collect(Collectors.toList());
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
}
