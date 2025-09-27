package com.example.eventapi.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRequest {
    @NotNull(message = "title cannot be null")
    @NotEmpty(message = "title cannot be empty")
    private String title;
    private String description;
    @NotNull(message = "start time cannot be null")
    private LocalDateTime startTime;
    @NotNull(message = "end time cannot be null")
    private LocalDateTime endTime;
    private String location;
}
