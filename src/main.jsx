import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Heart,
  Hotel,
  IndianRupee,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  X
} from 'lucide-react';
import "./styles.css";
import { createPriceAlert, searchHotels } from "./services/hotelApi";
import { Recommendations } from './components/Recommendations';
import { RankedHotels } from './components/RankedHotels';
import { trackHotelView } from "./services/eventTracking";
import { AuthProvider, useAuth } from "./context/AuthContext";

const queryClient = new QueryClient();

const hotels = [
  {
    id: 1,
    name: 'Taj Holiday Village Resort & Spa',
    area: 'Sinquerim, North Goa',
    distance: '1.2 km from beach',
    rating: 4.6,
    reviews: 2341,
    image:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80',
    amenities: ['Breakfast', 'Free WiFi', 'Pool'],
    perks: ['Free cancellation', 'Pay at hotel'],
    prices: [
      { provider: 'Booking.com', price: 12499, deal: 'Cheapest' },
      { provider: 'Agoda', price: 13220, deal: 'Member rate' },
      { provider: 'Expedia', price: 13790, deal: 'Bundle saver' }
    ]
  },
  {
    id: 2,
    name: 'The Leela Palace Bengaluru',
    area: 'Old Airport Road, Bengaluru',
    distance: '6.4 km from MG Road',
    rating: 4.8,
    reviews: 3128,
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80',
    amenities: ['Spa', 'Airport transfer', 'Pool'],
    perks: ['Breakfast included', 'No prepayment'],
    prices: [
      { provider: 'MakeMyTrip', price: 16950, deal: 'Best value' },
      { provider: 'Booking.com', price: 17640, deal: 'Flexible' },
      { provider: 'Expedia', price: 18190, deal: 'Reward points' }
    ]
  },
  {
    id: 3,
    name: 'Trident Nariman Point',
    area: 'Marine Drive, Mumbai',
    distance: '0.4 km from promenade',
    rating: 4.5,
    reviews: 1984,
    image:
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80',
    amenities: ['Sea view', 'Free WiFi', 'Gym'],
    perks: ['Late checkout', 'Instant confirmation'],
    prices: [
      { provider: 'Agoda', price: 11380, deal: 'Cheapest' },
      { provider: 'Booking.com', price: 11940, deal: 'Refundable' },
      { provider: 'Cleartrip', price: 12620, deal: 'Coupon eligible' }
    ]
  }
  ,
  {
    id: 4,
    name: 'Rambagh Palace Jaipur',
    area: 'Bhawani Singh Road, Jaipur',
    distance: '2.1 km from City Palace',
    rating: 4.7,
    reviews: 1752,
    image:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80',
    amenities: ['Breakfast', 'Spa', 'Pool'],
    perks: ['Free cancellation', 'Heritage stay'],
    prices: [
      { provider: 'MakeMyTrip', price: 14350, deal: 'Best value' },
      { provider: 'Booking.com', price: 15120, deal: 'Flexible' },
      { provider: 'Agoda', price: 15840, deal: 'Member rate' }
    ]
  },
  {
    id: 5,
    name: 'The Fern Goa',
    area: 'Candolim, North Goa',
    distance: '0.8 km from beach',
    rating: 4.4,
    reviews: 1562,
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
    amenities: ['Pool', 'Free WiFi', 'Restaurant'],
    perks: ['Free breakfast', 'Instant confirmation'],
    prices: [
      { provider: 'Booking.com', price: 9850, deal: 'Cheapest' },
      { provider: 'Agoda', price: 10320, deal: 'Member rate' },
      { provider: 'Expedia', price: 10890, deal: 'Flexible' }
    ]
  },
  {
    id: 6,
    name: 'Goa Marriott Resort & Spa',
    area: 'Panjim, Goa',
    distance: '2.5 km from market',
    rating: 4.5,
    reviews: 1893,
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    amenities: ['Spa', 'Pool', 'Free WiFi'],
    perks: ['Breakfast included', 'No cancellation fee'],
    prices: [
      { provider: 'MakeMyTrip', price: 11200, deal: 'Best value' },
      { provider: 'Booking.com', price: 11880, deal: 'Flexible' },
      { provider: 'Agoda', price: 12350, deal: 'Member rate' }
    ]
  },
  {
    id: 7,
    name: 'ITC Grand Chola Chennai',
    area: 'Ashok Nagar, Chennai',
    distance: '3.2 km from station',
    rating: 4.7,
    reviews: 2567,
    image:
      'https://images.unsplash.com/photo-1578646970236-a47006fbf641?auto=format&fit=crop&w=900&q=80',
    amenities: ['Spa', 'Pool', 'Fine Dining'],
    perks: ['Late checkout', 'Complimentary WiFi'],
    prices: [
      { provider: 'Booking.com', price: 13750, deal: 'Cheapest' },
      { provider: 'Agoda', price: 14520, deal: 'Member rate' },
      { provider: 'MakeMyTrip', price: 15200, deal: 'Reward' }
    ]
  },
  {
    id: 8,
    name: 'Hyatt Centric Mumbai',
    area: 'Lower Parel, Mumbai',
    distance: '0.6 km from street',
    rating: 4.3,
    reviews: 1421,
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
    amenities: ['Gym', 'Restaurant', 'Lounge'],
    perks: ['Free WiFi', 'Instant confirmation'],
    prices: [
      { provider: 'Agoda', price: 10500, deal: 'Cheapest' },
      { provider: 'Booking.com', price: 11100, deal: 'Refundable' },
      { provider: 'Expedia', price: 11680, deal: 'Coupon' }
    ]
  },
  {
    id: 9,
    name: 'St. Mark Hotel Bengaluru',
    area: 'MG Road, Bengaluru',
    distance: '0.3 km from market',
    rating: 4.2,
    reviews: 1245,
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
    amenities: ['Free WiFi', 'Cafe', 'Parking'],
    perks: ['Budget friendly', 'Quick checkout'],
    prices: [
      { provider: 'MakeMyTrip', price: 8900, deal: 'Cheapest' },
      { provider: 'Agoda', price: 9450, deal: 'Member rate' },
      { provider: 'Booking.com', price: 10020, deal: 'Flexible' }
    ]
  },
  {
    id: 10,
    name: 'Sheraton Grand Bengaluru',
    area: 'Whitefield, Bengaluru',
    distance: '4.2 km from tech park',
    rating: 4.6,
    reviews: 2812,
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    amenities: ['Gym', 'Pool', 'Restaurant'],
    perks: ['Free breakfast', 'Business lounge'],
    prices: [
      { provider: 'Booking.com', price: 15800, deal: 'Cheapest' },
      { provider: 'Agoda', price: 16540, deal: 'Member rate' },
      { provider: 'MakeMyTrip', price: 17100, deal: 'Best value' }
    ]
  },
  {
    id: 11,
    name: 'The Oberoi Bengaluru',
    area: 'Residency Road, Bengaluru',
    distance: '1.5 km from city center',
    rating: 4.8,
    reviews: 3421,
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80',
    amenities: ['Spa', 'Fine Dining', 'Concierge'],
    perks: ['Luxury stay', 'No prepayment'],
    prices: [
      { provider: 'MakeMyTrip', price: 18200, deal: 'Best value' },
      { provider: 'Booking.com', price: 19050, deal: 'Flexible' },
      { provider: 'Expedia', price: 19800, deal: 'Reward points' }
    ]
  },
  {
    id: 12,
    name: 'Holiday Inn Bengaluru',
    area: 'Koramangala, Bengaluru',
    distance: '2.8 km from mall',
    rating: 4.4,
    reviews: 1876,
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
    amenities: ['Free WiFi', 'Restaurant', 'Bar'],
    perks: ['Free cancellation', '24hr reception'],
    prices: [
      { provider: 'Agoda', price: 11900, deal: 'Cheapest' },
      { provider: 'Booking.com', price: 12540, deal: 'Flexible' },
      { provider: 'Expedia', price: 13200, deal: 'Coupon' }
    ]
  },
  {
    id: 13,
    name: 'Taj Connemara Chennai',
    area: 'Binny Road, Chennai',
    distance: '2.5 km from beach',
    rating: 4.7,
    reviews: 2234,
    image:
      'https://images.unsplash.com/photo-1578646970236-a47006fbf641?auto=format&fit=crop&w=900&q=80',
    amenities: ['Heritage', 'Pool', 'Restaurant'],
    perks: ['Historic property', 'Spa services'],
    prices: [
      { provider: 'MakeMyTrip', price: 14200, deal: 'Best value' },
      { provider: 'Booking.com', price: 14980, deal: 'Flexible' },
      { provider: 'Agoda', price: 15680, deal: 'Member rate' }
    ]
  },
  {
    id: 14,
    name: 'Trident Chennai',
    area: 'Anna Salai, Chennai',
    distance: '0.8 km from market',
    rating: 4.5,
    reviews: 1645,
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
    amenities: ['Gym', 'Pool', 'Free WiFi'],
    perks: ['Instant confirmation', 'Late checkout'],
    prices: [
      { provider: 'Booking.com', price: 12300, deal: 'Cheapest' },
      { provider: 'Agoda', price: 12990, deal: 'Member rate' },
      { provider: 'Expedia', price: 13680, deal: 'Flexible' }
    ]
  },
  {
    id: 15,
    name: 'The Leela Palace Chennai',
    area: 'Adyar, Chennai',
    distance: '5.5 km from airport',
    rating: 4.8,
    reviews: 3089,
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    amenities: ['Spa', 'Fine Dining', 'Infinity Pool'],
    perks: ['Luxury amenities', 'No cancellation fee'],
    prices: [
      { provider: 'MakeMyTrip', price: 17600, deal: 'Best value' },
      { provider: 'Booking.com', price: 18480, deal: 'Flexible' },
      { provider: 'Agoda', price: 19200, deal: 'Member rate' }
    ]
  },
  {
    id: 16,
    name: 'Le Méridien Chennai',
    area: 'Mount Road, Chennai',
    distance: '1.2 km from station',
    rating: 4.3,
    reviews: 1523,
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
    amenities: ['Restaurant', 'Cafe', 'Lounge'],
    perks: ['Free WiFi', 'Instant confirmation'],
    prices: [
      { provider: 'Agoda', price: 10700, deal: 'Cheapest' },
      { provider: 'Booking.com', price: 11290, deal: 'Refundable' },
      { provider: 'MakeMyTrip', price: 11950, deal: 'Coupon' }
    ]
  },
  {
    id: 17,
    name: 'Vivanta Jaipur',
    area: 'Kukas, Jaipur',
    distance: '4.0 km from city',
    rating: 4.6,
    reviews: 1934,
    image:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80',
    amenities: ['Pool', 'Spa', 'Free WiFi'],
    perks: ['Free breakfast', 'Instant confirmation'],
    prices: [
      { provider: 'Booking.com', price: 13400, deal: 'Cheapest' },
      { provider: 'Agoda', price: 14120, deal: 'Member rate' },
      { provider: 'MakeMyTrip', price: 14800, deal: 'Best value' }
    ]
  },
  {
    id: 18,
    name: 'Nahargarh Samant Lakhanpal Jaipur',
    area: 'City Palace Area, Jaipur',
    distance: '0.5 km from palace',
    rating: 4.7,
    reviews: 2156,
    image:
      'https://images.unsplash.com/photo-1578646970236-a47006fbf641?auto=format&fit=crop&w=900&q=80',
    amenities: ['Heritage', 'Pool', 'Fine Dining'],
    perks: ['Historic palace hotel', 'Spa'],
    prices: [
      { provider: 'MakeMyTrip', price: 15100, deal: 'Best value' },
      { provider: 'Booking.com', price: 15890, deal: 'Flexible' },
      { provider: 'Agoda', price: 16580, deal: 'Member rate' }
    ]
  },
  {
    id: 19,
    name: 'The Oberoi Jaipur',
    area: 'Amangarh, Jaipur',
    distance: '8.5 km from city',
    rating: 4.8,
    reviews: 2789,
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80',
    amenities: ['Luxury', 'Spa', 'Pool'],
    perks: ['No prepayment', 'Breakfast included'],
    prices: [
      { provider: 'Booking.com', price: 16800, deal: 'Cheapest' },
      { provider: 'Agoda', price: 17640, deal: 'Member rate' },
      { provider: 'MakeMyTrip', price: 18300, deal: 'Best value' }
    ]
  },
  {
    id: 20,
    name: 'Hotel Clarks Amer Jaipur',
    area: 'Amer Road, Jaipur',
    distance: '3.2 km from fort',
    rating: 4.2,
    reviews: 1456,
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
    amenities: ['Restaurant', 'Pool', 'Free WiFi'],
    perks: ['Budget friendly', 'Quick checkout'],
    prices: [
      { provider: 'Agoda', price: 9800, deal: 'Cheapest' },
      { provider: 'Booking.com', price: 10340, deal: 'Flexible' },
      { provider: 'MakeMyTrip', price: 11050, deal: 'Coupon' }
    ]
  }
];

