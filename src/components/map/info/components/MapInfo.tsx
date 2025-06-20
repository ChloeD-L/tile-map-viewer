import React from "react";
import type { TileCoordinate } from "../../../../types";

interface MapInfoProps {
  zoom: number;
  centerX: number;
  centerY: number;
  viewportSize: { width: number; height: number };
  allTiles: TileCoordinate[];
}

export const MapInfo: React.FC<MapInfoProps> = ({ zoom, centerX, centerY, viewportSize, allTiles }) => {
  const worldSize = Math.pow(2, zoom) * 256;

  return (
    <div className="space-y-1">
      <div className="text-gray-600">
        <strong>Center:</strong> {Math.round(centerX)}, {Math.round(centerY)}
      </div>
      <div className="text-gray-600 hidden md:block">
        <strong>World:</strong> {worldSize} × {worldSize}
      </div>

      {/* only display detailed information on large screens */}
      <div className="hidden lg:block space-y-1">
        <div className="text-gray-600">
          <strong>Viewport:</strong> {Math.round(viewportSize.width)} × {Math.round(viewportSize.height)}
        </div>
        <div className="text-gray-600">
          <strong>Rendering Tiles:</strong> {allTiles.length}
        </div>
      </div>
    </div>
  );
};
