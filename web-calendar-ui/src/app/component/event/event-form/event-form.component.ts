import {Component, OnDestroy, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { CalendarEvent } from '../../../model/calendar-event';
import { debounceTime } from 'rxjs/operators';
import {Subscription} from 'rxjs';
import { EventDateTimeUtilService } from '../../../service/event-date-time-util.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css'
})
export class EventFormComponent implements OnInit, OnDestroy {
  @Input()
  public existingEvent: CalendarEvent = null;
  @Input()
  public isEditMode = false;
  @Output()
  public formSubmit = new EventEmitter<Omit<CalendarEvent, 'id'>>();
  @Output()
  public formCancel = new EventEmitter<void>();

  public eventForm: FormGroup;
  private subscriptions: Subscription[] = [];

  private readonly MIN_TITLE_LENGTH = 1;
  private readonly MAX_TITLE_LENGTH = 255;

  public get isFullDay(): boolean {
    return this.eventForm.get('isFullDay')?.value || false;
  }

  constructor(private readonly fb: FormBuilder,
              private readonly eventDateTimeUtil: EventDateTimeUtilService) { }

  public ngOnInit(): void {
    this.eventForm = this.createForm();
    this.setFormValues();
    this.setupFormSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public onSubmit(): void {
    if (this.eventForm.valid) {
      this.emitFormData();
    } else {
      this.markFormGroupTouched();
    }
  }

  public onCancel(): void {
    this.formCancel.emit();
  }

  public hasError(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field?.invalid && (field.dirty || field.touched));
  }

  public getError(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (!field || !field.errors || !(field.dirty || field.touched)) {
      return '';
    }

    for (const errorKey of Object.keys(field.errors)) {
      const errorMessage = this.buildErrorMessage(fieldName, errorKey, field.errors[errorKey]);
      if (errorMessage) return errorMessage;
    }

    return '';
  }

  private emitFormData(): void {
    const formValue = this.eventForm.value;
    let eventData: Omit<CalendarEvent, 'id'> = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      startTime: this.eventDateTimeUtil.createDateFromDateTimeString(formValue.startDateTime),
      endTime: this.eventDateTimeUtil.createDateFromDateTimeString(formValue.endDateTime),
      location: formValue.location.trim(),
    };

    if (formValue.isFullDay) {
      eventData = this.eventDateTimeUtil.setEventAsFullDay(eventData as CalendarEvent);
    }


