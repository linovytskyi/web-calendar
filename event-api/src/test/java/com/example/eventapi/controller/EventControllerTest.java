package com.example.eventapi.controller;

import com.example.eventapi.dto.EventRequest;
import com.example.eventapi.mapper.EventMapper;
import com.example.eventapi.model.Event;
import com.example.eventapi.service.EventRequestValidator;
import com.example.eventapi.service.EventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private EventMapper eventMapper;

    @MockitoBean
    private EventRequestValidator eventRequestValidator;

    @Autowired
    private ObjectMapper objectMapper;

    private EventRequest validEventRequest;
    private Event testEvent;
    private Event savedEvent;

    @BeforeEach
    void setUp() {
        validEventRequest = createValidEventRequest();
        testEvent = createTestEvent();
        savedEvent = createSavedTestEvent();
    }

    @Test
    void saveEvent_ShouldReturnCreatedEventWithStatus201() throws Exception {
        when(eventMapper.toEntity(any(EventRequest.class))).thenReturn(testEvent);
        when(eventService.saveEvent(any(Event.class))).thenReturn(savedEvent);
        doNothing().when(eventRequestValidator).validate(any(EventRequest.class));

        mockMvc.perform(post("/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validEventRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Event"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.location").value("Test Location"));

        verify(eventRequestValidator, times(1)).validate(any(EventRequest.class));
        verify(eventMapper, times(1)).toEntity(any(EventRequest.class));
        verify(eventService, times(1)).saveEvent(any(Event.class));
    }

    @Test
    void saveEvent_ShouldReturnBadRequestWhenValidationFails() throws Exception {
        doThrow(new IllegalArgumentException("Start time must be in the future"))
                .when(eventRequestValidator).validate(any(EventRequest.class));

        mockMvc.perform(post("/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validEventRequest)))
                .andExpect(status().isBadRequest());

        verify(eventRequestValidator, times(1)).validate(any(EventRequest.class));
        verify(eventMapper, never()).toEntity(any(EventRequest.class));
        verify(eventService, never()).saveEvent(any(Event.class));
    }

    @Test
    void saveEvent_ShouldReturnBadRequestWhenRequestBodyIsInvalid() throws Exception {
        EventRequest invalidRequest = new EventRequest();
        invalidRequest.setTitle("");
        invalidRequest.setStartTime(null);
        invalidRequest.setEndTime(null);

        mockMvc.perform(post("/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(eventRequestValidator, never()).validate(any(EventRequest.class));
        verify(eventMapper, never()).toEntity(any(EventRequest.class));
        verify(eventService, never()).saveEvent(any(Event.class));
    }

    @Test
    void getAll_ShouldReturnListOfEvents() throws Exception {
        List<Event> events = Arrays.asList(savedEvent, createAnotherTestEvent());
        when(eventService.getAllEvents()).thenReturn(events);

        mockMvc.perform(get("/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Test Event"))
                .andExpect(jsonPath("$[1].id").value(2L))
                .andExpect(jsonPath("$[1].title").value("Another Event"));

        verify(eventService, times(1)).getAllEvents();
    }

    @Test
    void getAll_ShouldReturnEmptyListWhenNoEvents() throws Exception {
        when(eventService.getAllEvents()).thenReturn(Arrays.asList());

        mockMvc.perform(get("/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(eventService, times(1)).getAllEvents();
    }

    @Test
    void getEventById_ShouldReturnEventWhenExists() throws Exception {
        when(eventService.getEventById(1L)).thenReturn(savedEvent);

        mockMvc.perform(get("/events/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Event"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.location").value("Test Location"));

        verify(eventService, times(1)).getEventById(1L);
    }

    @Test
    void getEventById_ShouldReturnNotFoundWhenEventDoesNotExist() throws Exception {
        when(eventService.getEventById(999L))
                .thenThrow(new NoSuchElementException("Event with id: 999 does not exist"));

        mockMvc.perform(get("/events/999"))
                .andExpect(status().isNotFound());

        verify(eventService, times(1)).getEventById(999L);
    }

    @Test
    void updateEvent_ShouldReturnNoContentWhenUpdateSuccessful() throws Exception {
        when(eventMapper.toEntity(any(EventRequest.class))).thenReturn(testEvent);
        doNothing().when(eventRequestValidator).validate(any(EventRequest.class));
        doNothing().when(eventService).updateEvent(anyLong(), any(Event.class));

        mockMvc.perform(put("/events/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validEventRequest)))
                .andExpect(status().isNoContent());

        verify(eventRequestValidator, times(1)).validate(any(EventRequest.class));
        verify(eventMapper, times(1)).toEntity(any(EventRequest.class));
        verify(eventService, times(1)).updateEvent(eq(1L), any(Event.class));
    }

    @Test
    void updateEvent_ShouldReturnBadRequestWhenValidationFails() throws Exception {
        doThrow(new IllegalArgumentException("End time must be after start time"))
                .when(eventRequestValidator).validate(any(EventRequest.class));

        mockMvc.perform(put("/events/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validEventRequest)))
                .andExpect(status().isBadRequest());

        verify(eventRequestValidator, times(1)).validate(any(EventRequest.class));
        verify(eventMapper, never()).toEntity(any(EventRequest.class));
        verify(eventService, never()).updateEvent(anyLong(), any(Event.class));
    }

    @Test
    void updateEvent_ShouldReturnNotFoundWhenEventDoesNotExist() throws Exception {
        when(eventMapper.toEntity(any(EventRequest.class))).thenReturn(testEvent);
        doNothing().when(eventRequestValidator).validate(any(EventRequest.class));
        doThrow(new NoSuchElementException("Event with id: 999 does not exist"))
                .when(eventService).updateEvent(anyLong(), any(Event.class));

        mockMvc.perform(put("/events/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validEventRequest)))
                .andExpect(status().isNotFound());

        verify(eventRequestValidator, times(1)).validate(any(EventRequest.class));
        verify(eventMapper, times(1)).toEntity(any(EventRequest.class));
        verify(eventService, times(1)).updateEvent(eq(999L), any(Event.class));
    }

    @Test
    void updateEvent_ShouldReturnBadRequestWhenRequestBodyIsInvalid() throws Exception {
        EventRequest invalidRequest = new EventRequest();
        invalidRequest.setTitle("");
        invalidRequest.setStartTime(null);
        invalidRequest.setEndTime(null);

        mockMvc.perform(put("/events/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(eventRequestValidator, never()).validate(any(EventRequest.class));
        verify(eventMapper, never()).toEntity(any(EventRequest.class));
        verify(eventService, never()).updateEvent(anyLong(), any(Event.class));
    }

    @Test
    void deleteEvent_ShouldReturnNoContentWhenDeleteSuccessful() throws Exception {
        doNothing().when(eventService).deleteEvent(1L);

        mockMvc.perform(delete("/events/1"))
                .andExpect(status().isNoContent());

        verify(eventService, times(1)).deleteEvent(1L);
    }

    @Test
    void deleteEvent_ShouldReturnNotFoundWhenEventDoesNotExist() throws Exception {
        doThrow(new NoSuchElementException("Event with id: 999 does not exist"))
                .when(eventService).deleteEvent(999L);

        mockMvc.perform(delete("/events/999"))
                .andExpect(status().isNotFound());

        verify(eventService, times(1)).deleteEvent(999L);
    }

    @Test
    void saveEvent_ShouldHandleMalformedJson() throws Exception {
        String malformedJson = "{ \"title\": \"Test\", \"startTime\": \"invalid-date\" }";

        mockMvc.perform(post("/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest());

        verify(eventRequestValidator, never()).validate(any(EventRequest.class));
        verify(eventMapper, never()).toEntity(any(EventRequest.class));
        verify(eventService, never()).saveEvent(any(Event.class));
    }

    private EventRequest createValidEventRequest() {
        EventRequest request = new EventRequest();
        request.setTitle("Test Event");
        request.setDescription("Test Description");
        request.setStartTime(LocalDateTime.of(2024, 12, 25, 10, 0));
        request.setEndTime(LocalDateTime.of(2024, 12, 25, 12, 0));
        request.setLocation("Test Location");
        return request;
    }

    private Event createTestEvent() {
        Event event = new Event();
        event.setTitle("Test Event");
        event.setDescription("Test Description");
        event.setStartTime(LocalDateTime.of(2024, 12, 25, 10, 0));
        event.setEndTime(LocalDateTime.of(2024, 12, 25, 12, 0));
        event.setLocation("Test Location");
        return event;
    }

    private Event createSavedTestEvent() {
        Event event = createTestEvent();
        event.setId(1L);
        return event;
    }

    private Event createAnotherTestEvent() {
        Event event = new Event();
        event.setId(2L);
        event.setTitle("Another Event");
        event.setDescription("Another Description");
        event.setStartTime(LocalDateTime.of(2024, 12, 26, 14, 0));
        event.setEndTime(LocalDateTime.of(2024, 12, 26, 16, 0));
        event.setLocation("Another Location");
        return event;
    }
}