package ru.raspisa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.raspisa.entity.Lesson;
import ru.raspisa.entity.Group;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByDayOfWeek(DayOfWeek dayOfWeek);

    List<Lesson> findByGroup(Group group);

    List<Lesson> findByStudio_Teacher_Id(Long teacherId);

    List<Lesson> findBySpecialTrue();

    // Мероприятия, назначенные на конкретную дату (нужно для напоминания в день события).
    // Занятия без даты сюда не попадают — у них date равен null.
    List<Lesson> findBySpecialTrueAndDate(LocalDate date);
}
