import { Routes } from '@angular/router';
import { CalendarComponent } from './component/calendar/calendar.component';
import { AddEventComponent } from './component/event/add-event/add-event.component';
import { EventDetailsComponent } from './component/event/event-details/event-details.component';
import { EditEventComponent } from './component/event/edit-event/edit-event.component';

export const routes: Routes = [
  { path: '', component: CalendarComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'add-event', component: AddEventComponent },
  { path: 'event/:id', component: EventDetailsComponent },
  { path: 'event/:id/edit', component: EditEventComponent },
  { path: '**', redirectTo: '' }
];
