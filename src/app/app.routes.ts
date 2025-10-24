import { Routes } from '@angular/router';
import { HotelSearchComponent } from './hotel-components/hotel-search/hotel-search.component';
import { HotelDetailPageComponent } from './hotel-components/hotel-detail-page/hotel-detail-page.component';
import { BookingHotelComponent } from './hotel-components/booking-hotel/booking-hotel.component';
import { HotelResultsComponent } from './hotel-components/hotel-results/hotel-results.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/hotel-search',
    pathMatch: 'full',
  },
  {
    path: 'hotel-search',
    component: HotelSearchComponent,
    title: 'Search Hotels',
  },
  {
    path: 'hotel-details/:id',
    component: HotelDetailPageComponent,
    title: 'Hotel Details',
  },
  {
    path: 'booking/:id',
    component: BookingHotelComponent,
    title: 'Complete Booking',
  },
  {
    path: 'hotel-results',
    component: HotelResultsComponent,
    title: 'Hotel Search results',
  },
  {
    path: '**',
    redirectTo: '/hotel-search',
  },
];
