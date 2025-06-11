export interface TileCoordinate {
  x: number;
  y: number;
  z: number;
}

export interface TileData {
  coordinate: TileCoordinate;
  url: string;
  isLoading: boolean;
  hasError: boolean;
}

export interface MapViewport {
  zoom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}
