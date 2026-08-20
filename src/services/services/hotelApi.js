import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'hotel_compare_token';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3002';

const endpoints = {
  hotels: import.meta.env.VITE_HOTELS_ENDPOINT || '/hotels',
  search: import.meta.env.VITE_HOTEL_SEARCH_ENDPOINT || '/search',
  filter: import.meta.env.VITE_HOTEL_FILTER_ENDPOINT || '/filter',
  alert: import.meta.env.VITE_PRICE_ALERT_ENDPOINT || '/alerts',
  login: import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || '/login',
  signup: import.meta.env.VITE_AUTH_SIGNUP_ENDPOINT || '/signup',
  bookings: import.meta.env.VITE_BOOKINGS_ENDPOINT || '/bookings',
  favorites: import.meta.env.VITE_FAVORITES_ENDPOINT || '/favorites',
  recommendations: '/recommendations',
  rankedHotels: '/ranked-hotels',
  trackEvent: '/track-event',
  mlHealth: '/ml-health'
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Backend request failed';

    return Promise.reject(new Error(message));
  }
);

function normalizeHotel(hotel) {
  const price = Number(hotel.price || hotel.minPrice || hotel.lowestPrice || 0);
  const rating = Number(hotel.rating || 0);
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : ['Hotel stay'];
  const score = hotel.hotel_score || hotel.final_score || null;

  return {
    id: hotel.id,
    name: hotel.name,
    area: hotel.area || hotel.location || hotel.city || 'Available hotel',
    distance: hotel.distance || 'Distance unavailable',
    rating,
    mlScore: score ? Number(score).toFixed(2) : null,
    reviews: hotel.reviews || hotel.review_count || 0,
    image:
      hotel.image ||
      hotel.image_url ||
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80',
    amenities,
    perks: hotel.perks || ['Live backend price'],
    prices: hotel.prices || [
      {
        provider: hotel.provider || 'Hotel backend',
        price,
        deal: 'Current price'
      }
    ]
  };
}

function normalizeHotels(payload) {
  const list = Array.isArray(payload)
    ? payload
    : payload.hotels ||
      payload.results ||
      payload.data ||
      payload.ranked_hotels ||
      payload.recommendations ||
      [];

  return list.map(normalizeHotel);
}

export async function searchHotels(params = {}) {
  const hasSearchTerm = Boolean(params.destination || params.name);
  const path = hasSearchTerm ? endpoints.search : endpoints.hotels;

  const response = await apiClient.get(path, {
    params: {
      destination: params.destination,
      name: params.name || params.destination?.split(',')[0],
      maxPrice: params.maxPrice,
      rating: params.rating,
      sort: params.sort,
      page: params.page,
      limit: params.limit
    }
  });

  let hotels = normalizeHotels(response.data);

  if (params.maxPrice || params.rating) {
    hotels = hotels.filter((hotel) => {
      const bestPrice = Math.min(...hotel.prices.map((rate) => Number(rate.price || 0)));
      const matchesPrice = params.maxPrice ? bestPrice <= Number(params.maxPrice) : true;
      const matchesRating = params.rating ? hotel.rating >= Number(params.rating) : true;
      return matchesPrice && matchesRating;
    });
  }

  return hotels;
}

export async function createPriceAlert(payload) {
  const response = await apiClient.post(endpoints.alert, payload);
  return response.data;
}

export async function login(payload) {
  const response = await apiClient.post(endpoints.login, payload);
  const token = response.data.token || response.data.jwt || response.data.accessToken;

  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  return response.data;
}

export async function signup(payload) {
  const response = await apiClient.post(endpoints.signup, payload);
  const token = response.data.token || response.data.jwt || response.data.accessToken;

  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  return response.data;
}

export async function createBooking(payload) {
  const response = await apiClient.post(endpoints.bookings, payload);
  return response.data;
}

export async function getBookings() {
  const response = await apiClient.get(endpoints.bookings);
  return response.data;
}

export async function addFavorite(hotelId) {
  const response = await apiClient.post(endpoints.favorites, { hotelId });
  return response.data;
}

export async function getFavorites() {
  const response = await apiClient.get(endpoints.favorites);
  return normalizeHotels(response.data);
}

export async function removeFavorite(hotelId) {
  const response = await apiClient.delete(`${endpoints.favorites}/${hotelId}`);
  return response.data;
}

// =====================================================
// ML RECOMMENDATION ENDPOINTS
// =====================================================

/**
 * Get personalized hotel recommendations for the logged-in user
 */
export async function getRecommendations(hotelsData = []) {
  try {
    const response = await apiClient.post(endpoints.recommendations, {
      hotels: hotelsData
    });
    return normalizeHotels(response.data.recommendations || response.data);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

/**
 * Get ranked hotels (no personalization needed)
 */
export async function getRankedHotels() {
  try {
    const response = await apiClient.get(endpoints.rankedHotels);
    return normalizeHotels(response.data.ranked_hotels || response.data);
  } catch (error) {
    console.error('Error fetching ranked hotels:', error);
    return [];
  }
}

/**
 * Track a user event for ML training
 * @param {number} hotelId - Hotel ID
 * @param {string} eventType - Type of event: 'view', 'search', 'favorite', 'booking', 'rating'
 */
export async function trackUserEvent(hotelId, eventType) {
  try {
    const response = await apiClient.post(endpoints.trackEvent, {
      hotelId,
      eventType
    });
    return response.data;
  } catch (error) {
    console.error('Error tracking user event:', error);
    return null;
  }
}

/**
 * Check ML service health
 */
export async function checkMLHealth() {
  try {
    const response = await apiClient.get(endpoints.mlHealth);
    return response.data;
  } catch (error) {
    console.error('Error checking ML health:', error);
    return { status: 'error', service: 'ml-engine' };
  }
}
