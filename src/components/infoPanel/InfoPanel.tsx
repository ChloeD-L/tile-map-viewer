import React from "react";
import type { TileCoordinate } from "../../types";
import { MapInfo } from "./components/MapInfo";
import { ViewportInfo } from "./components/ViewportInfo";
import { DebugInfo } from "./components/DebugInfo";

interface InfoPanelProps {
  zoom: number;
  centerX: number;
  centerY: number;
  viewportSize: { width: number; height: number };
  containerSize: { width: number; height: number };
  visibleTiles: TileCoordinate[];
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  zoom,
  centerX,
  centerY,
  viewportSize,
  containerSize,
  visibleTiles,
}) => {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs z-[1000] pointer-events-auto">
      <div className="text-sm font-medium mb-2">Map Viewer - Zoom Level: {zoom}</div>

      <div className="space-y-1 text-xs">
        <MapInfo zoom={zoom} centerX={centerX} centerY={centerY} />
        <ViewportInfo viewportSize={viewportSize} containerSize={containerSize} visibleTiles={visibleTiles} />
        <DebugInfo zoom={zoom} centerX={centerX} centerY={centerY} viewportSize={viewportSize} />
      </div>
    </div>
  );
};
