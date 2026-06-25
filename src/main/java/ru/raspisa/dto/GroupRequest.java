package ru.raspisa.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GroupRequest(
        @NotNull @Min(1) Integer number,
        @NotBlank String shift
) {}
