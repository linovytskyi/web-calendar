package com.example.eventapi.service;

import com.example.eventapi.dto.EventRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

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
    void validate_ShouldThrowExceptionWhenStartTimeIsInPast() {
        EventRequest pastRequest = createEventRequest();
        pastRequest.setStartTime(LocalDateTime.now().minusHours(1));
        pastRequest.setEndTime(LocalDateTime.now().plusHours(1));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> eventRequestValidator.validate(pastRequest)
        );

        assertEquals("Start time must be in the future", exception.getMessage());
    }

    @Test
    void validate_ShouldThrowExceptionWhenEndTimeIsBeforeStartTime() {
        EventRequest request = createEventRequest();
        LocalDateTime startTime = LocalDateTime.now().plusHours(2);
        LocalDateTime endTime = LocalDateTime.now().plusHours(1);

        request.setStartTime(startTime);
        request.setEndTime(endTime);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> eventRequestValidator.validate(request)
        );

        assertEquals("End time must be after start time", exception.getMessage());
    }

    @Test
    void validate_ShouldThrowExceptionWithMultipleErrorsWhenBothValidationsFail() {
        EventRequest request = createEventRequest();
        LocalDateTime pastTime = LocalDateTime.now().minusHours(2);
        LocalDateTime earlierPastTime = LocalDateTime.now().minusHours(3);

        request.setStartTime(pastTime);
        request.setEndTime(earlierPastTime);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> eventRequestValidator.validate(request)
        );

        String errorMessage = exception.getMessage();
        assertTrue(errorMessage.contains("Start time must be in the future"));
        assertTrue(errorMessage.contains("End time must be after start time"));
    }

    @Test
    void validate_ShouldPassWhenStartTimeIsExactlyNow() {
        EventRequest request = createEventRequest();
        LocalDateTime now = LocalDateTime.now();
        request.setStartTime(now.plusSeconds(1));
        request.setEndTime(now.plusHours(1));

        assertDoesNotThrow(() -> eventRequestValidator.validate(request));
    }

    @Test
    void validate_ShouldThrowExceptionWhenEndTimeEqualsStartTime() {
        EventRequest request = createEventRequest();
        LocalDateTime time = LocalDateTime.now();
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
        request.setStartTime(LocalDateTime.now().plusHours(1));
        request.setEndTime(LocalDateTime.now().plusHours(2));
        request.setLocation("Test Location");
        return request;
    }
}