import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../primengModule/primeng.module';
import { DatasService } from '../../services/datas/datas.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { Subject, takeUntil } from 'rxjs';
import { CityOption, Hotel, Review } from '../../interfaces/user.interface';

@Component({
  selector: 'app-hotel-detail-page',
  imports: [CommonModule, FormsModule, PrimeNgModule, InputNumberModule],
  templateUrl: './hotel-detail-page.component.html',
  styleUrl: './hotel-detail-page.component.scss',
})
export class HotelDetailPageComponent implements OnInit, OnDestroy {
  hotel?: Hotel;
  hotelId?: number;
  isLoading: boolean = true;
  selectedImage: string = '';
  // hotelSlug
  hotelSlug?: string;

  // Selected city
  selectedCity?: CityOption;

  // Booking details
  checkInDate?: Date;
  checkOutDate?: Date;
  guests: number = 2;
  rooms: number = 1;
  totalNights: number = 1;
  totalPrice: number = 0;

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datasService: DatasService
  ) {}

  // Gallery
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];

  // Mock reviews
  reviews: Review[] = [
    {
      id: 1,
      userName: 'Rajesh Kumar',
      rating: 5,
      date: '2025-09-15',
      comment:
        'Excellent stay! The staff was very friendly and the rooms were spotless. The location is perfect and the amenities exceeded our expectations.',
      avatar:
        'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=667eea&color=fff',
    },
    {
      id: 2,
      userName: 'Priya Sharma',
      rating: 4,
      date: '2025-09-10',
      comment:
        'Great hotel with beautiful views. The breakfast was delicious and the service was prompt. Only minor issue was the Wi-Fi speed.',
      avatar:
        'https://ui-avatars.com/api/?name=Priya+Sharma&background=764ba2&color=fff',
    },
    {
      id: 3,
      userName: 'David Wilson',
      rating: 5,
      date: '2025-09-05',
      comment:
        'Absolutely loved this place! The ambiance is wonderful and the location is very convenient. Will definitely come back.',
      avatar:
        'https://ui-avatars.com/api/?name=David+Wilson&background=f093fb&color=fff',
    },
    {
      id: 4,
      userName: 'Anita Desai',
      rating: 4,
      date: '2025-08-28',
      comment:
        'Very good experience overall. The room was comfortable and clean. The restaurant serves excellent local cuisine.',
      avatar:
        'https://ui-avatars.com/api/?name=Anita+Desai&background=4facfe&color=fff',
    },
  ];

  // Tabs
  activeTab: number = 0;

  // Nearby attractions (mock data)
  nearbyAttractions = [
    { name: 'Local Market', distance: '0.5 km', icon: 'pi-shopping-bag' },
    { name: 'Railway Station', distance: '2 km', icon: 'pi-car' },
    { name: 'Airport', distance: '15 km', icon: 'pi-send' },
    { name: 'Tourist Spot', distance: '3 km', icon: 'pi-map-marker' },
  ];

  loadHotelDetailsBySlug(slug: string): void {
    this.isLoading = true;
    setTimeout(() => {
      this.datasService.getHotelBySlug(slug).subscribe({
        next: (hotel) => {
          if (hotel) {
            this.hotel = hotel;
            this.hotelId = hotel.id; // Store ID for booking
            this.selectedImage = this.hotel.image;
            this.calculateTotalPrice();
          }
          this.isLoading = false;
        },
      });
    }, 1000);
  }

  ngOnInit(): void {
    // Get hotel ID from route params
    this.route.params.subscribe((params) => {
      this.hotelSlug = params['id']; // ✅ Now gets slug from URL
      this.loadHotelDetailsBySlug(this.hotelSlug);
      // this.hotelId = +params['id'];
      // this.loadHotelDetails();
    });

    // Subscribe to search parameters from the service
    this.datasService.searchParams$
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params.city) {
          this.selectedCity = params.city;
        }
        if (params.checkIn) {
          this.checkInDate = params.checkIn;
        }
        if (params.checkOut) {
          this.checkOutDate = params.checkOut;
        }

        // If dates are set, calculate price
        if (this.checkInDate && this.checkOutDate) {
          this.calculateTotalPrice();
        }
      });

    // Fallback: Get current search params if not already set
    const currentParams = this.datasService.getCurrentSearchParams();
    if (!this.selectedCity && currentParams.city) {
      this.selectedCity = currentParams.city;
    }
    if (!this.checkInDate && currentParams.checkIn) {
      this.checkInDate = currentParams.checkIn;
    }
    if (!this.checkOutDate && currentParams.checkOut) {
      this.checkOutDate = currentParams.checkOut;
    }

    // Set default dates if still not set
    if (!this.checkInDate) {
      this.checkInDate = new Date();
    }
    if (!this.checkOutDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.checkOutDate = tomorrow;
    }

    this.calculateTotalPrice();
  }

  loadHotelDetails(): void {
    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.datasService.getHotels().subscribe((hotels) => {
        this.hotel = hotels.find((h) => h.id === this.hotelId);

        if (this.hotel) {
          this.selectedImage = this.hotel.image;
          // Recalculate price after hotel is loaded
          this.calculateTotalPrice();
        }

        this.isLoading = false;
      });
    }, 1000);
  }

  calculateTotalPrice(): void {
    if (this.checkInDate && this.checkOutDate && this.hotel) {
      const diffTime = Math.abs(
        this.checkOutDate.getTime() - this.checkInDate.getTime()
      );
      this.totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Ensure at least 1 night
      if (this.totalNights === 0) {
        this.totalNights = 1;
      }

      this.totalPrice = this.hotel.price * this.totalNights * this.rooms;
    }
  }

  onDateChange(): void {
    // Ensure check-out is after check-in
    if (
      this.checkInDate &&
      this.checkOutDate &&
      this.checkInDate >= this.checkOutDate
    ) {
      const newCheckOut = new Date(this.checkInDate);
      newCheckOut.setDate(newCheckOut.getDate() + 1);
      this.checkOutDate = newCheckOut;
    }

    this.calculateTotalPrice();

    // Update service with new dates
    this.datasService.updateSearchParams({
      city: this.selectedCity,
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
    });
  }

  onRoomsChange(): void {
    this.calculateTotalPrice();
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(10 - Math.floor(rating)).fill(0);
  }

  bookNow(): void {
    // Ensure search params are synced before navigating
    this.syncToService();

    // Navigate to booking page with query parameters
    this.router.navigate(['/booking', this.hotelId], {
      queryParams: {
        rooms: this.rooms,
        guests: this.guests,
      },
    });
  }

  // Helper method to sync data to service
  private syncToService(): void {
    this.datasService.updateSearchParams({
      city: this.selectedCity,
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
    });
  }

  goBack(): void {
    this.router.navigate(['/hotel-search']);
  }

  shareHotel(): void {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: this.hotel?.name,
        text: `Check out ${this.hotel?.name} in ${this.hotel?.city_name}`,
        url: window.location.href,
      });
    }
  }

  addToWishlist(): void {
    // Implement wishlist functionality
    console.log('Added to wishlist:', this.hotel?.name);
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
  }

  getRatingDistribution(star: number): number {
    const count = this.reviews.filter(
      (r) => Math.floor(r.rating) === star
    ).length;
    return (count / this.reviews.length) * 100;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
