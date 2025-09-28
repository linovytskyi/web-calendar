import { Injectable } from '@angular/core';
import {
  startOfMonth,
  addDays,
  addMonths,
  previousSunday,
  isSameMonth,
  format,
  isSameDay,
  differenceInDays,
  startOfDay,
  addHours,
  setHours,
  setMinutes,
} from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

@Injectable({
  providedIn: 'root'
})
export class DateTimeUtilService {

  private readonly userTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;

  public convertToUserTimezone(date: Date): Date {
    return toZonedTime(date, this.userTimeZone);
  }

  public convertFromUserTimezone(date: Date): Date {
    return fromZonedTime(date, this.userTimeZone);
  }

  public getCurrentDate(): Date {
    return new Date();
  }

  public createDateFromDateTimeString(dateTimeString: string): Date {
    return new Date(dateTimeString);
  }

  public addDaysToDate(date: Date, days: number): Date {
    return addDays(date, days);
  }

  public addMonthsToDate(date: Date, months: number): Date {
    return addMonths(date, months);
  }

  public addHoursToDate(date: Date, hours: number): Date {
    return addHours(date, hours);
  }

  public setDateHours(date: Date, hours: number, minutes?: number): Date {
    return setHours(setMinutes(date, minutes || 0), hours);
  }

  public getStartOfMonth(date: Date): Date {
    return startOfMonth(date);
  }

  public getStartOfDay(date: Date): Date {
    return startOfDay(date);
  }

  public getPreviousSunday(date: Date): Date {
    return previousSunday(date);
  }

  public isSameMonth(date1: Date, date2: Date): boolean {
    return isSameMonth(date1, date2);
  }

  public isSameDay(date1: Date, date2: Date): boolean {
    return isSameDay(date1, date2);
  }

  public isValidDate(date: Date): boolean {
    return !isNaN(date.getTime());
  }

  public getDifferenceInDays(date1: Date, date2: Date): number {
    return differenceInDays(date1, date2);
  }

  public formatDate(date: Date, formatString: string): string {
    return format(date, formatString);
  }

  public formatTime(date: Date): string {
    return format(date, 'HH:mm');
  }

  public formatDateTime(date: Date): string {
    return format(date, 'MMMM d, yyyy \'at\' h:mm a');
  }

  public formatDateOnly(date: Date): string {
    return format(date, 'MMMM d, yyyy');
  }

  public formatDateTimeLocal(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  }

  public formatMonthYear(date: Date): string {
    return format(date, 'MMMM yyyy');
  }

  public formatDateKey(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  public isTimeAtMidnight(time: Date): boolean {
    return time.getHours() === 0 &&
           time.getMinutes() === 0 &&
           time.getSeconds() === 0;
  }

  public isTimeAtEndOfDay(time: Date): boolean {
    return time.getHours() === 23 &&
           time.getMinutes() === 59;
  }

  public getCalendarStartDate(selectedDate: Date): Date {
    const startOfTheMonth = this.getStartOfMonth(selectedDate);
    return this.getPreviousSunday(startOfTheMonth);
  }

  public createTimeAtEndOfDay(date: Date): Date {
    const endDate = new Date(date);
    endDate.setHours(23, 59, 0, 0);
    return endDate;
  }

  public createTimeAtHour(date: Date, hour: number, minute: number = 0): Date {
    return this.setDateHours(date, hour, minute);
  }
}
