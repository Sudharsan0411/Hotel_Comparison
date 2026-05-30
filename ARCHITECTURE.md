# HotelCompare Frontend Architecture

## Tech Stack

- React 18 for UI components and state
- Vite for local development and production build
- Tailwind CSS for responsive styling
- Lucide React for icons
- Three.js for the interactive trip price map

## Folder Structure

```text
.
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── PROJECT_PROGRESS.md
└── src
    ├── main.jsx
    ├── styles.css
    └── services
        └── hotelApi.js
```

## Frontend Responsibilities Covered

- Login and signup modal UI
- Hotel search form with destination, dates, guests, rooms, and stay type
- Dashboard/results layout
- Hotel cards with images, ratings, amenities, perks, wishlist, and provider rates
- Price comparison drawer/table
- Filters and sorting UI
- Offer/coupon panel
- Price alert capture UI
- Responsive mobile filter drawer
- Interactive saved-trips price map

## Backend/API Integration Contract

Use `src/services/hotelApi.js` as the frontend integration layer. Backend teammates can connect these functions:

- `searchHotels(params)` for hotel result search
- `createPriceAlert(payload)` for price tracking
- `login(payload)` for user login
- `signup(payload)` for user registration

Expected hotel search parameters:

```js
{
  destination: 'Goa, India',
  checkIn: '2026-06-01',
  checkOut: '2026-06-03',
  guests: 2,
  rooms: 1,
  stayType: 'Hotel',
  filters: {
    maxPrice: 25000,
    rating: 4,
    amenities: ['Free WiFi', 'Pool']
  },
  sort: 'recommended'
}
```

Expected hotel result shape:

```js
{
  id: 1,
  name: 'Taj Holiday Village Resort & Spa',
  area: 'Sinquerim, North Goa',
  distance: '1.2 km from beach',
  rating: 4.6,
  reviews: 2341,
  image: 'https://...',
  amenities: ['Breakfast', 'Free WiFi', 'Pool'],
  perks: ['Free cancellation', 'Pay at hotel'],
  prices: [
    { provider: 'Booking.com', price: 12499, deal: 'Cheapest', deeplink: 'https://...' }
  ]
}
```

## Important Notes

- Do not expose Booking.com, Agoda, Expedia, or other provider API keys in React.
- Store provider keys in the backend `.env` and return normalized hotel data to this frontend.
- Keep mock data in `src/main.jsx` until backend APIs are ready.
- Replace the mock `hotels`, `indianDestinations`, and `tripCities` arrays with API responses later.

## Commands

```powershell
npm.cmd install
npm.cmd run dev -- --port 5173
npm.cmd run build
```
