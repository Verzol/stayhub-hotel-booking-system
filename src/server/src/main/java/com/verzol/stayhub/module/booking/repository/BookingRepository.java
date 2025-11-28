package com.verzol.stayhub.module.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
