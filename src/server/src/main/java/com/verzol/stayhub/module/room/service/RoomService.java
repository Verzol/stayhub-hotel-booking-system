package com.verzol.stayhub.module.room.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.module.amenity.entity.Amenity;
import com.verzol.stayhub.module.amenity.repository.AmenityRepository;
import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.hotel.repository.HotelRepository;
import com.verzol.stayhub.module.room.dto.RoomDTO;
import com.verzol.stayhub.module.room.entity.Room;
import com.verzol.stayhub.module.room.entity.RoomAvailability;
import com.verzol.stayhub.module.room.repository.RoomAvailabilityRepository;
import com.verzol.stayhub.module.room.repository.RoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final AmenityRepository amenityRepository;
    private final RoomAvailabilityRepository roomAvailabilityRepository;

    @Transactional
    public Room createRoom(Long hotelId, RoomDTO dto) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        Room room = new Room();
        room.setHotelId(hotelId);
        mapDtoToEntity(dto, room);
        return roomRepository.save(room);
    }

    @Transactional
    public Room updateRoom(Long id, RoomDTO dto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        mapDtoToEntity(dto, room);
        return roomRepository.save(room);
    }

    public List<Room> getHotelRooms(Long hotelId) {
        // Assuming findByHotelId exists or using stream filter
        return roomRepository.findAll().stream()
                .filter(r -> r.getHotelId().equals(hotelId))
                .collect(Collectors.toList());
    }

    public List<RoomAvailability> getAvailability(Long roomId, LocalDate start, LocalDate end) {
        return roomAvailabilityRepository.findByRoomIdAndDateBetween(roomId, start, end);
    }

    @Transactional
    public void updateAvailability(Long roomId, LocalDate date, Boolean isAvailable, BigDecimal customPrice) {
        RoomAvailability availability = roomAvailabilityRepository.findByRoomIdAndDate(roomId, date)
                .orElse(new RoomAvailability());
        
        if (availability.getId() == null) {
            availability.setRoomId(roomId);
            availability.setDate(date);
        }

        availability.setIsAvailable(isAvailable);
        availability.setCustomPrice(customPrice);
        
        roomAvailabilityRepository.save(availability);
    }

    @Transactional
    public void reserveDates(Long roomId, Long bookingId, LocalDate start, LocalDate end) {
        List<LocalDate> dates = start.datesUntil(end.plusDays(1)).collect(Collectors.toList());
        for (LocalDate date : dates) {
            RoomAvailability availability = roomAvailabilityRepository.findByRoomIdAndDate(roomId, date)
                    .orElse(new RoomAvailability());
            
            if (availability.getId() == null) {
                availability.setRoomId(roomId);
                availability.setDate(date);
            }

            // Check if room is already booked
            if (availability.getBookingId() != null) {
                 throw new RuntimeException("Room is already booked on " + date);
            }
            
            // Check if room is blocked by host (isAvailable is explicitly false)
            Boolean isAvailable = availability.getIsAvailable();
            if (isAvailable != null && !isAvailable && availability.getBookingId() == null) {
                 // Already blocked by host
                 throw new RuntimeException("Room is not available on " + date);
            }

            // Reserve the room
            availability.setIsAvailable(false);
            availability.setBookingId(bookingId);
            availability.setBlockReason("BOOKED");
            
            roomAvailabilityRepository.save(availability);
        }
    }

    @Transactional
    public void cancelReservation(Long bookingId) {
        List<RoomAvailability> availabilities = roomAvailabilityRepository.findByBookingId(bookingId);
        for (RoomAvailability availability : availabilities) {
            availability.setIsAvailable(true);
            availability.setBookingId(null);
            availability.setBlockReason(null);
            roomAvailabilityRepository.save(availability);
        }
    }

    private final com.verzol.stayhub.common.service.FileStorageService fileStorageService;
    private final com.verzol.stayhub.common.service.ImageProcessingService imageProcessingService;

    @Transactional
    public void uploadImages(Long roomId, org.springframework.web.multipart.MultipartFile[] files) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        List<com.verzol.stayhub.module.room.entity.RoomImage> images = java.util.Arrays.stream(files).map(file -> {
            String filename = fileStorageService.store(file);
            String fileUrl = "/uploads/" + filename;
            
            // Generate thumbnail from original file
            String thumbnailFilename = imageProcessingService.generateThumbnail(
                file, 
                filename, 
                fileStorageService.load(filename).getParent()
            );
            String thumbnailUrl = thumbnailFilename != null ? "/uploads/" + thumbnailFilename : null;
            
            com.verzol.stayhub.module.room.entity.RoomImage img = new com.verzol.stayhub.module.room.entity.RoomImage();
            img.setRoomId(roomId);
            img.setUrl(fileUrl);
            img.setThumbnailUrl(thumbnailUrl);
            return img;
        }).collect(Collectors.toList());

        if (room.getImages() == null) {
            room.setImages(images);
        } else {
            room.getImages().addAll(images);
        }
        roomRepository.save(room);
    }

    private void mapDtoToEntity(RoomDTO dto, Room room) {
        room.setName(dto.getName());
        room.setDescription(dto.getDescription());
        room.setBasePrice(dto.getBasePrice());
        room.setCapacity(dto.getCapacity());
        room.setArea(dto.getArea());
        room.setBedrooms(dto.getBedrooms());
        room.setBathrooms(dto.getBathrooms());
        room.setBedConfig(dto.getBedConfig());
        room.setQuantity(dto.getQuantity());

        if (dto.getAmenityIds() != null) {
            List<Amenity> amenities = amenityRepository.findAllById(dto.getAmenityIds());
            room.setAmenities(new HashSet<>(amenities));
        }
    }
}
