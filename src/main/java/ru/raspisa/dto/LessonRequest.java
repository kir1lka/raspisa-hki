package ru.raspisa.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record LessonRequest(
        @NotNull(message = "день недели обязателен")
        DayOfWeek dayOfWeek,

        @NotNull(message = "время обязательно")
        LocalTime time,

        @NotNull(message = "номер занятия обязателен")
        @Min(value = 1, message = "номер занятия должен быть >= 1")
        Integer orderNumber,

        Integer groupNumber,

        @NotBlank(message = "код студии обязателен")
        String studioCode,

        Boolean special,
        java.time.LocalDate date,
        java.time.LocalTime endTime,
        String title,
        String description,
        java.util.List<String> photos
) {
}
