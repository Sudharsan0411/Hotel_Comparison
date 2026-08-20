import { trackUserEvent } from './hotelApi';

/**
 * Track a hotel view event
 */
export async function trackHotelView(hotelId) {
  try {
    await trackUserEvent(hotelId, 'view');
  } catch (err) {
    console.error('Failed to track hotel view:', err);
  }
}

/**
 * Track a hotel search event
 */
export async function trackHotelSearch(hotelId) {
  try {
    await trackUserEvent(hotelId, 'search');
  } catch (err) {
    console.error('Failed to track hotel search:', err);
  }
}

/**
 * Track a hotel favorite event
 */
export async function trackHotelFavorite(hotelId) {
  try {
    await trackUserEvent(hotelId, 'favorite');
  } catch (err) {
    console.error('Failed to track hotel favorite:', err);
  }
}

/**
 * Track a hotel booking event
 */
export async function trackHotelBooking(hotelId) {
  try {
    await trackUserEvent(hotelId, 'booking');
  } catch (err) {
    console.error('Failed to track hotel booking:', err);
  }
}

/**
 * Track a hotel rating event
 */
export async function trackHotelRating(hotelId, rating) {
  try {
    await trackUserEvent(hotelId, 'rating');
  } catch (err) {
    console.error('Failed to track hotel rating:', err);
  }
}
