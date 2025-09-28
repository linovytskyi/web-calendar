package com.example.eventapi.mapper;

import com.example.eventapi.dto.EventRequest;
import com.example.eventapi.model.Event;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public Event toEntity(EventRequest request) {
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setLocation(request.getLocation());
        event.setColor(request.getColor());
        return event;
    }
}