    this.formSubmit.emit(eventData);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(this.MIN_TITLE_LENGTH), Validators.maxLength(this.MAX_TITLE_LENGTH)]],
      description: [''],
      startDateTime: ['', Validators.required],
      endDateTime: ['', [Validators.required, this.endDateValidator.bind(this)]],
      location: [''],
      isFullDay: [true]
    });
  }

  private setFormValues(): void {
    if (this.existingEvent) {
      const isFullDay = this.isEventFullDay(this.existingEvent);

      this.eventForm.patchValue({
        title: this.existingEvent.title,
        description: this.existingEvent.description,
        startDateTime: this.eventDateTimeUtil.formatEventDateTimeLocal(this.existingEvent),
        endDateTime: this.eventDateTimeUtil.formatEventEndDateTimeLocal(this.existingEvent),
        location: this.existingEvent.location,
        isFullDay: isFullDay
      });
    } else {
      this.setDefaultDates();
    }
  }

  private isEventFullDay(event: CalendarEvent): boolean {
    return this.eventDateTimeUtil.isEventFullDay(event);
  }

  private setDefaultDates(): void {
    const defaultTimes = this.eventDateTimeUtil.createDefaultFullDayEvent(this.eventDateTimeUtil.getCurrentDate());

    this.eventForm.patchValue({
      startDateTime: this.eventDateTimeUtil.formatEventDateTimeLocal({ startTime: defaultTimes.startTime } as any),
      endDateTime: this.eventDateTimeUtil.formatEventDateTimeLocal({ startTime: defaultTimes.endTime } as any)
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      control?.markAsTouched();
    });
  }

  private endDateValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!this.eventForm) return null;

    const startDateTime = this.eventForm.get('startDateTime')?.value;
    const endDateTime = control.value;
    if (!startDateTime || !endDateTime) return null;

    const startDate = this.eventDateTimeUtil.createDateFromDateTimeString(startDateTime);
    const endDate = this.eventDateTimeUtil.createDateFromDateTimeString(endDateTime);
    if (!this.eventDateTimeUtil.isValidDate(startDate) || !this.eventDateTimeUtil.isValidDate(endDate)) return null;

    return endDate < startDate
      ? { dateRange: { message: 'End date and time must be after start date and time' } }
      : null;
  };

  private updateEndDateIfNeeded(startDateTime: string): void {
    const currentEndDateTime = this.eventForm.get('endDateTime')?.value;
    if (!currentEndDateTime) return;

    const startDate = this.eventDateTimeUtil.createDateFromDateTimeString(startDateTime);
    const endDate = this.eventDateTimeUtil.createDateFromDateTimeString(currentEndDateTime);
    const isFullDay = this.eventForm.get('isFullDay')?.value;

    if (isFullDay) {
      const fullDayTimes = this.eventDateTimeUtil.createDefaultFullDayEvent(startDate);
      this.eventForm.patchValue({
        endDateTime: this.eventDateTimeUtil.formatEventDateTimeLocal({ startTime: fullDayTimes.endTime } as any)
      });
    } else if (endDate <= startDate) {
      const timedEvent = this.eventDateTimeUtil.createDefaultTimedEvent(startDate, startDate.getHours(), 1);
      this.eventForm.patchValue({
        endDateTime: this.eventDateTimeUtil.formatEventDateTimeLocal({ startTime: timedEvent.endTime } as any)
      });
    }
  }


  private buildErrorMessage(fieldName: string, errorKey: string, errorValue: any): string | null {
    const fieldDisplay = this.getFieldDisplayName(fieldName);

    const errorMessages: { [key: string]: string } = {
      required: `${fieldDisplay} is required`,
      minlength: `${fieldDisplay} must be at least ${errorValue?.requiredLength} characters`,
      dateRange: errorValue?.message || 'End date and time must be after start date and time'
    };

    return errorMessages[errorKey] || null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      title: 'Event title',
      startDateTime: 'Start date and time',
      endDateTime: 'End date and time'
    };
    return displayNames[fieldName] || fieldName;
  }

  private setupFormSubscriptions(): void {
    const isFullDayCtrl = this.eventForm.get('isFullDay');
    const startCtrl = this.eventForm.get('startDateTime');
    const endCtrl = this.eventForm.get('endDateTime');

    if (!isFullDayCtrl || !startCtrl || !endCtrl) return;

    this.subscriptions.push(
      this.subscribeToFullDayToggle(isFullDayCtrl),
      this.subscribeToStartDateChanges(startCtrl, endCtrl),
      this.subscribeToEndDateChanges(endCtrl)
    );
  }

  private subscribeToFullDayToggle(isFullDayCtrl: AbstractControl): Subscription {
    return isFullDayCtrl.valueChanges.subscribe(() => this.onWholeDayToggle());
  }

  private onWholeDayToggle(): void {
    const currentStartDateTime = this.eventForm.get('startDateTime')?.value;
    if (!currentStartDateTime) return;

    const currentDate = this.eventDateTimeUtil.createDateFromDateTimeString(currentStartDateTime);
    const isFullDay = this.eventForm.get('isFullDay')?.value;

    if (isFullDay) {
      this.applyFullDayDates(currentDate);
    } else {
      this.applyTimedEventDates(currentDate);
    }
  }

  private applyFullDayDates(date: Date): void {
    const fullDayTimes = this.eventDateTimeUtil.createDefaultFullDayEvent(date);
    this.patchEventDates(fullDayTimes.startTime, fullDayTimes.endTime);
  }

  private applyTimedEventDates(date: Date): void {
    const timedEvent = this.eventDateTimeUtil.createDefaultTimedEvent(date);
    this.patchEventDates(timedEvent.startTime, timedEvent.endTime);
  }

  private patchEventDates(start: Date, end: Date): void {
    this.eventForm.patchValue({
      startDateTime: this.eventDateTimeUtil.formatEventDateTimeLocal({ startTime: start } as any),
      endDateTime: this.eventDateTimeUtil.formatEventDateTimeLocal({ startTime: end } as any)
    });
  }

  private subscribeToStartDateChanges(
    startCtrl: AbstractControl,
    endCtrl: AbstractControl
  ): Subscription {
    return startCtrl.valueChanges
      .pipe(debounceTime(100))
      .subscribe(value => {
        if (!value) return;
        this.updateEndDateIfNeeded(value);
        endCtrl.updateValueAndValidity();
      });
  }

  private subscribeToEndDateChanges(endCtrl: AbstractControl): Subscription {
    return endCtrl.valueChanges
      .pipe(debounceTime(100))
      .subscribe(() => endCtrl.updateValueAndValidity());
  }
}
