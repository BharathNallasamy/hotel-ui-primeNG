import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatasService, Hotel } from '../../services/datas/datas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../primengModule/primeng.module';

interface CityOption {
  name: string;
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
export class HotelSearchComponent {
  hotels: Hotel[] = [];
  filteredHotel: Hotel[] = [];
  selectedCity?: CityOption;
  value1?: Date;
  value2?: Date;
  cities: { name: string }[] = [];
  isLoading: boolean = false;
  rating: string = '';
  rangeValues: number[] = [];
  searchPerformed: boolean = false;
  rooms: number = 1;
  guests: number = 2;
  minPrice: number = 0;
  maxPrice: number = 100;

  // New features
  sortBy: SortOption = 'price-asc';
  viewMode: 'grid' | 'list' = 'grid';
  selectedAmenities: string[] = [];
  availableAmenities: string[] = [];
  showFilters: boolean = true;
  hasFreeCancellation: boolean = false;

  sortOptions = [
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Rating: High to Low', value: 'rating-desc' },
    { label: 'Rating: Low to High', value: 'rating-asc' },
    { label: 'Name: A to Z', value: 'name' },
  ];

  constructor(private datasService: DatasService, private router: Router) {}

  ngOnInit(): void {
    const today = new Date();
    this.value1 = today;

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    this.value2 = tomorrow;

    this.datasService.getCityNames().subscribe((data) => {
      this.cities = data;
      console.log('City options for dropdown:', this.cities);
    });
  }

  onSearch(): void {
    if (!this.selectedCity) {
      return;
    }

    this.isLoading = true;
    this.searchPerformed = true;

    setTimeout(() => {
      this.datasService
        .getHotelsByCity(this.selectedCity?.name ?? '')
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

    // Filter by price range
    filtered = filtered.filter(
      (hotel) =>
        hotel.price >= this.rangeValues[0] && hotel.price <= this.rangeValues[1]
    );

    // Filter by rating
    if (this.rating) {
      const selectedRating = parseInt(this.rating);
      filtered = filtered.filter((hotel) => hotel.rating >= selectedRating);
    }

    // Filter by amenities
    if (this.selectedAmenities.length > 0) {
      filtered = filtered.filter((hotel) =>
        this.selectedAmenities.every((amenity) =>
          hotel.amenities?.includes(amenity)
        )
      );
    }

    // Filter by free cancellation
    if (this.hasFreeCancellation) {
      filtered = filtered.filter((hotel) => hotel.freeCancellation);
    }

    // Apply sorting
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
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  navigateToHotelDetails(hotelId: number): void {
    this.router.navigate(['/hotel-details', hotelId], {
      // queryParams: {
      //   checkIn: this.value1?.toISOString(),
      //   checkOut: this.value2?.toISOString(),
      // },
    });
  }
}
