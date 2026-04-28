# AutoDrive 🚗

A modern UK car marketplace single-page application built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

![AutoDrive Screenshot](https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80)

## Live Demo

[View on GitHub Pages](https://skaisavi.github.io/autodrive)

---

## Features

### Browsing & Search
- Real-time search by make, model, and year
- Multi-filter sidebar: make, body type, fuel, condition, price range, mileage, category
- Grid and list view toggle
- Pagination with configurable results per page
- Active filter tags with individual clear buttons
- Skeleton loading cards on first browse
- Empty state with clear-all prompt when no results match

### Car Detail Page
- Full image gallery with thumbnail navigation
- **Lightbox** — click any image to open full-screen with keyboard arrow navigation
- Tabbed specs/features/history sections
- Finance calculator (monthly payment estimate)
- Price history chart
- **Share listing** — uses Web Share API on mobile, clipboard fallback on desktop
- Similar vehicles strip

### Part Exchange (PX)
- Sellers can mark listings as open to part exchange
- Specify accepted makes, accepted fuel types, min engine size, and min year
- Buyers filter browse results by their car's make, fuel type, engine size, and year
- PX requirements shown clearly on each listing's detail page

### Accounts & Listings
- Register / sign in / sign out
- Post, edit, and delete your own listings
- Mark listings as sold
- Account settings: update display name and password

### Saved & Compare
- Save any car to favourites (persisted in localStorage)
- Compare up to 4 cars side-by-side across all specs

### Recently Viewed
- Automatically tracks last 6 viewed cars
- Displayed as a strip on the home page

### Design
- Light / dark mode toggle (persisted)
- Glassmorphism header with backdrop blur
- Spring-bounce card hover animations
- Mobile-first responsive layout with slide-in filter sidebar
- Fully UK localised: £ prices, postcodes, UK cities, HPI Check, Approved Used, MPG combined

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Structure | Semantic HTML5 |
| Styling | CSS custom properties, CSS Grid, Flexbox |
| Logic | Vanilla ES6+ JavaScript |
| Persistence | `localStorage` |
| Fonts | Inter (Google Fonts) |
| Images | Unsplash |

No npm. No build step. Open `index.html` in a browser or serve with any static file server.

---

## Running Locally

```bash
# Python (built-in)
python3 -m http.server 3000

# Node (if installed)
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
autodrive/
├── index.html   # All markup + page templates
├── app.js       # All application logic
├── data.js      # Sample car data (16 listings)
├── styles.css   # All styles + dark mode
└── manifest.json
```

---

## Accessibility

- Semantic landmark roles (`banner`, `navigation`, `main`, `search`)
- ARIA labels on all icon buttons
- Modal dialogs with `role="dialog"` and `aria-modal`
- Focus moved into modals on open; Escape key closes them
- Keyboard-navigable header and dropdown menu

---

## Author

Built by [Skaiste Simutyte](https://github.com/skaisavi) as a portfolio project.
