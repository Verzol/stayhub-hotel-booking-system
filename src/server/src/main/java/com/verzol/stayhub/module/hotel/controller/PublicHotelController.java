package com.verzol.stayhub.module.hotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.module.hotel.dto.HotelSearchDTO;
import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.hotel.repository.HotelRepository;
import com.verzol.stayhub.module.hotel.repository.HotelSpecification;
import com.verzol.stayhub.module.hotel.service.HotelService;
import com.verzol.stayhub.module.search.dto.SearchRequest;

@RestController
@RequestMapping("/api/public/hotels")
public class PublicHotelController {

    @Autowired
    private HotelRepository hotelRepository;
    
    @Autowired
    private HotelService hotelService;

    @GetMapping("/search")
    public ResponseEntity<Page<HotelSearchDTO>> searchHotels(
            SearchRequest request,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        // Handle sorting manually if needed, or let Pageable handle it if passed from frontend
        // For custom sort logic based on request.getSort():
        // Handle sorting manually to avoid Pageable conflict
        Sort sort = Sort.unsorted();
        String sortBy = request.getSortBy();
        
        if ("rating_desc".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "starRating");
        } else if ("price_asc".equals(sortBy) || "price_desc".equals(sortBy)) {
            // TODO: Implement complex price sorting (requires joining with Room)
            // For now, fallback to unsorted or sort by ID to prevent crash
            sort = Sort.by(Sort.Direction.ASC, "id");
        }
        
        if (sort.isSorted()) {
            pageable = org.springframework.data.domain.PageRequest.of(
                    pageable.getPageNumber(), 
                    pageable.getPageSize(), 
                    sort
            );
        }

        // Use optimized search with DTO mapping
        HotelSpecification spec = new HotelSpecification(request);
        Page<HotelSearchDTO> hotels = hotelService.searchHotelsOptimized(spec, pageable);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getHotelDetails(@PathVariable Long id) {
        return hotelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get location suggestions for autocomplete (cities and hotel names)
     */
    @GetMapping("/suggestions")
    public ResponseEntity<java.util.List<String>> getSuggestions(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false, defaultValue = "10") Integer limit
    ) {
        java.util.List<String> suggestions = new java.util.ArrayList<>();
        
        if (query == null || query.trim().isEmpty()) {
            // Return popular cities if no query
            suggestions.addAll(hotelRepository.findDistinctCities().stream()
                    .limit(limit != null ? limit : 10)
                    .toList());
        } else {
            String searchQuery = query.trim();
            // Search cities
            suggestions.addAll(hotelRepository.searchCities(searchQuery));
            // Search hotel names
            suggestions.addAll(hotelRepository.searchHotelNames(searchQuery));
            
            // Remove duplicates and limit results
            suggestions = suggestions.stream()
                    .distinct()
                    .limit(limit != null ? limit : 10)
                    .collect(java.util.stream.Collectors.toList());
        }
        
        return ResponseEntity.ok(suggestions);
    }
}
