package ru.raspisa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.raspisa.entity.Lesson;

import java.time.DayOfWeek;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByDayOfWeek(DayOfWeek dayOfWeek);

    List<Lesson> findByGroup_Number(Integer number);

    List<Lesson> findByStudio_Teacher_Id(Long teacherId);

    List<Lesson> findBySpecialTrue();
}
