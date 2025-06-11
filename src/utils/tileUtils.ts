import type { TileCoordinate } from "../types";

const TILE_SIZE = 256; // Size of each tile in pixels

export const getTileUrl = (x: number, y: number, z: number, token: string): string => {
  const baseUrl = import.meta.env.VITE_TILE_SERVER_URL || "https://challenge-tiler.services.propelleraero.com";
  const url = `${baseUrl}/tiles/${z}/${x}/${y}?token=${token}`;

  // Optional: Log tile URL for debugging (can be removed in production)
  if (import.meta.env.DEV) {
    console.log(`Tile URL generated: ${z}/${x}/${y}`, url);
  }

  return url;
};

/**
 * Calculate which tiles should be displayed in the current viewport
 *
 * Logic:
 * 1. The viewport center should correspond to the map center point (centerX, centerY)
 * 2. Expand from the viewport center to calculate the range of tiles to display
 */
export const getTilesForViewport = (
  zoom: number,
  centerX: number, // Map center point X coordinate in pixels
  centerY: number, // Map center point Y coordinate in pixels
  viewportWidth: number, // Viewport width in pixels
  viewportHeight: number // Viewport height in pixels
): TileCoordinate[] => {
  // 1. Calculate total number of tiles per side at current zoom level
  const tilesCount = Math.pow(2, zoom);

  // 2. Calculate viewport boundaries relative to map center
  const viewportLeft = centerX - viewportWidth / 2;
  const viewportTop = centerY - viewportHeight / 2;
  const viewportRight = centerX + viewportWidth / 2;
  const viewportBottom = centerY + viewportHeight / 2;

  // 3. Calculate tile range covered by viewport (with buffer)
  const startTileX = Math.max(0, Math.floor(viewportLeft / TILE_SIZE) - 2);
  const startTileY = Math.max(0, Math.floor(viewportTop / TILE_SIZE) - 2);
  const endTileX = Math.min(tilesCount - 1, Math.floor(viewportRight / TILE_SIZE));
  const endTileY = Math.min(tilesCount - 1, Math.floor(viewportBottom / TILE_SIZE));

  const tiles: TileCoordinate[] = [];

  // 4. Generate tiles within the calculated range
  for (let tileY = startTileY; tileY <= endTileY; tileY++) {
    for (let tileX = startTileX; tileX <= endTileX; tileX++) {
      tiles.push({ x: tileX, y: tileY, z: zoom });
    }
  }

  return tiles;
};

/**
 * Calculate the pixel position of a tile on screen
 *
 * How it works:
 * 1. tileX * TILE_SIZE = tile's X position in world coordinates
 * 2. - centerX = offset relative to map center point
 * 3. + viewportWidth/2 = convert to screen coordinates (screen center corresponds to map center)
 */
export const getTilePosition = (
  tileX: number, // Tile X coordinate
  tileY: number, // Tile Y coordinate
  centerX: number, // Map center point X coordinate in pixels
  centerY: number, // Map center point Y coordinate in pixels
  viewportWidth: number, // Viewport width
  viewportHeight: number // Viewport height
) => {
  return {
    // Tile world position - map center + screen center = tile position on screen
    x: tileX * TILE_SIZE - (centerX - viewportWidth / 2),
    y: tileY * TILE_SIZE - (centerY - viewportHeight / 2),
  };
};
