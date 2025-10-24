import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatasService } from '../../services/datas/datas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../primengModule/primeng.module';
import { Subject, takeUntil } from 'rxjs';
import {
  CityOption,
  Hotel,
  HotelSearchParams,
} from '../../interfaces/user.interface';
import { ViewModeEnum } from '../../enums/enums.enum';

type SortOption =
  | 'price-asc'
  | 'price-desc'
  | 'rating-asc'
  | 'rating-desc'
  | 'name';

@Component({
  selector: 'app-hotel-results',
  imports: [CommonModule, FormsModule, PrimeNgModule],
  templateUrl: './hotel-results.component.html',
  styleUrl: './hotel-results.component.scss',
})
export class HotelResultsComponent implements OnInit, OnDestroy {
  hotels: Hotel[] = [];
  filteredHotel: Hotel[] = [];
  selectedCity?: CityOption;
  isLoading: boolean = false;
  rating: string = '';
  rangeValues: number[] = [];
  minPrice: number = 0;
  maxPrice: number = 100;

  sortBy: SortOption = 'price-asc';
  ViewModeEnum = ViewModeEnum;
  viewMode: ViewModeEnum = ViewModeEnum.GRID;
  selectedAmenities: string[] = [];
  availableAmenities: string[] = [];
  showFilters: boolean = true;
  hasFreeCancellation: boolean = false;

  private destroy$ = new Subject<void>();

  sortOptions = [
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Rating: High to Low', value: 'rating-desc' },
    { label: 'Rating: Low to High', value: 'rating-asc' },
    { label: 'Name: A to Z', value: 'name' },
  ];

  constructor(private datasService: DatasService, private router: Router) {}

  ngOnInit(): void {
    // Get current search parameters from service
    const currentParams = this.datasService.getCurrentSearchParams();

    if (!currentParams.city) {
      // No search performed, redirect to search page
      this.router.navigate(['/hotel-search']);
      return;
    }

    this.selectedCity = currentParams.city;
    this.loadHotels();

    // Subscribe to search parameter changes
    this.datasService.searchParams$
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: HotelSearchParams) => {
        if (params.city && params.city !== this.selectedCity) {
          this.selectedCity = params.city;
          this.loadHotels();
        }
      });
  }

  loadHotels(): void {
    if (!this.selectedCity) return;

    this.isLoading = true;

    // Skeleton Loading before the original data loads
    setTimeout(() => {
      this.datasService
        .getHotelsByCity(this.selectedCity!.name)
        .subscribe((data) => {
          this.hotels = data;
          this.filteredHotel = this.hotels;

          // Extract unique amenities
          const amenitiesSet = new Set<string>();
          this.hotels.forEach((hotel) => {
            hotel.amenities?.forEach((amenity) => amenitiesSet.add(amenity));
          });
          this.availableAmenities = Array.from(amenitiesSet);

          // Compute min & max prices dynamically
          if (this.hotels.length > 0) {
            const prices = this.hotels.map((h) => h.price);
            this.minPrice = Math.min(...prices);
            this.maxPrice = Math.max(...prices);
            this.rangeValues = [this.minPrice, this.maxPrice];
          }

          this.applyFilters();
          this.isLoading = false;
        });
    }, 1500);
  }

  clearFilters(): void {
    this.rangeValues = [this.minPrice, this.maxPrice];
    this.rating = '';
    this.selectedAmenities = [];
    this.hasFreeCancellation = false;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.hotels];

    filtered = filtered.filter(
      (hotel) =>
        hotel.price >= this.rangeValues[0] && hotel.price <= this.rangeValues[1]
    );

    if (this.rating) {
      const selectedRating = parseInt(this.rating);
      filtered = filtered.filter((hotel) => hotel.rating >= selectedRating);
    }

    if (this.selectedAmenities.length > 0) {
      filtered = filtered.filter((hotel) =>
        this.selectedAmenities.every((amenity) =>
          hotel.amenities?.includes(amenity)
        )
      );
    }

    if (this.hasFreeCancellation) {
      filtered = filtered.filter((hotel) => hotel.freeCancellation);
    }

    filtered = this.sortHotels(filtered);
    this.filteredHotel = filtered;
  }

  sortHotels(hotels: Hotel[]): Hotel[] {
    const sorted = [...hotels];

    switch (this.sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating-asc':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'rating-desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  navigateToHotelDetails(hotel: Hotel): void {
    this.router.navigate(['/hotel-details', hotel.slug]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
