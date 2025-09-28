import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationMessage } from '../../service/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit, OnDestroy {
  public notifications: NotificationMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe(
      notifications => this.notifications = notifications
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public onDismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  public getIconPath(type: string): string {
    switch (type) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'info':
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  public getNotificationClasses(type: string): string {
    const baseClasses = 'notification-item';
    switch (type) {
      case 'success':
        return `${baseClasses} notification-success`;
      case 'error':
        return `${baseClasses} notification-error`;
      case 'warning':
        return `${baseClasses} notification-warning`;
      case 'info':
      default:
        return `${baseClasses} notification-info`;
    }
  }
}