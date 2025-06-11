import React from "react";
import type { TileCoordinate } from "../../../types";

interface ViewportInfoProps {
  viewportSize: { width: number; height: number };
  containerSize: { width: number; height: number };
  visibleTiles: TileCoordinate[];
}

export const ViewportInfo: React.FC<ViewportInfoProps> = ({ viewportSize, containerSize, visibleTiles }) => {
  return (
    <div className="space-y-1">
      <div className="text-gray-600">
        <strong>Viewport size:</strong> {Math.round(viewportSize.width)} × {Math.round(viewportSize.height)}
      </div>
      <div className="text-gray-600">
        <strong>Container size:</strong> {containerSize.width} × {containerSize.height}
      </div>
      <div className="text-gray-600">
        <strong>Visible tiles:</strong> {visibleTiles.length}
      </div>
    </div>
  );
};
