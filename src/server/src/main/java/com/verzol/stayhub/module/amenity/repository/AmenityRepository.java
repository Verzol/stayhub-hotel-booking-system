package com.verzol.stayhub.module.amenity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.amenity.entity.Amenity;

public interface AmenityRepository extends JpaRepository<Amenity, Long> {
}
