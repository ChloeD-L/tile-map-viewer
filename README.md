# Propeller Tile Map Viewer

A React frontend application for the Propeller coding challenge - displays map tiles in a 2D view without using existing mapping frameworks.

## Quick Start

```bash
yarn install
yarn dev
```

## Challenge Overview

Build a tile-based mapping application that consumes tiles from Propeller's server:

- **API:** `https://challenge-tiler.services.propelleraero.com/tiles/:z/:x/:y?token=<id>`
- **Zoom levels:** 0-3 (0 = most zoomed out)
- **Format:** z/x/y where z=zoom, x=column, y=row

## Requirements

### TODO

- [x] Allow zooming using +/- buttons
- [x] Allow scrolling when content doesn't fit in viewport
- [ ] Handle edge cases (404/403 responses)
- [ ] Block in some simple tests

### Extra Features (if time permits)

- [ ] Allow panning of the tiles rather than scrolling
- [ ] If panning implemented, switch to using scroll to zoom
- [ ] Gradual zooming between tiles
- [ ] Smooth transitions between tiles
- [ ] Enhanced UI/UX with modern styling
- [ ] Performance optimizations (tile caching, lazy loading)
- [ ] Responsive design for mobile devices
- [ ] Loading states and error handling

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS

## Development

```bash
yarn dev          # Start dev server
yarn build        # Build for production
yarn lint         # Run ESLint
yarn test         # Run tests (when implemented)
```
