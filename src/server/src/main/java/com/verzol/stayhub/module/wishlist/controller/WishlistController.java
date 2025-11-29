package com.verzol.stayhub.module.wishlist.controller;

import com.verzol.stayhub.module.wishlist.entity.Wishlist;
import com.verzol.stayhub.module.wishlist.repository.WishlistRepository;
import com.verzol.stayhub.module.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @GetMapping
    public ResponseEntity<List<Wishlist>> getMyWishlist(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(wishlistRepository.findByUserId(user.getId()));
    }

    @PostMapping("/{hotelId}")
    @Transactional
    public ResponseEntity<String> toggleWishlist(
            @PathVariable Long hotelId,
            @AuthenticationPrincipal User user
    ) {
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndHotelId(user.getId(), hotelId);
        
        if (existing.isPresent()) {
            wishlistRepository.deleteByUserIdAndHotelId(user.getId(), hotelId);
            return ResponseEntity.ok("Removed from wishlist");
        } else {
            Wishlist wishlist = new Wishlist();
            wishlist.setUserId(user.getId());
            wishlist.setHotelId(hotelId);
            wishlistRepository.save(wishlist);
            return ResponseEntity.ok("Added to wishlist");
        }
    }
}
