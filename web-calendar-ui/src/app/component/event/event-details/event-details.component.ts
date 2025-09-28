import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from '../../../service/event.service';
import { CalendarEvent } from '../../../model/calendar-event';
import { EventDateTimeUtilService } from '../../../service/event-date-time-util.service';
import { NotificationService } from '../../../service/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.css'
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  public event: CalendarEvent | null = null;
  public notFound: boolean = false;
  private deleteEventSubscription: Subscription | null = null;
  private loadEventSubscription: Subscription | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly eventService: EventService,
    private readonly eventDateTimeUtil: EventDateTimeUtilService,
    private readonly notificationService: NotificationService
  ) {}

  public ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(+eventId);
    }
  }

  public get formattedStartDateTime(): string {
    if (!this.event?.startTime) return '';
    return this.formatDateTime(this.event.startTime);
  }

  public get formattedEndDateTime(): string {
    if (!this.event?.endTime) return '';
    return this.formatDateTime(this.event.endTime);
  }

  public onBackToCalendar(): void {
    this.router.navigate(['/calendar']);
  }

  public onEditEvent(): void {
    if (this.event) {
      this.router.navigate(['/event', this.event.id, 'edit']);
    }
  }

  public onDeleteEvent(): void {
    if (this.event && confirm('Are you sure you want to delete this event?')) {
      const eventTitle = this.event.title;
      this.deleteEventSubscription = this.eventService.deleteEventById(this.event.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Event Deleted',
            `"${eventTitle}" has been successfully deleted from your calendar.`
          );
          this.router.navigate(['/calendar']);
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.showError(
            'Failed to Delete Event',
            'Unable to delete the event. Please try again.'
          );
        }
      });
    }
  }

  private loadEvent(id: number): void {
    this.loadEventSubscription = this.eventService.getEventById(id).subscribe({
      next: (eventById) => {
        this.event = eventById;
      },
      error: () => {
        this.notFound = true;
      }
    });
  }

  public formatDateTime(date: Date): string {
    return this.eventDateTimeUtil.formatDateTime(date);
  }

  public getEventColor(): string {
    return this.event?.color || '#1a73e8';
  }

  public ngOnDestroy(): void {
    if (this.deleteEventSubscription && !this.deleteEventSubscription.closed) {
      this.deleteEventSubscription.unsubscribe();
    }
    if (this.loadEventSubscription && !this.loadEventSubscription.closed) {
      this.loadEventSubscription.unsubscribe();
    }
  }
}
