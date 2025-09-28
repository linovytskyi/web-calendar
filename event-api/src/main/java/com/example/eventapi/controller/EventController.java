package com.example.eventapi.controller;

import com.example.eventapi.dto.EventRequest;
import com.example.eventapi.mapper.EventMapper;
import com.example.eventapi.model.Event;
import com.example.eventapi.service.EventRequestValidator;
import com.example.eventapi.service.EventService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/events")
public class EventController {

    private final EventMapper eventMapper;

    private final EventService eventService;

    private final EventRequestValidator eventRequestValidator;

    private static final Logger LOGGER = LoggerFactory.getLogger(EventController.class);

    public EventController(EventMapper eventMapper,
                           EventService eventService,
                           EventRequestValidator eventRequestValidator) {
        this.eventMapper = eventMapper;
        this.eventService = eventService;
        this.eventRequestValidator = eventRequestValidator;
    }

    @PostMapping
    private ResponseEntity<Event> saveEvent(@Valid @RequestBody EventRequest eventRequest) {
        LOGGER.info("Received request to save event: {}", eventRequest);
        eventRequestValidator.validate(eventRequest);
        Event event = eventMapper.toEntity(eventRequest);
        return new ResponseEntity<>(eventService.saveEvent(event), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Event> getAll() {
        LOGGER.info("Received request to get all events");
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public Event getEventById(@PathVariable Long id) {
        LOGGER.info("Received request to get event by id: {}", id);
        return eventService.getEventById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateEvent(@PathVariable Long id,
                                            @Valid @RequestBody EventRequest eventRequest) {
        LOGGER.info("Received request to update event by id: {}", eventRequest);
        eventRequestValidator.validate(eventRequest);
        Event event = eventMapper.toEntity(eventRequest);
        eventService.updateEvent(id, event);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        LOGGER.info("Received request to delete event by id: {}", id);
        eventService.deleteEvent(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
