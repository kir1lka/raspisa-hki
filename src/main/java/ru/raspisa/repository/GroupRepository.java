package ru.raspisa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.raspisa.entity.Group;

public interface GroupRepository extends JpaRepository<Group, Long> {

    Group findByNumber(Integer number);
}
