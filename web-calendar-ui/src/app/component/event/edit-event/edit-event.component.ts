import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService } from '../../../service/event.service';
import { CalendarEvent } from '../../../model/calendar-event';
import { EventFormComponent } from '../event-form/event-form.component';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../../service/notification.service';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, RouterModule, EventFormComponent],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.css'
})
export class EditEventComponent implements OnInit {
  public event: CalendarEvent = null;
  public eventNotFound: boolean = false;
  public isSubmitting: boolean = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService
  ) {}

  public ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(+eventId);
    } else {
      this.eventNotFound = true;
    }
  }

  public onFormSubmit(eventData: CalendarEvent): void {
    if (!this.event) return;

    this.isSubmitting = true;
    eventData.id = this.event.id;

    this.eventService.updateEvent(this.event.id, eventData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.event = eventData;
        this.notificationService.showSuccess(
          'Event Updated',
          `"${eventData.title}" has been successfully updated.`
        );
        this.router.navigate(['/event', this.event.id]);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.notificationService.showHttpError(
          'Failed to Update Event',
          error,
          'Failed to update event. Please try again.'
        );
      }
    });
  }

  public onBackToEventDetails(): void {
    if (this.event) {
      this.router.navigate(['/event', this.event.id]);
    } else {
      this.router.navigate(['/calendar']);
    }
  }

  private loadEvent(id: number): void {
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
      },
      error: (error: HttpErrorResponse) => {
        this.eventNotFound = true;
        this.notificationService.showHttpError(
          'Event Not Found',
          error,
          'The event you are trying to edit could not be found.'
        );
      }
    });
  }
}
