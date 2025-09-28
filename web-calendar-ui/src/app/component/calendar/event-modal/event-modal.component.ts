import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CalendarEventEntity } from '../calendar.component';
import { EventDateTimeUtilService } from '../../../service/event-date-time-util.service';
import { EventService } from '../../../service/event.service';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-modal.component.html',
  styleUrl: './event-modal.component.css'
})
export class EventModalComponent {

  @Input()
  public isVisible= false;
  @Input()
  public events: CalendarEventEntity[] = [];
  @Input()
  public selectedDate: Date | null = null;
  @Output()
  public closeModal = new EventEmitter<void>();

  private readonly MAX_VISIBLE_SYMBOLS_OF_TITLE = 40;

  constructor(private readonly eventDateTimeUtil: EventDateTimeUtilService, private readonly eventService: EventService) {}

  public onCloseModal(): void {
    this.closeModal.emit();
  }

  public onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCloseModal();
    }
  }

  public getFormattedDate(): string {
    if (!this.selectedDate) return '';
    return this.eventDateTimeUtil.formatDateOnly(this.selectedDate);
  }

  public formatEventTime(eventTime: Date): string {
    return this.eventDateTimeUtil.formatTime(eventTime);
  }

  public isEventMultiDay(eventEntity: CalendarEventEntity): boolean {
    return this.eventDateTimeUtil.isEventMultiDay(eventEntity.event);
  }

  public truncateEventTitle(title: string): string {
    return this.eventService.truncateEventTitle(title, this.MAX_VISIBLE_SYMBOLS_OF_TITLE);
  }

  public getEventColor(eventEntity: CalendarEventEntity): string {
    return eventEntity.event.color || '#1a73e8';
  }
}
