package com.verzol.stayhub.module.hotel.repository;

import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.room.entity.Room;
import com.verzol.stayhub.module.booking.entity.Booking;
import com.verzol.stayhub.module.amenity.entity.Amenity;
import com.verzol.stayhub.module.search.dto.SearchRequest;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;


import java.util.ArrayList;
import java.util.List;

public class HotelSpecification implements Specification<Hotel> {

    private final SearchRequest request;

    public HotelSpecification(SearchRequest request) {
        this.request = request;
    }

    @Override
    public Predicate toPredicate(Root<Hotel> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();

        // 1. Filter by Location (Name or City)
        if (request.getQuery() != null && !request.getQuery().isEmpty()) {
            String search = "%" + request.getQuery().toLowerCase() + "%";
            Predicate namePredicate = cb.like(cb.lower(root.get("name")), search);
            Predicate cityPredicate = cb.like(cb.lower(root.get("city")), search);
            predicates.add(cb.or(namePredicate, cityPredicate));
        }

        // 2. Filter by Star Rating
        if (request.getStars() != null && !request.getStars().isEmpty()) {
            predicates.add(root.get("starRating").in(request.getStars()));
        }

        // 3. Filter by Hotel Amenities
        if (request.getAmenities() != null && !request.getAmenities().isEmpty()) {
            for (Long amenityId : request.getAmenities()) {
                Join<Hotel, Amenity> amenityJoin = root.join("amenities");
                predicates.add(cb.equal(amenityJoin.get("id"), amenityId));
            }
        }

        // 4. Filter by Room Availability & Capacity & Price
        // We need to check if the hotel has AT LEAST ONE room that matches criteria
        if (request.getCheckIn() != null && request.getCheckOut() != null) {
            Subquery<Long> roomSubquery = query.subquery(Long.class);
            Root<Room> roomRoot = roomSubquery.from(Room.class);
            roomSubquery.select(roomRoot.get("hotelId"));

            List<Predicate> roomPredicates = new ArrayList<>();

            // Link Room to Hotel
            roomPredicates.add(cb.equal(roomRoot.get("hotelId"), root.get("id")));

            // Capacity
            if (request.getGuests() != null) {
                roomPredicates.add(cb.greaterThanOrEqualTo(roomRoot.get("capacity"), request.getGuests()));
            }

            // Price Range
            if (request.getMinPrice() != null) {
                roomPredicates.add(cb.greaterThanOrEqualTo(roomRoot.get("basePrice"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                roomPredicates.add(cb.lessThanOrEqualTo(roomRoot.get("basePrice"), request.getMaxPrice()));
            }

            // Availability (Not fully booked)
            // Logic: Count bookings for this room in the date range. If count < quantity, it's available.
            Subquery<Long> bookingSubquery = query.subquery(Long.class);
            Root<Booking> bookingRoot = bookingSubquery.from(Booking.class);
            bookingSubquery.select(cb.count(bookingRoot));

            List<Predicate> bookingPredicates = new ArrayList<>();
            bookingPredicates.add(cb.equal(bookingRoot.get("roomId"), roomRoot.get("id")));
            
            // Booking overlaps with requested range
            // (StartA <= EndB) and (EndA >= StartB)
            Predicate overlap = cb.and(
                cb.lessThanOrEqualTo(bookingRoot.get("checkInDate"), request.getCheckOut()),
                cb.greaterThanOrEqualTo(bookingRoot.get("checkOutDate"), request.getCheckIn())
            );
            // Exclude cancelled bookings if status exists
            // bookingPredicates.add(cb.notEqual(bookingRoot.get("status"), "CANCELLED")); 
            
            bookingPredicates.add(overlap);
            bookingSubquery.where(bookingPredicates.toArray(new Predicate[0]));

            // Room is available if bookings count < room quantity
            roomPredicates.add(cb.lessThan(bookingSubquery, roomRoot.get("quantity")));

            roomSubquery.where(roomPredicates.toArray(new Predicate[0]));
            
            predicates.add(cb.exists(roomSubquery));
        }

        // Only Active and Approved Hotels
        predicates.add(cb.equal(root.get("isActive"), true));
        predicates.add(cb.equal(root.get("isApproved"), true));

        return cb.and(predicates.toArray(new Predicate[0]));
    }
}
