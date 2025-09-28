import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CalendarEvent } from '../../model/calendar-event';
import { EventService } from '../../service/event.service';
import { EventDateTimeUtilService } from '../../service/event-date-time-util.service';
import { EventModalComponent } from './event-modal/event-modal.component';
import { DateTimeUtilService } from '../../service/date-time-util.service';

export interface CalendarEntity {
  readonly date: Date;
  readonly events: CalendarEventEntity[];
  readonly anotherMonth: boolean;
}

export interface CalendarEventEntity {
  readonly event: CalendarEvent;
  readonly isFullDay: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, EventModalComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  public readonly weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  public calendarEntities: CalendarEntity[] = [];
  public selectedDate: Date;
  public isModalVisible = false;
  public modalEvents: CalendarEventEntity[] = [];
  public modalDate: Date = null;

  private currentDate: Date;
  private readonly calendarEntityMap = new Map<string, CalendarEntity>();
  private readonly AMOUNT_OF_CELLS = 35;
  private readonly MAX_VISIBLE_EVENTS = 4;
  private readonly MAX_VISIBLE_SYMBOLS_OF_TITLE = 16;

  constructor(
    private readonly eventService: EventService,
    private readonly eventDateTimeUtil: EventDateTimeUtilService,
    private readonly dateTimeUtil: DateTimeUtilService
  ) {
  }

  public ngOnInit(): void {
    this.currentDate = this.eventDateTimeUtil.getCurrentDate();
    this.selectedDate = this.currentDate;
    this.populateCalendarEntities();
  }

  public getSelectedMonthAndYearCombinationAsString(): string {
    return this.eventDateTimeUtil.formatMonthYear(this.selectedDate);
  }

  public goToNextMonth(): void {
    this.selectedDate = this.eventDateTimeUtil.addMonthsToDate(this.selectedDate, 1);
    this.populateCalendarEntities();
  }

  public goToPreviousMonth(): void {
    this.selectedDate = this.eventDateTimeUtil.addMonthsToDate(this.selectedDate, -1);
    this.populateCalendarEntities();
  }

  private initializeCalendarGrid(startDay: Date): void {
    this.calendarEntities = [];
    this.calendarEntityMap.clear();

    for (let day = 0; day < this.AMOUNT_OF_CELLS; day++) {
      const dayToAdd = this.eventDateTimeUtil.addDaysToDate(startDay, day);
      const calendarEntity: CalendarEntity = {
        date: dayToAdd,
        events: [],
        anotherMonth: !this.eventDateTimeUtil.isSameMonth(this.selectedDate, dayToAdd)
      };

      this.calendarEntities.push(calendarEntity);
      const dateKey = this.getDateKey(dayToAdd);
      this.calendarEntityMap.set(dateKey, calendarEntity);
    }
  }

  private convertEventTimezones(events: CalendarEvent[]): CalendarEvent[] {
    return events.map(event => this.eventDateTimeUtil.convertEventToUserTimezone(event));
  }

  private distributeEventAcrossDays(event: CalendarEvent): void {
    const dayDifference = this.eventDateTimeUtil.getEventDurationInDays(event);

    let currentEventDate = event.startTime;

    for (let day = 0; day <= dayDifference; day++) {
      const calendarEntity = this.getCalendarEntityByDate(currentEventDate);
      if (calendarEntity) {
        const eventEntity = this.createCalendarEventEntityForDate(event, calendarEntity.date);
        calendarEntity.events.push(eventEntity);
      }
      currentEventDate = this.eventDateTimeUtil.addDaysToDate(event.startTime, day + 1);
    }
  }

  private processAndDistributeEvents(events: CalendarEvent[]): void {
    const convertedEvents = this.convertEventTimezones(events);

    for (const event of convertedEvents) {
      this.distributeEventAcrossDays(event);
    }
  }

  private sortCalendarEvents(): void {
    this.calendarEntities.forEach(entity => {
      entity.events.sort(this.compareEventEntities);
    });
  }

  private getCalendarEntityByDate(date: Date): CalendarEntity | undefined {
    const dateKey = this.getDateKey(date);
    return this.calendarEntityMap.get(dateKey);
  }

  private getDateKey(date: Date): string {
    return this.dateTimeUtil.formatDateKey(date);
  }

  private populateCalendarEntities(): void {
    const startDay = this.eventDateTimeUtil.getCalendarStartDate(this.selectedDate);

    this.initializeCalendarGrid(startDay);

    this.eventService.getAllEvents().subscribe(events => {
      this.processAndDistributeEvents(events);
      this.sortCalendarEvents();
      console.log(this.calendarEntities)
    });
  }


  public formatEventTime(eventTime: Date): string {
    return this.dateTimeUtil.formatTime(eventTime);
  }

  public truncateEventTitle(title: string): string {
    return this.eventService.truncateEventTitle(title, this.MAX_VISIBLE_SYMBOLS_OF_TITLE);
  }

  public isEventMultiDay(event: CalendarEvent): boolean {
    return this.eventDateTimeUtil.isEventMultiDay(event);
  }

  private createCalendarEventEntityForDate(event: CalendarEvent, calendarDate: Date): CalendarEventEntity {
    return {
      event: event,
      isFullDay: this.isEventFullDayForDate(event, calendarDate)
    };
  }

  private isEventFullDayForDate(event: CalendarEvent, calendarDate: Date): boolean {
    return this.eventDateTimeUtil.isEventFullDayForDate(event, calendarDate);
  }


  private compareEventEntities = (a: CalendarEventEntity, b: CalendarEventEntity): number => {
    if (a.isFullDay && !b.isFullDay) {
      return -1;
    }
    if (!a.isFullDay && b.isFullDay) {
      return 1;
    }

    return a.event.startTime.getTime() - b.event.startTime.getTime();
  }

  public getVisibleEvents(events: CalendarEventEntity[]): CalendarEventEntity[] {
    return events.slice(0, this.MAX_VISIBLE_EVENTS);
  }

  public getHiddenEventsCount(events: CalendarEventEntity[]): number {
    return Math.max(0, events.length - this.MAX_VISIBLE_EVENTS);
  }

  public hasMoreEvents(events: CalendarEventEntity[]): boolean {
    return events.length > this.MAX_VISIBLE_EVENTS;
  }

  public showMoreEvents(events: CalendarEventEntity[], date: Date): void {
    this.modalEvents = events;
    this.modalDate = date;
    this.isModalVisible = true;
  }

  public closeModal(): void {
    this.isModalVisible = false;
    this.modalEvents = [];
    this.modalDate = null;
  }
}

