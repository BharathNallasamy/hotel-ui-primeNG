import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../primengModule/primeng.module';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasService } from '../../services/datas/datas.service';
import { Subject, takeUntil } from 'rxjs';
import {
  CityOption,
  Confetti,
  GuestDetails,
  Hotel,
  PaymentMethod,
} from '../../interfaces/user.interface';

@Component({
  selector: 'app-booking-hotel',
  imports: [CommonModule, FormsModule, PrimeNgModule],
  templateUrl: './booking-hotel.component.html',
  styleUrl: './booking-hotel.component.scss',
})
export class BookingHotelComponent implements OnInit, OnDestroy, AfterViewInit {
  // Use setter/getter pattern for ViewChild to handle conditional rendering
  private _confettiCanvas?: ElementRef<HTMLCanvasElement>;

  @ViewChild('confettiCanvas')
  set confettiCanvas(value: ElementRef<HTMLCanvasElement> | undefined) {
    this._confettiCanvas = value;
    if (value && this.showSuccessDialog) {
      // Setup canvas when it becomes available
      this.setupCanvas();
    }
  }

  get confettiCanvas(): ElementRef<HTMLCanvasElement> | undefined {
    return this._confettiCanvas;
  }

  hotel?: Hotel;
  hotelId?: number;
  isLoading: boolean = true;

  // Search parameters
  selectedCity?: CityOption;
  checkInDate?: Date;
  checkOutDate?: Date;
  rooms: number = 1;
  guests: number = 2;

  // Pricing
  totalNights: number = 1;
  basePrice: number = 0;
  serviceCharge: number = 0;
  taxes: number = 0;
  totalPrice: number = 0;
  finalAmount: number = 0;

