import { Injectable } from '@angular/core';
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
  getCityNames(): Observable<{ id: number; name: string }[]> {
    // Create a map to ensure unique cities while preserving ID reference
    const cityMap = new Map<string, number>();

    this.hotels.forEach((hotel) => {
      if (!cityMap.has(hotel.city_name)) {
        // Use the first hotel ID found for this city as reference
        cityMap.set(hotel.city_name, hotel.id);
      }
    });

    const cityObjects = Array.from(cityMap.entries()).map(
      ([cityName, hotelId]) => ({
        id: hotelId,
        name: cityName,
      })
    );

    return of(cityObjects);
  }
}
