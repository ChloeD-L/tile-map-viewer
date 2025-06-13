# Propeller Tile Map Viewer

A React frontend application for the Propeller coding challenge - displays map tiles in a 2D view without using existing mapping frameworks.

## Quick Start

```bash
# Copy the example environment file
cp .env.example .env

# Install dependencies
yarn install

# Start development server
yarn dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API token for accessing the tile server
VITE_API_TOKEN=your_token_here
```

You can copy `.env.example` as a template:

```bash
cp .env.example .env
```

## Challenge Overview

Build a tile-based mapping application that consumes tiles from Propeller's server:

- **API:** `https://challenge-tiler.services.propelleraero.com/tiles/:z/:x/:y?token=<id>`
- **Zoom levels:** 0-3 (0 = most zoomed out)
- **Format:** z/x/y where z=zoom, x=column, y=row

## Requirements

### TODO

- [x] **Zoom controls** - +/- buttons with zoom levels 0-3
- [x] **Scrollable viewport** - when content doesn't fit in viewport
- [x] **Error handling** - Proper HTTP status code handling (403/404/500+/network errors)
- [x] **Comprehensive testing** - 33 test cases covering all functionality

### Error Handling

- **403 Forbidden** - Red error tiles with token suggestions
- **404 Not Found** - Gray error tiles for missing tiles
- **500+ Server Errors** - Orange error tiles for server issues
- **Network Errors** - Yellow error tiles for connectivity issues
- **Visual feedback** - Color-coded error states with helpful messages

### Testing

- **API tests** (10) - HTTP handling, error types, blob management
- **Component tests** (7) - Tile rendering, lifecycle, error states
- **Integration tests** (7) - TileMap functionality, zoom controls
- **UI tests** (9) - ZoomControls interactions and boundary conditions

### Extra Features (if time permits)

- [ ] Allow panning of the tiles rather than scrolling
- [ ] If panning implemented, switch to using scroll to zoom
- [ ] Gradual zooming between tiles
- [ ] Smooth transitions between tiles
- [ ] Enhanced UI/UX with modern styling
- [ ] Performance optimizations (tile caching, lazy loading)
- [ ] Responsive design for mobile devices

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **Testing:** Vitest + React Testing Library
- **HTTP:** Fetch API with blob URL management

## Development

```bash
yarn dev          # Start dev server
yarn build        # Build for production
yarn lint         # Run ESLint
yarn test         # Run all tests (33 tests)
yarn test:watch   # Run tests in watch mode
```
