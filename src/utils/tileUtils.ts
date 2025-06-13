import type { TileCoordinate } from "../types";

const TILE_SIZE = 256; // Size of each tile in pixels

export const getTileUrl = (x: number, y: number, z: number, token: string): string => {
  const baseUrl = import.meta.env.VITE_TILE_SERVER_URL || "https://challenge-tiler.services.propelleraero.com";
  const url = `${baseUrl}/tiles/${z}/${x}/${y}?token=${token}`;

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

  // 3. Calculate tile range covered by viewport
  const startTileX = Math.max(0, Math.floor(viewportLeft / TILE_SIZE));
  const startTileY = Math.max(0, Math.floor(viewportTop / TILE_SIZE));
  const endTileX = Math.min(tilesCount - 1, Math.ceil(viewportRight / TILE_SIZE));
  const endTileY = Math.min(tilesCount - 1, Math.ceil(viewportBottom / TILE_SIZE));

  // Debug log for zoom level 3
  if (zoom === 3) {
    console.log("getTilesForViewport calculation:", {
      zoom,
      centerX,
      centerY,
      viewportWidth,
      viewportHeight,
      viewportLeft,
      viewportTop,
      viewportRight,
      viewportBottom,
      startTileX,
      startTileY,
      endTileX,
      endTileY,
      tilesCount,
    });
  }

  // 4. Filter out tiles that are completely outside the viewport
  const tiles: TileCoordinate[] = [];
  for (let tileY = startTileY; tileY <= endTileY; tileY++) {
    for (let tileX = startTileX; tileX <= endTileX; tileX++) {
      // Calculate tile boundaries
      const tileLeft = tileX * TILE_SIZE;
      const tileTop = tileY * TILE_SIZE;
      const tileRight = tileLeft + TILE_SIZE;
      const tileBottom = tileTop + TILE_SIZE;

      // Check if tile intersects with viewport
      if (
        tileRight > viewportLeft &&
        tileLeft < viewportRight &&
        tileBottom > viewportTop &&
        tileTop < viewportBottom
      ) {
        tiles.push({ x: tileX, y: tileY, z: zoom });
      }
    }
  }

  return tiles;
};

/**
 * Calculate the pixel position of a tile relative to the viewport center
 *
 * How it works:
 * 1. tileX * TILE_SIZE = tile's X position in world coordinates
 * 2. - centerX = offset relative to world center
 * 3. + viewportWidth/2 = convert to viewport coordinates (viewport center = 0,0)
 */
export const getTilePosition = (
  tileX: number, // Tile X coordinate
  tileY: number, // Tile Y coordinate
  centerX: number, // Map center point X coordinate in pixels
  centerY: number, // Map center point Y coordinate in pixels
  viewportWidth: number, // Viewport width
  viewportHeight: number // Viewport height
) => {
  // Calculate tile's world position
  const tileWorldX = tileX * TILE_SIZE;
  const tileWorldY = tileY * TILE_SIZE;

  // Calculate position relative to container center
  const position = {
    x: tileWorldX - centerX + viewportWidth / 2,
    y: tileWorldY - centerY + viewportHeight / 2,
  };

  // Debug log for zoom level 3
  if (Math.log2(centerX / TILE_SIZE) === 3) {
    console.log("getTilePosition calculation:", {
      tileX,
      tileY,
      centerX,
      centerY,
      viewportWidth,
      viewportHeight,
      tileWorldX,
      tileWorldY,
      position,
    });
  }

  return position;
};
