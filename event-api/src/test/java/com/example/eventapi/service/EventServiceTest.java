package com.example.eventapi.service;

import com.example.eventapi.model.Event;
import com.example.eventapi.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventService eventService;

    private Event testEvent;
    private Event savedEvent;

    @BeforeEach
    void setUp() {
        testEvent = createTestEvent();
        savedEvent = createSavedTestEvent();
    }

    @Test
    void saveEvent_ShouldReturnSavedEvent() {
        when(eventRepository.save(any(Event.class))).thenReturn(savedEvent);

        Event result = eventService.saveEvent(testEvent);

        assertNotNull(result);
        assertEquals(savedEvent.getId(), result.getId());
        assertEquals(savedEvent.getTitle(), result.getTitle());
        assertEquals(savedEvent.getDescription(), result.getDescription());
        assertEquals(savedEvent.getStartTime(), result.getStartTime());
        assertEquals(savedEvent.getEndTime(), result.getEndTime());
        assertEquals(savedEvent.getLocation(), result.getLocation());
        assertEquals(savedEvent.getColor(), result.getColor());

        verify(eventRepository, times(1)).save(testEvent);
    }

    @Test
    void getAllEvents_ShouldReturnListOfEvents() {
        List<Event> expectedEvents = Arrays.asList(savedEvent, createAnotherTestEvent());
        when(eventRepository.findAll()).thenReturn(expectedEvents);

        List<Event> result = eventService.getAllEvents();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedEvents, result);

        verify(eventRepository, times(1)).findAll();
    }

    @Test
    void getAllEvents_ShouldReturnEmptyListWhenNoEvents() {
        when(eventRepository.findAll()).thenReturn(Arrays.asList());

        List<Event> result = eventService.getAllEvents();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(eventRepository, times(1)).findAll();
    }

    @Test
    void getEventById_ShouldReturnEventWhenExists() {
        Long eventId = 1L;
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(savedEvent));

        Event result = eventService.getEventById(eventId);

        assertNotNull(result);
        assertEquals(savedEvent, result);

        verify(eventRepository, times(1)).findById(eventId);
    }

    @Test
    void getEventById_ShouldThrowExceptionWhenEventNotFound() {
        Long eventId = 999L;
        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(
                NoSuchElementException.class,
                () -> eventService.getEventById(eventId)
        );

        assertEquals("Event with id: 999 does not exist", exception.getMessage());

        verify(eventRepository, times(1)).findById(eventId);
    }

    @Test
    void updateEvent_ShouldUpdateExistingEvent() {
        Long eventId = 1L;
        Event updatedEventData = createUpdatedEventData();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(savedEvent));
        when(eventRepository.save(any(Event.class))).thenReturn(savedEvent);

        eventService.updateEvent(eventId, updatedEventData);

        assertEquals(updatedEventData.getTitle(), savedEvent.getTitle());
        assertEquals(updatedEventData.getDescription(), savedEvent.getDescription());
        assertEquals(updatedEventData.getStartTime(), savedEvent.getStartTime());
        assertEquals(updatedEventData.getEndTime(), savedEvent.getEndTime());
        assertEquals(updatedEventData.getLocation(), savedEvent.getLocation());
        assertEquals(updatedEventData.getColor(), savedEvent.getColor());

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, times(1)).save(savedEvent);
    }

    @Test
    void updateEvent_ShouldThrowExceptionWhenEventNotFound() {
        Long eventId = 999L;
        Event updatedEventData = createUpdatedEventData();

        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(
                NoSuchElementException.class,
                () -> eventService.updateEvent(eventId, updatedEventData)
        );

        assertEquals("Event with id: 999 does not exist ", exception.getMessage());

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void deleteEvent_ShouldDeleteExistingEvent() {
        Long eventId = 1L;

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(savedEvent));

        eventService.deleteEvent(eventId);

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, times(1)).delete(savedEvent);
    }

    @Test
    void deleteEvent_ShouldThrowExceptionWhenEventNotFound() {
        Long eventId = 999L;

        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(
                NoSuchElementException.class,
                () -> eventService.deleteEvent(eventId)
        );

        assertEquals("Event with id: 999 does not exist", exception.getMessage());

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, never()).delete(any(Event.class));
    }

    private Event createTestEvent() {
        Event event = new Event();
        event.setTitle("Test Event");
        event.setDescription("Test Description");
        event.setStartTime(Instant.parse("2024-12-25T10:00:00Z"));
        event.setEndTime(Instant.parse("2024-12-25T12:00:00Z"));
        event.setLocation("Test Location");
        event.setColor("#1a73e8");
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
        event.setStartTime(Instant.parse("2024-12-26T14:00:00Z"));
        event.setEndTime(Instant.parse("2024-12-26T16:00:00Z"));
        event.setLocation("Another Location");
        event.setColor("#34a853");
        return event;
    }

    private Event createUpdatedEventData() {
        Event event = new Event();
        event.setTitle("Updated Event");
        event.setDescription("Updated Description");
        event.setStartTime(Instant.parse("2024-12-27T09:00:00Z"));
        event.setEndTime(Instant.parse("2024-12-27T11:00:00Z"));
        event.setLocation("Updated Location");
        event.setColor("#ea4335");
        return event;
    }
}