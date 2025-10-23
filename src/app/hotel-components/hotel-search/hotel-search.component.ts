import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatasService } from '../../services/datas/datas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../primengModule/primeng.module';
import { Subject, takeUntil } from 'rxjs';
import { CityOption, Hotel, HotelSearchParams } from '../../interfaces/user.interface';

enum ViewModeEnum {
  GRID = 'grid',
  LIST = 'list',
}

type SortOption =
  | 'price-asc'
  | 'price-desc'
  | 'rating-asc'
  | 'rating-desc'
  | 'name';

@Component({
  selector: 'app-hotel-search',
  imports: [CommonModule, FormsModule, PrimeNgModule],
  templateUrl: './hotel-search.component.html',
  styleUrl: './hotel-search.component.scss',
})
export class HotelSearchComponent implements OnInit, OnDestroy {
  hotels: Hotel[] = [];
  filteredHotel: Hotel[] = [];
  minDate: Date = new Date();

  // These will be synced with the service
  selectedCity?: CityOption;
  value1?: Date;
  value2?: Date;

  cities: CityOption[] = [];
  isLoading: boolean = false;
  rating: string = '';
  rangeValues: number[] = [];
  searchPerformed: boolean = false;
  rooms: number = 1;
  guests: number = 2;
  minPrice: number = 0;
  maxPrice: number = 100;

  sortBy: SortOption = 'price-asc';
  ViewMode = ViewModeEnum;
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
    // Initialize dates with defaults if not set in service
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.value1 = today;
    this.value2 = tomorrow;

    // Load existing search parameters from service
    const currentParams = this.datasService.getCurrentSearchParams();
    if (currentParams.city) {
      this.selectedCity = currentParams.city;
    }
    if (currentParams.checkIn) {
      this.value1 = currentParams.checkIn;
    }
    if (currentParams.checkOut) {
      this.value2 = currentParams.checkOut;
    }

    // Subscribe to search parameter changes from other components
    this.datasService.searchParams$
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: HotelSearchParams) => {
        if (params.city !== undefined) {
          this.selectedCity = params.city;
        }
        if (params.checkIn !== undefined) {
          this.value1 = params.checkIn;
        }
        if (params.checkOut !== undefined) {
          this.value2 = params.checkOut;
        }
      });

    // Load cities for dropdown using the enhanced method
    this.datasService.getCitiesForSearch().subscribe((data) => {
      this.cities = data;
    });
  }

  // Called when city selection changes
  onCityChange(): void {
    this.syncToService();
  }

  // Called when check-in date changes
  onCheckInChange(): void {
    // Ensure check-out is always after check-in
    if (this.value1 && this.value2 && this.value1 >= this.value2) {
      const newCheckOut = new Date(this.value1);
      newCheckOut.setDate(newCheckOut.getDate() + 1);
      this.value2 = newCheckOut;
    }
    this.syncToService();
  }

  // Called when check-out date changes
  onCheckOutChange(): void {
    // Ensure check-out is after check-in
    if (this.value1 && this.value2 && this.value1 >= this.value2) {
      this.value2 = new Date(this.value1);
      this.value2.setDate(this.value2.getDate() + 1);
    }
    this.syncToService();
  }

  // Sync local values to service
  private syncToService(): void {
    const params: HotelSearchParams = {
      city: this.selectedCity,
      checkIn: this.value1,
      checkOut: this.value2,
    };
    this.datasService.updateSearchParams(params);
  }

  onSearch(): void {
    if (!this.selectedCity) {
      console.warn('Please select a city');
      return;
    }

    // Sync to service before searching
    this.syncToService();

    // Validate using service method
    const validation = this.datasService.validateSearchParams({
      city: this.selectedCity,
      checkIn: this.value1,
      checkOut: this.value2,
    });

    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      // TODO: Show error message to user using toast/alert
      alert(validation.errors.join('\n'));
      return;
    }

    this.isLoading = true;
    this.searchPerformed = true;

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

  updateRange(type: 'min' | 'max', event: any): void {
    const value = Number(event.target.value);

    if (type === 'min') {
      if (value <= this.rangeValues[1] && value >= this.minPrice) {
        this.rangeValues = [value, this.rangeValues[1]];
      }
    } else {
      if (value >= this.rangeValues[0] && value <= this.maxPrice) {
        this.rangeValues = [this.rangeValues[0], value];
      }
    }
    this.applyFilters();
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

  toggleViewMode(): void {
    this.viewMode =
      this.viewMode === ViewModeEnum.GRID
        ? ViewModeEnum.LIST
        : ViewModeEnum.GRID;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  navigateToHotelDetails(hotelId: number): void {
    this.syncToService();
    this.router.navigate(['/hotel-details', hotelId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
