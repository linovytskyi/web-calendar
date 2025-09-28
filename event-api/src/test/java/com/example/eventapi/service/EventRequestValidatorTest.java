package com.example.eventapi.service;

import com.example.eventapi.dto.EventRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class EventRequestValidatorTest {

    @InjectMocks
    private EventRequestValidator eventRequestValidator;

    private EventRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = createEventRequest();
    }

    @Test
    void validate_ShouldPassForValidRequest() {
        assertDoesNotThrow(() -> eventRequestValidator.validate(validRequest));
    }

    @Test
    void validate_ShouldThrowExceptionWhenEndTimeIsBeforeStartTime() {
        EventRequest request = createEventRequest();
        Instant startTime = Instant.now().plus(2, ChronoUnit.HOURS);
        Instant endTime = Instant.now().plus(1, ChronoUnit.HOURS);

        request.setStartTime(startTime);
        request.setEndTime(endTime);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> eventRequestValidator.validate(request)
        );

        assertEquals("End time must be after start time", exception.getMessage());
    }

    @Test
    void validate_ShouldPassWhenStartTimeIsExactlyNow() {
        EventRequest request = createEventRequest();
        Instant now = Instant.now();
        request.setStartTime(now.plus(1, ChronoUnit.SECONDS));
        request.setEndTime(now.plus(1, ChronoUnit.HOURS));

        assertDoesNotThrow(() -> eventRequestValidator.validate(request));
    }

    @Test
    void validate_ShouldThrowExceptionWhenEndTimeEqualsStartTime() {
        EventRequest request = createEventRequest();
        Instant time = Instant.now();
        request.setStartTime(time);
        request.setEndTime(time);


        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> eventRequestValidator.validate(request)
        );

        String errorMessage = exception.getMessage();
        assertTrue(errorMessage.contains("Start date and past data cannot be the same"));
    }

    private EventRequest createEventRequest() {
        EventRequest request = new EventRequest();
        request.setTitle("Test Event");
        request.setDescription("Test Description");
        request.setStartTime(Instant.now().plus(1, ChronoUnit.HOURS));
        request.setEndTime(Instant.now().plus(2, ChronoUnit.HOURS));
        request.setLocation("Test Location");
        return request;
    }
}