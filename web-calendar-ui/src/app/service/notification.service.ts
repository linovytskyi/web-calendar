import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../model/api-error';

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notifications$ = new BehaviorSubject<NotificationMessage[]>([]);
  private notificationCounter: number = 0;

  constructor() {}

  public getNotifications(): Observable<NotificationMessage[]> {
    return this.notifications$.asObservable();
  }

  public showSuccess(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration,
      dismissible: true
    });
  }

  public showError(title: string, message: string, duration: number = 8000): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      duration,
      dismissible: true
    });
  }

  public showWarning(title: string, message: string, duration: number = 6000): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration,
      dismissible: true
    });
  }

  public showInfo(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration,
      dismissible: true
    });
  }

  public dismiss(id: string): void {
    const notifications = this.notifications$.value.filter(n => n.id !== id);
    this.notifications$.next(notifications);
  }

  public dismissAll(): void {
    this.notifications$.next([]);
  }

  public showHttpError(title: string, error: HttpErrorResponse, fallbackMessage: string = 'An error occurred. Please try again.'): void {
    let errorMessage: string;

    if (error.error && typeof error.error === 'object') {
      const apiError = error.error as ApiError;
      errorMessage = apiError.message || apiError.error || fallbackMessage;
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = fallbackMessage;
    }

    this.showError(title, errorMessage);
  }

  private addNotification(notification: Omit<NotificationMessage, 'id'>): void {
    const id = `notification-${++this.notificationCounter}`;
    const newNotification: NotificationMessage = { ...notification, id };

    const notifications = [...this.notifications$.value, newNotification];
    this.notifications$.next(notifications);

    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, notification.duration);
    }
  }
}