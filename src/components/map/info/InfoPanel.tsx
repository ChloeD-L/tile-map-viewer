import React from "react";
import { Info } from "lucide-react";
import type { TileCoordinate } from "../../../types";
import { MapInfo } from "./components/MapInfo";

interface InfoPanelProps {
  zoom: number;
  centerX: number;
  centerY: number;
  viewportSize: { width: number; height: number };
  allTiles: TileCoordinate[];
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ zoom, centerX, centerY, viewportSize, allTiles }) => {
  return (
    <>
      {/* mobile minimize display */}
      <div
        className="absolute top-2 left-2 
                      bg-white/90 backdrop-blur-sm rounded shadow 
                      px-2 py-1 text-xs z-[1000] pointer-events-auto
                      block sm:hidden"
        data-testid="info-panel-mobile"
      >
        <div className="flex items-center space-x-1 text-gray-800 font-medium">
          <Info size={12} />
          <span>Z{zoom}</span>
        </div>
      </div>

      {/* desktop detailed display */}
      <div
        className="absolute top-2 left-2 sm:top-4 sm:left-4 
                      bg-white/90 backdrop-blur-sm rounded-lg shadow-lg 
                      p-2 sm:p-3 text-xs z-[1000] pointer-events-auto
                      hidden sm:block"
        data-testid="info-panel"
      >
        <div className="text-sm font-medium mb-2 text-gray-800">Zoom: {zoom}</div>

        <div className="space-y-1 text-xs">
          <MapInfo zoom={zoom} centerX={centerX} centerY={centerY} viewportSize={viewportSize} allTiles={allTiles} />
        </div>
      </div>
    </>
  );
};
