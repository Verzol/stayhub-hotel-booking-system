package com.verzol.stayhub.module.wishlist.repository;

import com.verzol.stayhub.module.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserId(Long userId);
    Optional<Wishlist> findByUserIdAndHotelId(Long userId, Long hotelId);
    void deleteByUserIdAndHotelId(Long userId, Long hotelId);
}