  // Guest details
  guestDetails: GuestDetails = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  };

  // Payment
  selectedPaymentMethod: string = '';
  paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'pi-credit-card' },
    { id: 'upi', name: 'UPI', icon: 'pi-mobile' },
    { id: 'netbanking', name: 'Net Banking', icon: 'pi-building' },
    { id: 'wallet', name: 'Wallet', icon: 'pi-wallet' },
  ];

  // Terms acceptance
  acceptTerms: boolean = false;

  // Booking confirmation
  showSuccessDialog: boolean = false;
  bookingReference: string = '';

  // Confetti animation
  private confettiParticles: Confetti[] = [];
  private confettiAnimationFrame?: number;
  private confettiCtx?: CanvasRenderingContext2D;
  private resizeListener?: () => void;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datasService: DatasService
  ) {}

  ngOnInit(): void {
    // Get hotel ID from route params
    this.route.params.subscribe((params) => {
      this.hotelId = +params['id'];
      this.loadHotelDetails();
    });

    // Get search parameters from service
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

        if (this.checkInDate && this.checkOutDate && this.hotel) {
          this.calculatePricing();
        }
      });

    // Fallback to current params
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

    // Get rooms and guests from query params if available
    this.route.queryParams.subscribe((params) => {
      if (params['rooms']) {
        this.rooms = +params['rooms'];
      }
      if (params['guests']) {
        this.guests = +params['guests'];
      }
    });
  }

  ngAfterViewInit(): void {
    // Canvas setup is handled via the setter when dialog opens
    // No need to setup here as the element doesn't exist yet
  }

  private setupCanvas(): void {
    if (!this._confettiCanvas) return;

    const canvas = this._confettiCanvas.nativeElement;
    this.confettiCtx = canvas.getContext('2d')!;
    this.resizeCanvas();

    // Setup resize listener only once
    if (!this.resizeListener) {
      this.resizeListener = () => this.resizeCanvas();
      // window.addEventListener('resize', this.resizeListener);
    }
  }

  loadHotelDetails(): void {
    this.isLoading = true;

    setTimeout(() => {
      this.datasService.getHotelById(this.hotelId!).subscribe((hotel) => {
        this.hotel = hotel;

        if (this.hotel && this.checkInDate && this.checkOutDate) {
          this.calculatePricing();
        }

        this.isLoading = false;
      });
    }, 800);
  }

  calculatePricing(): void {
    if (!this.hotel || !this.checkInDate || !this.checkOutDate) return;

    const diffTime = Math.abs(
      this.checkOutDate.getTime() - this.checkInDate.getTime()
    );
    this.totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (this.totalNights === 0) {
      this.totalNights = 1;
    }

    this.basePrice = this.hotel.price * this.totalNights * this.rooms;
    this.serviceCharge = this.basePrice * 0.05;
    this.taxes = this.basePrice * 0.12;
    this.totalPrice = this.basePrice + this.serviceCharge + this.taxes;
    this.finalAmount = this.totalPrice;
  }

  validateForm(): boolean {
    if (!this.guestDetails.firstName.trim()) {
      alert('Please enter first name');
      return false;
    }
    if (!this.guestDetails.lastName.trim()) {
      alert('Please enter last name');
      return false;
    }
    if (
      !this.guestDetails.email.trim() ||
      !this.isValidEmail(this.guestDetails.email)
    ) {
      alert('Please enter a valid email address');
      return false;
    }
    if (
      !this.guestDetails.phone.trim() ||
      this.guestDetails.phone.length < 10
    ) {
      alert('Please enter a valid phone number');
      return false;
    }
    if (!this.selectedPaymentMethod) {
      alert('Please select a payment method');
      return false;
    }
    if (!this.acceptTerms) {
      alert('Please accept the terms and conditions');
      return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  proceedToPayment(): void {
    if (!this.validateForm()) {
      return;
    }

    // Generate booking reference
    this.bookingReference = 'BK' + Date.now().toString().slice(-8);

    // Simulate payment processing
    console.log('Processing booking:', {
      bookingReference: this.bookingReference,
      hotel: this.hotel?.name,
      guestDetails: this.guestDetails,
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
      rooms: this.rooms,
      guests: this.guests,
      paymentMethod: this.selectedPaymentMethod,
      amount: this.finalAmount,
    });

    // Show success dialog first
    this.showSuccessDialog = true;

    // Wait for dialog and canvas to render before starting confetti
    setTimeout(() => {
      if (this._confettiCanvas && this.confettiCtx) {
        this.startConfetti();
      }
    }, 200);
  }

  // Confetti Animation Methods
  resizeCanvas(): void {
    if (!this._confettiCanvas) return;
    const canvas = this._confettiCanvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  startConfetti(): void {
    if (!this.confettiCtx || !this._confettiCanvas) {
      console.warn('Canvas not ready for confetti');
      return;
    }

    const canvas = this._confettiCanvas.nativeElement;
    const colors = [
      '#667eea',
      '#764ba2',
      '#f093fb',
      '#4facfe',
      '#00f2fe',
      '#43e97b',
      '#fa709a',
    ];

    // Create confetti particles
    this.confettiParticles = [];
    for (let i = 0; i < 150; i++) {
      this.confettiParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * 150 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
      });
    }

    this.animateConfetti();

    // Stop after 5 seconds
    setTimeout(() => this.stopConfetti(), 5000);
  }

  animateConfetti(): void {
    if (!this.confettiCtx || !this._confettiCanvas) return;

    const canvas = this._confettiCanvas.nativeElement;
    const ctx = this.confettiCtx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.confettiParticles.forEach((p, i) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.tilt = Math.sin(p.tiltAngle) * 15;

      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();

      // Reset particle if it goes off screen
      if (p.y > canvas.height) {
        this.confettiParticles[i] = {
          ...p,
          x: Math.random() * canvas.width,
          y: -20,
        };
      }
    });

    this.confettiAnimationFrame = requestAnimationFrame(() =>
      this.animateConfetti()
    );
  }

  stopConfetti(): void {
    if (this.confettiAnimationFrame) {
      cancelAnimationFrame(this.confettiAnimationFrame);
      this.confettiAnimationFrame = undefined;
    }

    // Clear canvas
    if (this.confettiCtx && this._confettiCanvas) {
      this.confettiCtx.clearRect(
        0,
        0,
        this._confettiCanvas.nativeElement.width,
        this._confettiCanvas.nativeElement.height
      );
    }
  }

  goToHotelDetails(): void {
    this.router.navigate(['/hotel-details', this.hotelId]);
  }

  goToHome(): void {
    this.stopConfetti();
    this.router.navigate(['/hotel-search']);
  }

  viewBookingDetails(): void {
    // Navigate to booking details page (to be implemented)
    console.log('View booking details:', this.bookingReference);
    this.stopConfetti();
    this.showSuccessDialog = false;
    this.router.navigate(['/hotel-search']);
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  ngOnDestroy(): void {
    this.stopConfetti();

    // Clean up resize listener
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
