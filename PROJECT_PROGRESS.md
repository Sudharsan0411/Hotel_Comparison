# HotelCompare UI Progress

## Current Status

The frontend UI is implemented as a React.js + Tailwind CSS project using Vite.
The project also includes backend/API handoff documentation and a frontend service adapter.

## Completed Features

- Login and signup modal
- Hotel search form
- Searchable India destination selector
- Calendar date pickers for check-in and check-out
- Single left-side calendar icon opens each date picker
- Automatic check-out validation after check-in
- Hotel dashboard/results UI
- Hotel result cards with image, rating, amenities, perks, wishlist, and provider prices
- Favourites navbar item and saved hotels section connected to heart buttons
- Price comparison drawer/table
- Filters and sorting UI
- Clear all filter reset
- Price range from INR 0 to INR 1,00,000
- Coupon section with View offers toggle and coupon input
- Search refresh/loading effect
- Filters reset after Search Hotels is clicked
- Price range resets to INR 0 after Search Hotels refresh
- Responsive layout for desktop and mobile
- API integration contract in `ARCHITECTURE.md`
- Environment template in `.env.example`
- Backend-ready service functions in `src/services/hotelApi.js`

## Important Commands

```powershell
npm.cmd install
npm.cmd run dev -- --port 5173
npm.cmd run build
```

## Local URL

```text
http://127.0.0.1:5173/
```

## Backend/API Handoff Notes

- Use `src/services/hotelApi.js` for backend calls.
- Replace the mock hotel data in `src/main.jsx` with `searchHotels()` results.
- Replace the static `indianDestinations` list with a real location API or database.
- Connect login/signup modal to `login()` and `signup()`.
- Connect price alert form to `createPriceAlert()`.
- Keep real hotel-provider API keys on the backend, never in React.
