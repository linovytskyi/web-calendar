import { Injectable } from '@angular/core';
import { CalendarEvent } from '../model/calendar-event';
import { DateTimeUtilService } from './date-time-util.service';

@Injectable({
  providedIn: 'root'
})
export class EventDateTimeUtilService {

  constructor(private readonly dateTimeUtil: DateTimeUtilService) {}

  public convertEventToUserTimezone(event: CalendarEvent): CalendarEvent {
    return {
      ...event,
      startTime: this.dateTimeUtil.convertToUserTimezone(event.startTime),
      endTime: this.dateTimeUtil.convertToUserTimezone(event.endTime)
    };
  }

  public convertEventFromUserTimezone(event: CalendarEvent): CalendarEvent {
    return {
      ...event,
      startTime: this.dateTimeUtil.convertFromUserTimezone(event.startTime),
      endTime: this.dateTimeUtil.convertFromUserTimezone(event.endTime)
    };
  }

  public isEventFullDay(event: CalendarEvent): boolean {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const startsAtMidnight = this.dateTimeUtil.isTimeAtMidnight(startTime);
    const endsAtEndOfDay = this.dateTimeUtil.isTimeAtEndOfDay(endTime);

    return startsAtMidnight && endsAtEndOfDay;
  }

  public isEventMultiDay(event: CalendarEvent): boolean {
    return !this.dateTimeUtil.isSameDay(event.startTime, event.endTime);
  }

  public isEventFullDayForDate(event: CalendarEvent, calendarDate: Date): boolean {
    const dayStart = this.dateTimeUtil.getStartOfDay(calendarDate);
    const eventStartsBeforeOrAtDayStart = event.startTime <= dayStart;

    const dayEndThreshold = this.dateTimeUtil.createTimeAtEndOfDay(calendarDate);
    const eventEndsAfterThreshold = event.endTime >= dayEndThreshold;
    return eventStartsBeforeOrAtDayStart && eventEndsAfterThreshold;
  }

  public getEventDurationInDays(event: CalendarEvent): number {
    return this.dateTimeUtil.getDifferenceInDays(
      this.dateTimeUtil.getStartOfDay(event.endTime),
      this.dateTimeUtil.getStartOfDay(event.startTime)
    );
  }

  public setEventAsFullDay(event: CalendarEvent): CalendarEvent {
    return {
      ...event,
      startTime: this.dateTimeUtil.getStartOfDay(event.startTime),
      endTime: this.dateTimeUtil.createTimeAtEndOfDay(event.endTime)
    };
  }

  public formatEventTime(event: CalendarEvent): string {
    return this.dateTimeUtil.formatTime(event.startTime);
  }

  public formatEventDateTime(event: CalendarEvent): string {
    return this.dateTimeUtil.formatDateTime(event.startTime);
  }

  public formatEventDateOnly(event: CalendarEvent): string {
    return this.dateTimeUtil.formatDateOnly(event.startTime);
  }

  public formatEventDateTimeLocal(event: CalendarEvent): string {
    return this.dateTimeUtil.formatDateTimeLocal(event.startTime);
  }

  public formatEventEndDateTimeLocal(event: CalendarEvent): string {
    return this.dateTimeUtil.formatDateTimeLocal(event.endTime);
  }

  public formatDateTimeLocal(date: Date): string {
    return this.dateTimeUtil.formatDateTimeLocal(date);
  }

  public formatDateOnly(date: Date): string {
    return this.dateTimeUtil.formatDateOnly(date);
  }

  public formatTime(date: Date): string {
    return this.dateTimeUtil.formatTime(date);
  }

  public formatDateTime(date: Date): string {
    return this.dateTimeUtil.formatDateTime(date);
  }

  public getCalendarStartDate(selectedDate: Date): Date {
    return this.dateTimeUtil.getCalendarStartDate(selectedDate);
  }

  public addDaysToDate(date: Date, days: number): Date {
    return this.dateTimeUtil.addDaysToDate(date, days);
  }

  public addMonthsToDate(date: Date, months: number): Date {
    return this.dateTimeUtil.addMonthsToDate(date, months);
  }

  public isSameMonth(date1: Date, date2: Date): boolean {
    return this.dateTimeUtil.isSameMonth(date1, date2);
  }

  public formatMonthYear(date: Date): string {
    return this.dateTimeUtil.formatMonthYear(date);
  }

  public createDefaultFullDayEvent(date: Date): { startTime: Date, endTime: Date } {
    const startTime = this.dateTimeUtil.getStartOfDay(date);
    const endTime = this.dateTimeUtil.createTimeAtEndOfDay(date);

    return { startTime, endTime };
  }

  public createDefaultTimedEvent(date: Date, startHour: number = 9, durationHours: number = 1): { startTime: Date, endTime: Date } {
    const startTime = this.dateTimeUtil.createTimeAtHour(date, startHour, 0);
    const endTime = this.dateTimeUtil.addHoursToDate(startTime, durationHours);

    return { startTime, endTime };
  }

  public getCurrentDate(): Date {
    return this.dateTimeUtil.getCurrentDate();
  }

  public createDateFromDateTimeString(dateTimeString: string): Date {
    return this.dateTimeUtil.createDateFromDateTimeString(dateTimeString);
  }

  public isValidDate(date: Date): boolean {
    return this.dateTimeUtil.isValidDate(date);
  }
}
