package com.verzol.stayhub.module.hotel.controller;

import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.hotel.repository.HotelRepository;
import com.verzol.stayhub.module.hotel.repository.HotelSpecification;
import com.verzol.stayhub.module.search.dto.SearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/hotels")
public class PublicHotelController {

    @Autowired
    private HotelRepository hotelRepository;

    @GetMapping("/search")
    public ResponseEntity<Page<Hotel>> searchHotels(
            SearchRequest request,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        // Handle sorting manually if needed, or let Pageable handle it if passed from frontend
        // For custom sort logic based on request.getSort():
        Sort sort = Sort.unsorted();
        if ("price_asc".equals(request.getSort())) {
            // Price sorting is tricky because it depends on rooms. 
            // For simplicity, we might sort by basePrice of the cheapest room, but that requires complex query.
            // Alternatively, sort by starRating or name for now.
        } else if ("rating_desc".equals(request.getSort())) {
            sort = Sort.by(Sort.Direction.DESC, "starRating");
        }
        
        if (sort.isSorted()) {
            pageable = org.springframework.data.domain.PageRequest.of(
                    pageable.getPageNumber(), 
                    pageable.getPageSize(), 
                    sort
            );
        }

        HotelSpecification spec = new HotelSpecification(request);
        Page<Hotel> hotels = hotelRepository.findAll(spec, pageable);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getHotelDetails(@PathVariable Long id) {
        return hotelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
