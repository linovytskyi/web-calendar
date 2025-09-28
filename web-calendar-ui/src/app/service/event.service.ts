import { Injectable } from '@angular/core';
import { CalendarEvent } from '../model/calendar-event';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventDateTimeUtilService } from './event-date-time-util.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly EVENT_API: string = "http://localhost:8081/events";

  constructor(private readonly http: HttpClient, private readonly eventDateTimeUtil: EventDateTimeUtilService) { }

  public addEvent(event: CalendarEvent): Observable<CalendarEvent> {
    const convertedEvent = this.eventDateTimeUtil.convertEventFromUserTimezone(event);
    return this.http.post<CalendarEvent>(this.EVENT_API, convertedEvent);
  }

  public getAllEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(this.EVENT_API);
  }

  public getEventById(id: number): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(this.EVENT_API + `/${id}`);
  }

  public updateEvent(id: number, updatedEvent: CalendarEvent): Observable<void> {
    return this.http.put<void>((this.EVENT_API + `/${id}`), updatedEvent);
  }

  public deleteEventById(id: number): Observable<void> {
    return this.http.delete<void>(this.EVENT_API + `/${id}`);
  }

  public truncateEventTitle(title: string, maxLength: number = 16): string {
    if (title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength) + '...';
  }
}
