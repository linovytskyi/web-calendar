package com.example.eventapi.service;

import com.example.eventapi.dto.EventRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class EventRequestValidator {

    private static final Logger LOGGER = LoggerFactory.getLogger(EventRequestValidator.class);

    public void validate(EventRequest request) {
        List<String> errors = new ArrayList<>();

        LOGGER.debug("Validating event request {}", request);

        if (isStartDateAndPastDateSame(request)) {
            errors.add("Start date and past data cannot be the same");
        }

        if (isStartInPast(request)) {
            errors.add("Start time must be in the future");
        }

        if (isEndBeforeStart(request)) {
            errors.add("End time must be after start time");
        }

        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(String.join("; ", errors));
        }

        LOGGER.debug("Event Request is valid!");
    }

    private boolean isStartDateAndPastDateSame(EventRequest request) {
        return request.getStartTime().isEqual(request.getEndTime());
    }

    private boolean isStartInPast(EventRequest request) {
        return request.getStartTime().isBefore(LocalDateTime.now());
    }

    private boolean isEndBeforeStart(EventRequest request) {
        return request.getEndTime().isBefore(request.getStartTime());
    }
}
