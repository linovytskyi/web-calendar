package com.example.eventapi.service;

import com.example.eventapi.dto.EventRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class EventRequestValidator {

    private static final Logger LOGGER = LoggerFactory.getLogger(EventRequestValidator.class);
    private static final Pattern HEX_COLOR_PATTERN = Pattern.compile("^#[0-9A-Fa-f]{6}$");

    public void validate(EventRequest request) {
        List<String> errors = new ArrayList<>();

        LOGGER.debug("Validating event request {}", request);

        if (isStartDateAndPastDateSame(request)) {
            errors.add("Start date and past data cannot be the same");
        }

        if (isEndBeforeStart(request)) {
            errors.add("End time must be after start time");
        }

        if (isInvalidColor(request)) {
            errors.add("Color must be a valid hex color code (e.g., #6f42c1)");
        }

        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(String.join("; ", errors));
        }

        LOGGER.debug("Event Request is valid!");
    }

    private boolean isStartDateAndPastDateSame(EventRequest request) {
        return request.getStartTime().equals(request.getEndTime());
    }

    private boolean isEndBeforeStart(EventRequest request) {
        return request.getEndTime().isBefore(request.getStartTime());
    }

    private boolean isInvalidColor(EventRequest request) {
        String color = request.getColor();
        return color != null && !color.isEmpty() && !HEX_COLOR_PATTERN.matcher(color).matches();
    }
}
