package com.verzol.stayhub.module.room.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.room.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
}
