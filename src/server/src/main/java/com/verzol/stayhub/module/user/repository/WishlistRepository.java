package com.verzol.stayhub.module.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.user.entity.Wishlist;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
}
