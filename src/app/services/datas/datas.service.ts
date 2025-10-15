import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';
import { Observable, of } from 'rxjs';
import hotelData from '../../../assets/data/new_hotel_data.json';

export interface Hotel {
  id: number;
  name: string;
  city: number;
  city_name: string;
  country: string;
  country_id: number;
  image: string;
  rating: number;
  area: string;
  address: string;
  amenities: string[];
  price: number;
  freeCancellation: boolean;
  onlyLeft: number;
  thumbnails: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DatasService {
  private hotels: Hotel[] = [];

  constructor() {
    this.loadHotels();
    console.log('Hotels loaded in service:', this.hotels);
  }

  // Load JSON into the private array
  private loadHotels() {
    this.hotels = hotelData as Hotel[];
  }

  // Expose hotels as an Observable for the UI
  getHotels(): Observable<Hotel[]> {
    return of(this.hotels);
  }

  getHotelsByCity(cityName: string): Observable<Hotel[]> {
    const filteredData = this.hotels.filter(
      (hotel) => hotel.city_name === cityName
    );
    return of(filteredData);
  }

  // ✅ New function to get unique city names
  getCityNames(): Observable<{ name: string }[]> {
    const cities = this.hotels.map((hotel) => hotel.city_name);
    const uniqueCities = Array.from(new Set(cities));
    // Map to object format
    const cityObjects = uniqueCities.map((city) => ({ name: city }));
    return of(cityObjects);
  }
}
