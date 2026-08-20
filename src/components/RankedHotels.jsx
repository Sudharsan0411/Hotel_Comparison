import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Star, MapPin, IndianRupee, Loader, AlertCircle } from 'lucide-react';
import { getRankedHotels, trackUserEvent, addFavorite, removeFavorite } from '../services/hotelApi';
import { useAuth } from '../context/AuthContext';

export function RankedHotels() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = React.useState(new Set());

  const { data: hotels = [], isLoading, error } = useQuery({
    queryKey: ['ranked-hotels'],
    queryFn: getRankedHotels,
    staleTime: 10 * 60 * 1000
  });

  console.log("Hotels Data:", hotels);

  const getBestPrice = (hotel) => {
    if (!hotel.prices || !hotel.prices.length) return 0;
    return Math.min(...hotel.prices.map((p) => Number(p.price || 0)));
  };

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

    alert(
      `Hotel: ${hotel.name}\nLocation: ${hotel.area}\nRating: ${hotel.rating}\nPrice: ₹${getBestPrice(hotel).toLocaleString()}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-gray-600">Loading top-rated hotels...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <AlertCircle className="text-red-600" size={20} />
        <p className="text-red-800">Error loading ranked hotels. Please try again.</p>
      </div>
    );
  }

  if (!hotels.length) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600">No hotels available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-red-600">Top-Rated Hotels</h2>
        <p className="text-sm text-gray-600 mt-1">Best hotels ranked by price and rating</p>
      </div>

      <div className="space-y-4">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => handleHotelClick(hotel.id)}
            className="ranked-hotel-card"
          >
            <div className="ranked-hotel-image">
              <img
                src={hotel.image || "/hotel-images/default.jpg"}
                alt={hotel.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/hotel-images/default.jpg";
                }}
              />

              <button
                type="button"
                onClick={(e) => handleFavoriteToggle(e, hotel.id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Heart
                  size={20}
                  className={favorites.has(hotel.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
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

            <div className="ranked-hotel-content">
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
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
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
                {hotel.prices?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <IndianRupee size={16} className="text-green-600" />
                    <span className="text-sm text-gray-600">From</span>
                    <span className="font-bold text-lg text-green-600">
                      ₹{getBestPrice(hotel).toLocaleString()}
                    </span>
                  </div>
                )}

                {hotel.perks?.length > 0 && (
                  <p className="text-xs text-green-700 font-medium">
                    {hotel.perks[0]}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => handleViewDetails(e, hotel)}
                className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600 mt-4">
        <p>Showing {hotels.length} top-rated hotels</p>
      </div>
    </div>
  );
}