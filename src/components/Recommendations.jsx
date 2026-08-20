import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Star, MapPin, IndianRupee, Loader, AlertCircle } from 'lucide-react';
import { getRecommendations, trackUserEvent, addFavorite, removeFavorite } from '../services/hotelApi';
import { useAuth } from '../context/AuthContext';

export function Recommendations() {
  const { isAuthenticated } = useAuth();
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [favorites, setFavorites] = useState(new Set());

  const { data: hotels = [], isLoading, error } = useQuery({
    queryKey: ['recommendations', selectedSort, isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) return [];

      return await getRecommendations({
        limit: 10,
        sort: selectedSort
      });
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000
  });

  const getBestPrice = (hotel) => {
    const prices = hotel.prices || [];

    const validPrices = prices
      .map((p) => Number(p.price || 0))
      .filter((price) => price > 0);

    if (validPrices.length > 0) {
      return Math.min(...validPrices);
    }

    return Number(
      hotel.price ||
        hotel.minPrice ||
        hotel.lowestPrice ||
        hotel.price_per_night_INR ||
        hotel.price_per_night_inr ||
        0
    );
  };

  const sortedHotels = useMemo(() => {
    const list = [...hotels];

    if (selectedSort === 'price_low') {
      list.sort((a, b) => getBestPrice(a) - getBestPrice(b));
    }

    if (selectedSort === 'price_high') {
      list.sort((a, b) => getBestPrice(b) - getBestPrice(a));
    }

    if (selectedSort === 'rating') {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    if (selectedSort === 'relevance') {
      list.sort((a, b) => {
        const scoreA = Number(a.finalScore || a.hotelScore || a.mlScore || 0);
        const scoreB = Number(b.finalScore || b.hotelScore || b.mlScore || 0);
        return scoreB - scoreA;
      });
    }

    return list;
  }, [hotels, selectedSort]);

  const handleHotelClick = async (hotelId) => {
    if (isAuthenticated) {
      await trackUserEvent(hotelId, 'view');
    }
  };

  const handleFavoriteToggle = async (e, hotelId) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please sign in to add favorites');
      return;
    }

    try {
      if (favorites.has(hotelId)) {
        await removeFavorite(hotelId);

        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(hotelId);
          return newSet;
        });
      } else {
        await addFavorite(hotelId);

        setFavorites((prev) => new Set(prev).add(hotelId));

        await trackUserEvent(hotelId, 'favorite');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleViewDetails = async (e, hotel) => {
    e.stopPropagation();

    if (isAuthenticated) {
      await trackUserEvent(hotel.id, 'view');
    }

    if (hotel.url) {
      window.open(hotel.url, '_blank', 'noopener,noreferrer');
      return;
    }

    const bestPrice = getBestPrice(hotel);

    alert(
      `Hotel: ${hotel.name}\nLocation: ${hotel.area}\nRating: ${hotel.rating}\nPrice: ${
        bestPrice > 0 ? `₹${bestPrice.toLocaleString()}` : 'Price unavailable'
      }`
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">Sign in to see personalized recommendations</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-gray-600">Loading recommendations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <AlertCircle className="text-red-600" size={20} />
        <p className="text-red-800">Error loading recommendations. Please try again.</p>
      </div>
    );
  }

  if (!sortedHotels.length) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600">
          No recommendations available yet. Explore hotels to get personalized suggestions!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>

        <select
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="price_low">Sort: Price Low to High</option>
          <option value="price_high">Sort: Price High to Low</option>
          <option value="rating">Sort: Rating High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedHotels.map((hotel) => {
          const bestPrice = getBestPrice(hotel);

          return (
            <div
              key={hotel.id}
              onClick={() => handleHotelClick(hotel.id)}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={hotel.image || '/hotel-images/default.jpg'}
                  alt={hotel.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/hotel-images/default.jpg';
                  }}
                />

                <button
                  type="button"
                  onClick={(e) => handleFavoriteToggle(e, hotel.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Heart
                    size={20}
                    className={
                      favorites.has(hotel.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }
                  />
                </button>

                {hotel.rating > 0 && (
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{hotel.rating}</span>
                    <span className="text-xs">({hotel.reviews})</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                  {hotel.name}
                </h3>

                <div className="flex items-start gap-1 text-sm text-gray-600 mb-3">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{hotel.area}</p>
                    <p className="text-xs text-gray-500">{hotel.distance}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {(hotel.amenities || []).slice(0, 2).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}

                    {(hotel.amenities || []).length > 2 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{hotel.amenities.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <IndianRupee size={16} className="text-green-600" />
                    <span className="text-sm text-gray-600">From</span>
                    <span className="font-bold text-lg text-green-600">
                      {bestPrice > 0
                        ? `₹${bestPrice.toLocaleString()}`
                        : 'Price unavailable'}
                    </span>
                  </div>

                  {hotel.perks?.length > 0 && (
                    <p className="text-xs text-green-700 font-medium">
                      {hotel.perks[0]}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleViewDetails(e, hotel)}
                  className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-600 mt-4">
        <p>Showing {sortedHotels.length} personalized recommendations</p>
      </div>
    </div>
  );
}