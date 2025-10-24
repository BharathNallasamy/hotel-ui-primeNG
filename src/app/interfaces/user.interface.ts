export interface Hotel {
  id: number;
  slug: string;
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

export interface BookingDetails {
  selectedCity?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface CityOption {
  name: string;
  code: string;
  country?: string;
  cityId?: number;
}

export interface HotelSearchParams {
  city?: CityOption;
  checkIn?: Date;
  checkOut?: Date;
}

export interface Review {
  id: number;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  avatar?: string;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export interface Confetti {
  x: number;
  y: number;
  r: number;
  d: number;
  color: string;
  tilt: number;
  tiltAngleIncremental: number;
  tiltAngle: number;
}