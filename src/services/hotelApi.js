import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'hotel_compare_token';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3002';

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

// =====================================================
// NORMALIZE HOTEL DATA
// =====================================================

function cleanNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  return Number(String(value).replace(/[₹,]/g, '')) || 0;
}

function getSafeImageUrl(hotel, index = 0) {
  const fallbackImages = [
    '/hotel-images/hotel1.jpg',
    '/hotel-images/hotel2.jpg',
    '/hotel-images/hotel3.jpg',
    '/hotel-images/hotel4.jpg',
    '/hotel-images/hotel5.jpg',
    '/hotel-images/default.jpg'
  ];

  const rawImage = String(
    hotel.image ||
      hotel.photo_url ||
      hotel.image_url ||
      ''
  ).trim();

  if (
    !rawImage ||
    rawImage.toLowerCase() === 'nan' ||
    rawImage.toLowerCase() === 'null' ||
    rawImage.toLowerCase() === 'none'
  ) {
    return fallbackImages[index % fallbackImages.length];
  }

  if (rawImage.startsWith('//')) {
    return `https:${rawImage}`;
  }

  return rawImage;
}

function getPriceFromHotel(hotel) {
  if (Array.isArray(hotel.prices)) {
    const validPrice = hotel.prices
      .map((p) => cleanNumber(p.price))
      .find((price) => price > 0);

    if (validPrice) {
      return validPrice;
    }
  }

  return cleanNumber(
    hotel.price ??
      hotel.price_per_night_INR ??
      hotel.price_per_night_inr ??
      hotel.original_price_INR ??
      hotel.minPrice ??
      hotel.lowestPrice ??
      hotel.amount ??
      hotel.cost ??
      0
  );
}

