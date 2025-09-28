package com.example.eventapi.service;

import com.example.eventapi.model.Event;
import com.example.eventapi.repository.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;

    private static final Logger LOGGER = LoggerFactory.getLogger(EventService.class);

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public Event saveEvent(Event event) {
        LOGGER.info("Saving event: {}", event);
        event = eventRepository.save(event);
        LOGGER.info("Successfully saved an event: {}", event);
        return event;
    }

    public List<Event> getAllEvents() {
        LOGGER.info("Getting all events");
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        LOGGER.info("Getting event by id: {}", id);
        Optional<Event> optionalEvent = eventRepository.findById(id);
        Event event = optionalEvent.orElseThrow(() -> new NoSuchElementException(String.format("Event with id: %s does not exist", id)));
        LOGGER.info("Successfully retrieved event by id: {}", event);
        return event;
    }

    public void updateEvent(Long id, Event newEvent) {
        Event existing = eventRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(String.format("Event with id: %s does not exist ", id)));

        LOGGER.info("Updating event with id: {}", id);

        existing.setTitle(newEvent.getTitle());
        existing.setDescription(newEvent.getDescription());
        existing.setStartTime(newEvent.getStartTime());
        existing.setEndTime(newEvent.getEndTime());
        existing.setLocation(newEvent.getLocation());
        existing.setColor(newEvent.getColor());

        eventRepository.save(existing);
        LOGGER.info("Event with id: {} updated", id);
    }

    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(String.format("Event with id: %s does not exist", id)));

        LOGGER.info("Deleting event with id: {}", id);
        eventRepository.delete(event);
        LOGGER.info("Deleted event with id: {}", id);
    }
}
