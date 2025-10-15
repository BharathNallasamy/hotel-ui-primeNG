import { Routes } from '@angular/router';
import { HotelSearchComponent } from './hotel-components/hotel-search/hotel-search.component';
import { HotelDetailPageComponent } from './hotel-components/hotel-detail-page/hotel-detail-page.component';

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
    path: '**',
    redirectTo: '/hotel-search',
  },
  // {
  //   path: '',
  //   component: HotelSearchComponent,
  // },
  // {
  //   path: 'hotel-details',
  //   component: HotelDetailPageComponent,
  // },
  // {
  //   path: '**',
  //   redirectTo: '',
  //   pathMatch: 'full',
  // },
];
