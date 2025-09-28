import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from '../../../service/event.service';
import { CalendarEvent } from '../../../model/calendar-event';
import { EventFormComponent } from '../event-form/event-form.component';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../../service/notification.service';

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [CommonModule, RouterModule, EventFormComponent],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css'
})
export class AddEventComponent implements OnDestroy {
  public isSubmitting: boolean = false;
  private addEventSubscription: Subscription | null = null;

  constructor(
    private readonly eventService: EventService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) { }

  public onFormSubmit(eventData: CalendarEvent): void {
    this.isSubmitting = true;

    this.addEventSubscription = this.eventService.addEvent(eventData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notificationService.showSuccess(
          'Event Created',
          `"${eventData.title}" has been successfully added to your calendar.`
        );
        this.router.navigate(['/calendar']);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.notificationService.showHttpError(
          'Failed to Create Event',
          error,
          'Failed to create event. Please try again.'
        );
      }
    });
  }

  public onFormCancel(): void {
    this.router.navigate(['/calendar']);
  }

  public ngOnDestroy(): void {
    if (this.addEventSubscription && !this.addEventSubscription.closed) {
      this.addEventSubscription.unsubscribe();
    }
  }
}
