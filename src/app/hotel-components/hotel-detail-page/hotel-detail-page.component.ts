import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../primengModule/primeng.module';
import { DatasService, Hotel } from '../../services/datas/datas.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { Subscription } from 'rxjs';

interface Review {
  id: number;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  avatar?: string;
}

@Component({
  selector: 'app-hotel-detail-page',
  imports: [CommonModule, FormsModule, PrimeNgModule, InputNumberModule],
  templateUrl: './hotel-detail-page.component.html',
  styleUrl: './hotel-detail-page.component.scss',
})
export class HotelDetailPageComponent implements OnInit {
  hotel?: Hotel;
  hotelId?: number;
  isLoading: boolean = true;
  selectedImage: string = '';

  // Booking details
  checkInDate?: Date;
  checkOutDate?: Date;
  guests: number = 2;
  rooms: number = 1;
  totalNights: number = 1;
  totalPrice: number = 0;

  // Subscriptions
  private bookingDetailsSubscription?: Subscription;

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

  ngOnInit(): void {
    // Get hotel ID from route params
    this.route.params.subscribe((params) => {
      this.hotelId = +params['id'];
      this.loadHotelDetails();
    });

    // Get dates from query params if available
    this.route.queryParams.subscribe((params) => {
      if (params['checkIn']) {
        this.checkInDate = new Date(params['checkIn']);
      } else {
        this.checkInDate = new Date();
      }

      if (params['checkOut']) {
        this.checkOutDate = new Date(params['checkOut']);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.checkOutDate = tomorrow;
      }

      this.calculateTotalPrice();
    });
  }

  loadHotelDetails(): void {
    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      // In real app, you'd call: this.datasService.getHotelById(this.hotelId)
      // For now, we'll get all hotels and find the one with matching ID
      this.datasService.getHotels().subscribe((hotels) => {
        this.hotel = hotels.find((h) => h.id === this.hotelId);

        if (this.hotel) {
          this.selectedImage = this.hotel.image;
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
      this.totalPrice = this.hotel.price * this.totalNights * this.rooms;
    }
  }

  onDateChange(): void {
    this.calculateTotalPrice();
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
    // Navigate to booking page or show booking modal
    console.log('Booking hotel:', {
      hotelId: this.hotelId,
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
      rooms: this.rooms,
      guests: this.guests,
      totalPrice: this.totalPrice,
    });

    // You can implement your booking logic here
    // For example:
    // this.router.navigate(['/booking', this.hotelId]);
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
}