const indianDestinations = ['Goa, India', 'Bengaluru, India', 'Mumbai, India', 'Jaipur, India', 'Chennai, India'];
const amenities = ['Free WiFi', 'Breakfast', 'Pool', 'Spa', 'Airport transfer', 'Sea view'];
const tripCities = [
  { city: 'Goa', price: '12.5k', x: 24, y: 66 },
  { city: 'Mumbai', price: '11.4k', x: 44, y: 42 },
  { city: 'Jaipur', price: '8.9k', x: 66, y: 28 },
  { city: 'Bengaluru', price: '17k', x: 78, y: 72 }
];

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function getDestinationFallback(destination) {
  const city = destination.split(',')[0].toLowerCase();
  const matches = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(city) || hotel.area.toLowerCase().includes(city)
  );

  return matches.length ? matches : hotels;
}

function AuthModal({ mode, onClose, onAuthSuccess }) {
  const isSignup = mode === 'signup';
  const { loginUser, signupUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState('');
  const authMutation = useMutation({
    mutationFn: (payload) => (isSignup ? signupUser(payload) : loginUser(payload))
  });

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('');

    try {
      const payload = isSignup
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      await authMutation.mutateAsync(payload);
      onAuthSuccess(isSignup ? 'Account created' : 'Logged in');
      onClose();
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <h2>{isSignup ? 'Create account' : 'Log in'}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                placeholder="Your name"
                required
                value={form.name}
                onChange={updateField}
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={updateField}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Password" required value={form.password} onChange={updateField} />
          </div>
          {status && <p className="muted">{status}</p>}
          <button className="primary-button" type="submit" disabled={authMutation.isPending}>
            {authMutation.isPending ? 'Please wait' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function SearchPanel({ searchParams, setSearchParams, onSearch, isSearching }) {
  function updateField(event) {
    setSearchParams((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  return (
    <form className="search-panel" onSubmit={onSearch}>
      <div className="search-grid">
        <div className="field">
          <label htmlFor="destination">Destination</label>
          <select
            id="destination"
            name="destination"
            value={searchParams.destination}
            onChange={updateField}
          >
            {indianDestinations.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="checkin">Check in</label>
          <input
            id="checkin"
            name="checkIn"
            type="date"
            value={searchParams.checkIn}
            onChange={updateField}
          />
        </div>
        <div className="field">
          <label htmlFor="checkout">Check out</label>
          <input
            id="checkout"
            name="checkOut"
            type="date"
            value={searchParams.checkOut}
            onChange={updateField}
          />
        </div>
        <div className="field">
          <label htmlFor="guests">Guests</label>
          <select id="guests" name="guests" value={searchParams.guests} onChange={updateField}>
            <option value="1">1 guest</option>
            <option value="2">2 guests</option>
            <option value="4">4 guests</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="stayType">Stay type</label>
          <select id="stayType" name="stayType" value={searchParams.stayType} onChange={updateField}>
            <option>Hotel</option>
            <option>Resort</option>
            <option>Apartment</option>
          </select>
        </div>
        <button className="primary-button" type="submit" disabled={isSearching}>
          <Search size={18} />
          {isSearching ? 'Searching' : 'Search'}
        </button>
      </div>
    </form>
  );
}

function Filters({ maxPrice, setMaxPrice }) {
  return (
    <aside className="sidebar">
      <div className="section-title">
        <h2>Filters</h2>
        <SlidersHorizontal size={18} />
      </div>
      <div className="filter-group">
        <strong>Nightly budget</strong>
        <input
          className="range"
          type="range"
          min="8000"
          max="22000"
          step="500"
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
        />
        <span>{formatPrice(maxPrice)} or less</span>
      </div>
      <div className="filter-group">
        <strong>Rating</strong>
        <label className="check-row">
          <input type="checkbox" defaultChecked /> 4 stars and above
        </label>
        <label className="check-row">
          <input type="checkbox" /> Guest favorite
        </label>
      </div>
      <div className="filter-group">
        <strong>Amenities</strong>
        {amenities.map((item, index) => (
          <label className="check-row" key={item}>
            <input type="checkbox" defaultChecked={index < 3} /> {item}
          </label>
        ))}
      </div>
    </aside>
  );
}

function HotelCard({ hotel, index = 0 }) {
  const { isAuthenticated } = useAuth();

  const fallbackImages = [
  '/hotel-images/hotel1.jpeg',
  '/hotel-images/hotel2.jpg',
  '/hotel-images/hotel3.jpg',
  '/hotel-images/hotel4.jpg',
  '/hotel-images/hotel5.jpg',
  '/hotel-images/default.jpg'
];
  const imageSrc =
    hotel.image && !hotel.image.includes('default.jpg')
      ? hotel.image
      : fallbackImages[index % fallbackImages.length];

  const bestRate =
    hotel.prices && hotel.prices.length
      ? hotel.prices.reduce((best, rate) => (rate.price < best.price ? rate : best))
      : { provider: 'ML Dataset', price: hotel.price || 0, deal: 'Current price' };

  const handleCardClick = () => {
    if (isAuthenticated) {
      trackHotelView(hotel.id);
    }
  };

  const handleCompareClick = (event) => {
    event.stopPropagation();

    if (isAuthenticated) {
      trackHotelView(hotel.id);
    }
  };

  return (
    <article className="hotel-card" onClick={handleCardClick}>
      <div className="hotel-image">
        <img
          src={imageSrc}
          alt={hotel.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImages[index % fallbackImages.length];
          }}
        />
      </div>

      <div className="hotel-info">
        <div>
          <div className="hotel-title">
            <div>
              <h3>{hotel.name}</h3>
              <p className="muted">
                <MapPin size={15} /> {hotel.area}
              </p>
            </div>

            <button
              className="icon-button"
              aria-label={`Save ${hotel.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Heart size={18} />
            </button>
          </div>

          <div className="meta">
            <span>
              <Star size={15} fill="#f59e0b" color="#f59e0b" /> {hotel.rating} ({hotel.reviews}
              reviews)
            </span>
            <span>{hotel.distance}</span>
          </div>

          <div className="chip-list">
            {(hotel.amenities || []).map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="chip-list">
            {(hotel.perks || []).map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rate-box">
          <span className="deal">{bestRate.deal}</span>
          <span className="price">{formatPrice(bestRate.price)}</span>
          <p className="muted">per night, taxes extra</p>

          {(hotel.prices || []).map((rate) => (
            <div className="provider-row" key={rate.provider}>
              <span>{rate.provider}</span>
              <strong>{formatPrice(rate.price)}</strong>
            </div>
          ))}

          <button className="ghost-button" type="button" onClick={handleCompareClick}>
            Compare rates
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
function Offers() {
  return (
    <section className="offers">
      <div className="section-title">
        <h3>Offers</h3>
        <IndianRupee size={18} />
      </div>
      {['BANKSAVE15', 'WEEKEND10', 'PAYLATER'].map((code) => (
        <div className="coupon" key={code}>
          <strong>{code}</strong>
          <span className="muted">Eligible on selected rates</span>
        </div>
      ))}
    </section>
  );
}

function TripMap() {
  return (
    <section className="map-panel">
      <div className="section-title">
        <h3>Saved trip price map</h3>
        <MapPin size={18} />
      </div>
      <div className="trip-map">
        <div className="route-line" />
        {tripCities.map((item) => (
          <div className="city-pin" key={item.city} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
            <span>{item.price}</span>
            <span>{item.city}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const { isAuthenticated, logout } = useAuth();
  const [authMode, setAuthMode] = useState(null);
  const [viewMode, setViewMode] = useState('search'); // 'search' | 'recommendations' | 'ranked'
  const [searchParams, setSearchParams] = useState({
    destination: indianDestinations[0],
    checkIn: '2026-06-01',
    checkOut: '2026-06-03',
    guests: '2',
    stayType: 'Hotel'
  });
  const [maxPrice, setMaxPrice] = useState(22000);
  const [hotelResults, setHotelResults] = useState(getDestinationFallback(indianDestinations[0]));
  const [status, setStatus] = useState('');
  const searchMutation = useMutation({
    mutationFn: searchHotels
  });
  const alertMutation = useMutation({
    mutationFn: createPriceAlert
  });

const visibleHotels = useMemo(() => {
  const minPrice = 8000;

  return hotelResults.filter((hotel) => {
    const prices = hotel.prices || [];

    const validPrices = prices
      .map((rate) => Number(rate.price || 0))
      .filter((price) => price > 0);

    const bestPrice =
      validPrices.length > 0
        ? Math.min(...validPrices)
        : Number(hotel.price || hotel.minPrice || hotel.lowestPrice || 0);

    return bestPrice >= minPrice && bestPrice <= maxPrice;
  });
}, [hotelResults, maxPrice]);
  async function handleSearch(event) {
    event.preventDefault();
    setStatus('');

    try {
      const results = await searchMutation.mutateAsync({
        ...searchParams,
        maxPrice,
        guests: Number(searchParams.guests)
      });
      setHotelResults(
  results.length
    ? results
    : getDestinationFallback(searchParams.destination)
);

setStatus(
  results.length
    ? 'Showing live backend results'
    : 'Showing local destination results'
);
    } catch (error) {
      setHotelResults(getDestinationFallback(searchParams.destination));
      setStatus(`Backend unavailable: ${error.message}`);
    }
  }

  async function handleCreateAlert() {
    const hotel = visibleHotels[0];
    if (!hotel) {
      setStatus('No hotel available for an alert');
      return;
    }

    try {
      await alertMutation.mutateAsync({
        hotelId: hotel.id,
        targetPrice: maxPrice
      });
      setStatus(`Alert created for ${hotel.name}`);
    } catch (error) {
      setStatus(`Alert failed: ${error.message}`);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Hotel size={22} />
          </span>
          <span>HotelCompare</span>
        </div>
        <div className="nav-actions">
          {isAuthenticated ? (
            <button className="text-button" type="button" onClick={logout}>
              Log out
            </button>
          ) : (
            <>
              <button className="text-button" type="button" onClick={() => setAuthMode('login')}>
                Log in
              </button>
              <button className="primary-button" type="button" onClick={() => setAuthMode('signup')}>
                Sign up
              </button>
            </>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>Compare hotel prices before you book.</h1>
          <p>
            Search Indian destinations, scan provider rates, track alerts, and shortlist stays from
            a single dashboard built for quick booking decisions.
          </p>
        </div>
        <div className="hero-media" aria-label="Luxury hotel pool and resort view" />
      </section>

      <SearchPanel
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onSearch={handleSearch}
        isSearching={searchMutation.isPending}
      />
        <main className={viewMode === 'ranked' ? 'content-full' : 'content'}>
        {/* View Mode Tabs */}
        <div className="view-tabs flex gap-2 mb-6 border-b border-gray-200 px-4">
          <button
            onClick={() => setViewMode('search')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              viewMode === 'search'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setViewMode('ranked')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              viewMode === 'ranked'
                ? 'text-green-600 border-green-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Top-Rated
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setViewMode('recommendations')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                viewMode === 'recommendations'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              For You
            </button>
          )}
        </div>

        {/* Search View */}
        {viewMode === 'search' && (
          <>
            <Filters maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
            <section className="results">
              <div className="results-header">
                <div>
                  <h2>{visibleHotels.length} stays in {searchParams.destination}</h2>
                  <p className="muted">
                    <CalendarDays size={15} /> {searchParams.checkIn} - {searchParams.checkOut}
                    {'  '}
                    <Users size={15} /> {searchParams.guests} guests, 1 room
                  </p>
                  {status && <p className="muted">{status}</p>}
                </div>
                <button className="ghost-button" type="button" onClick={handleCreateAlert}>
                  <Bell size={17} />
                  Create alert
                </button>
              </div>
              {visibleHotels.map((hotel, index) => (
                <HotelCard hotel={hotel} index={index} key={hotel.id} />
                ))}
              <div className="secondary-grid">
                <Offers />
                <TripMap />
              </div>
            </section>
          </>
        )}

        {/* Top-Rated Hotels View */}
        {viewMode === 'ranked' && (
          <section className="results">
            <div className="px-4">
              <RankedHotels />
            </div>
          </section>
        )}

        {/* Personalized Recommendations View */}
        {viewMode === 'recommendations' && isAuthenticated && (
          <section className="results">
            <div className="px-4">
              <Recommendations />
            </div>
          </section>
        )}
      </main>

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onAuthSuccess={setStatus}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