function normalizeHotel(hotel, index = 0) {
  const price = getPriceFromHotel(hotel);
  const rating = cleanNumber(hotel.rating || hotel.user_rating || 0);

  const amenities = Array.isArray(hotel.amenities)
    ? hotel.amenities
    : ['Hotel stay'];

  const score = hotel.hotel_score || hotel.final_score || null;

  return {
    id: hotel.id || hotel.hotel_id || index,
    name: hotel.name || hotel.hotel_name || 'Hotel name unavailable',

    area: hotel.area || hotel.location || hotel.city || 'Available hotel',
    city: hotel.city || '',
    platform: hotel.platform || hotel.provider || '',
    url: hotel.url || hotel.hotel_url || hotel.link || '',

    distance: hotel.distance || hotel.distance_from_center || 'Distance unavailable',
    rating,
    mlScore: score ? Number(score).toFixed(2) : null,
    reviews: hotel.reviews || hotel.review_count || hotel.total_reviews || 0,

    image: getSafeImageUrl(hotel, index),

    amenities,
    perks: hotel.perks || ['ML recommended hotel'],

    price,
    minPrice: price,
    lowestPrice: price,

    prices: [
      {
        provider: hotel.platform || hotel.provider || 'ML Dataset',
        price,
        deal: 'Current price'
      }
    ],

    hotelScore: hotel.hotel_score,
    recommendationScore: hotel.recommendation_score,
    finalScore: hotel.final_score,
    userType: hotel.user_type
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

  return list.map((hotel, index) => normalizeHotel(hotel, index));
}

function removeDuplicateHotels(hotels) {
  const seen = new Set();

  return hotels.filter((hotel) => {
    const key = String(hotel.id || hotel.name).toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getBestPrice(hotel) {
  const validPrices = (hotel.prices || [])
    .map((rate) => cleanNumber(rate.price))
    .filter((price) => price > 0);

  if (validPrices.length > 0) {
    return Math.min(...validPrices);
  }

  return cleanNumber(hotel.price || hotel.minPrice || hotel.lowestPrice || 0);
}

function sortHotels(hotels, sort = 'relevance') {
  const list = [...hotels];

  if (sort === 'price_low') {
    list.sort((a, b) => getBestPrice(a) - getBestPrice(b));
  }

  if (sort === 'price_high') {
    list.sort((a, b) => getBestPrice(b) - getBestPrice(a));
  }

  if (sort === 'rating') {
    list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  }

  if (sort === 'relevance') {
    list.sort((a, b) => {
      const scoreA = Number(a.finalScore || a.hotelScore || a.mlScore || 0);
      const scoreB = Number(b.finalScore || b.hotelScore || b.mlScore || 0);
      return scoreB - scoreA;
    });
  }

  return list;
}

// =====================================================
// SEARCH HOTELS USING ML RAW DATASET
// =====================================================

export async function searchHotels(params = {}) {
  const response = await apiClient.get(endpoints.rankedHotels, {
    params: {
      limit: 500
    }
  });

  let hotels = removeDuplicateHotels(normalizeHotels(response.data));

  const selectedDestination = (params.destination || params.name || '')
    .toLowerCase()
    .trim();

  const cityOnly = selectedDestination.split(',')[0].trim();

  const cityAliases = {
    bengaluru: ['bengaluru', 'bangalore', 'blr'],
    bangalore: ['bengaluru', 'bangalore', 'blr'],
    mumbai: ['mumbai', 'bombay'],
    chennai: ['chennai', 'madras'],
    goa: ['goa'],
    jaipur: ['jaipur'],
    hyderabad: ['hyderabad']
  };

  const searchWords = cityAliases[cityOnly] || [cityOnly];

  if (cityOnly) {
    hotels = hotels.filter((hotel) => {
      const text = `
        ${hotel.name || ''}
        ${hotel.city || ''}
        ${hotel.location || ''}
        ${hotel.area || ''}
      `.toLowerCase();

      return searchWords.some((word) => text.includes(word));
    });
  }

const minPrice = 8000;
const maxBudget = Number(params.maxPrice || 22000);

hotels = hotels.filter((hotel) => {
  const bestPrice = getBestPrice(hotel);

  return bestPrice >= minPrice && bestPrice <= maxBudget;
}); 

  if (params.rating) {
    hotels = hotels.filter((hotel) => {
      return Number(hotel.rating || 0) >= Number(params.rating);
    });
  }

  hotels = sortHotels(hotels, params.sort || 'relevance');

  return hotels.slice(0, Number(params.limit || 50));
}
// =====================================================
// NORMAL BACKEND FEATURES
// =====================================================

export async function createPriceAlert(payload) {
  const response = await apiClient.post(endpoints.alert, payload);
  return response.data;
}

export async function login(payload) {
  const response = await apiClient.post(endpoints.login, payload);
  const token =
    response.data.token ||
    response.data.jwt ||
    response.data.accessToken;

  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  return response.data;
}

export async function signup(payload) {
  const response = await apiClient.post(endpoints.signup, payload);
  const token =
    response.data.token ||
    response.data.jwt ||
    response.data.accessToken;

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

export async function getRecommendations(payload = {}) {
  try {
    const recResponse = await apiClient.post(endpoints.recommendations, {
      user_id: payload.user_id || 1,
      limit: payload.limit || 10,
      sort: payload.sort || 'relevance',
      user_events: payload.user_events || []
    });

    let recommendedHotels = normalizeHotels(recResponse.data);

    const rankedResponse = await apiClient.get(endpoints.rankedHotels, {
      params: {
        limit: 500
      }
    });

    const rankedHotels = normalizeHotels(rankedResponse.data);
    const rankedMap = new Map();

    rankedHotels.forEach((hotel) => {
      rankedMap.set(String(hotel.id), hotel);
      rankedMap.set(String(hotel.name).toLowerCase(), hotel);
    });

    recommendedHotels = recommendedHotels.map((hotel) => {
      const matchedHotel =
        rankedMap.get(String(hotel.id)) ||
        rankedMap.get(String(hotel.name).toLowerCase());

      if (!matchedHotel) {
        return hotel;
      }

      const hotelPrice = getBestPrice(hotel);
      const matchedPrice = getBestPrice(matchedHotel);

      return {
        ...matchedHotel,
        ...hotel,

        area:
          hotel.area && hotel.area !== 'Available hotel'
            ? hotel.area
            : matchedHotel.area,

        city: hotel.city || matchedHotel.city,
        platform: hotel.platform || matchedHotel.platform,
        url: hotel.url || matchedHotel.url,

        image:
          hotel.image && !hotel.image.includes('default.jpg')
            ? hotel.image
            : matchedHotel.image,

        price: hotelPrice > 0 ? hotelPrice : matchedPrice,
        minPrice: hotelPrice > 0 ? hotelPrice : matchedPrice,
        lowestPrice: hotelPrice > 0 ? hotelPrice : matchedPrice,

        prices:
          hotelPrice > 0
            ? hotel.prices
            : matchedHotel.prices
      };
    });

    recommendedHotels = sortHotels(recommendedHotels, payload.sort || 'relevance');

    return recommendedHotels.slice(0, Number(payload.limit || 10));
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

export async function getRankedHotels() {
  try {
    const response = await apiClient.get(endpoints.rankedHotels, {
      params: {
        limit: 50
      }
    });

    return normalizeHotels(response.data);
  } catch (error) {
    console.error('Error fetching ranked hotels:', error);
    return [];
  }
}

export async function trackUserEvent(hotelId, eventType) {
  try {
    const response = await apiClient.post(endpoints.trackEvent, {
      hotelId,
      eventType,
      hotel_id: hotelId,
      event_type: eventType
    });

    return response.data;
  } catch (error) {
    console.error('Error tracking user event:', error);
    return null;
  }
}

export async function checkMLHealth() {
  try {
    const response = await apiClient.get(endpoints.mlHealth);
    return response.data;
  } catch (error) {
    console.error('Error checking ML health:', error);
    return {
      status: 'error',
      service: 'ml-engine'
    };
  }
}