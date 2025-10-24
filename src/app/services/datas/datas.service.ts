import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import hotelData from '../../../assets/data/new_hotel_data.json';
import {
  CityOption,
  Hotel,
  HotelSearchParams,
} from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class DatasService {
  private hotels: Hotel[] = [];

  // Search parameters subject for sharing across components
  private searchParamsSubject = new BehaviorSubject<HotelSearchParams>({});
  public searchParams$: Observable<HotelSearchParams> =
    this.searchParamsSubject.asObservable();

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

  // Get hotels filtered by city name
  getHotelsByCity(cityName: string): Observable<Hotel[]> {
    const filteredData = this.hotels.filter(
      (hotel) => hotel.city_name === cityName
    );
    return of(filteredData);
  }

  // Get hotels by search parameters
  getHotelsBySearchParams(params: HotelSearchParams): Observable<Hotel[]> {
    if (!params.city) {
      return of([]);
    }
    return this.getHotelsByCity(params.city.name);
  }

  // Get unique city names as array of objects
  getCityNames(): Observable<{ id: number; name: string }[]> {
    const cityMap = new Map<string, number>();

    this.hotels.forEach((hotel) => {
      if (!cityMap.has(hotel.city_name)) {
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

  // Get cities formatted for hotel search component (with CityOption interface)
  getCitiesForSearch(): Observable<CityOption[]> {
    return this.getCityNames().pipe(
      map((cities) => {
        // Create a map to get country for each city
        const cityCountryMap = new Map<string, string>();

        this.hotels.forEach((hotel) => {
          if (!cityCountryMap.has(hotel.city_name)) {
            cityCountryMap.set(hotel.city_name, hotel.country);
          }
        });

        return cities.map((city) => ({
          name: city.name,
          code: city.name.toUpperCase().replace(/\s+/g, '_'),
          country: cityCountryMap.get(city.name),
          cityId: city.id,
        }));
      })
    );
  }

  // Get unique countries
  getCountries(): Observable<string[]> {
    const countries = [...new Set(this.hotels.map((hotel) => hotel.country))];
    return of(countries.sort());
  }

  // Get cities by country
  getCitiesByCountry(country: string): Observable<CityOption[]> {
    return this.getCitiesForSearch().pipe(
      map((cities) => cities.filter((city) => city.country === country))
    );
  }

  getHotelBySlug(slug: string): Observable<Hotel | undefined> {
    return this.getHotels().pipe(
      map((hotels) => hotels.find((h) => h.slug === slug))
    );
  }

  /**
   * Update search parameters
   */
  updateSearchParams(params: HotelSearchParams): void {
    this.searchParamsSubject.next(params);
  }

  /**
   * Get current search parameters
   */
  getCurrentSearchParams(): HotelSearchParams {
    return this.searchParamsSubject.value;
  }

  /**
   * Clear search parameters
   */
  clearSearchParams(): void {
    this.searchParamsSubject.next({});
  }

  /**
   * Validate search parameters
   */
  validateSearchParams(params: HotelSearchParams): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!params.city) {
      errors.push('Please select a destination');
    }

    if (!params.checkIn) {
      errors.push('Please select check-in date');
    }

    if (!params.checkOut) {
      errors.push('Please select check-out date');
    }

    if (
      params.checkIn &&
      params.checkOut &&
      params.checkIn >= params.checkOut
    ) {
      errors.push('Check-out date must be after check-in date');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate number of nights between check-in and check-out
   */
  calculateNights(checkIn: Date, checkOut: Date): number {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get hotel by ID
   */
  getHotelById(id: number): Observable<Hotel | undefined> {
    const hotel = this.hotels.find((h) => h.id === id);
    return of(hotel);
  }

  /**
   * Filter hotels by price range
   */
  getHotelsByPriceRange(min: number, max: number): Observable<Hotel[]> {
    const filtered = this.hotels.filter(
      (hotel) => hotel.price >= min && hotel.price <= max
    );
    return of(filtered);
  }

  /**
   * Filter hotels by rating
   */
  getHotelsByMinRating(minRating: number): Observable<Hotel[]> {
    const filtered = this.hotels.filter((hotel) => hotel.rating >= minRating);
    return of(filtered);
  }

  /**
   * Search hotels with multiple filters
   */
  searchHotelsAdvanced(params: {
    cityName?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    freeCancellation?: boolean;
    amenities?: string[];
  }): Observable<Hotel[]> {
    let filtered = [...this.hotels];

    if (params.cityName) {
      filtered = filtered.filter((h) => h.city_name === params.cityName);
    }

    if (params.minPrice !== undefined) {
      filtered = filtered.filter((h) => h.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((h) => h.price <= params.maxPrice!);
    }

    if (params.minRating !== undefined) {
      filtered = filtered.filter((h) => h.rating >= params.minRating!);
    }

    if (params.freeCancellation !== undefined) {
      filtered = filtered.filter(
        (h) => h.freeCancellation === params.freeCancellation
      );
    }

    if (params.amenities && params.amenities.length > 0) {
      filtered = filtered.filter((h) =>
        params.amenities!.every((amenity) => h.amenities.includes(amenity))
      );
    }

    return of(filtered);
  }
}
