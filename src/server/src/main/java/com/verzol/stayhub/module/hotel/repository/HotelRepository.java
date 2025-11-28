package com.verzol.stayhub.module.hotel.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.hotel.entity.Hotel;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
}
