import React from "react";

interface MapInfoProps {
  zoom: number;
  centerX: number;
  centerY: number;
}

export const MapInfo: React.FC<MapInfoProps> = ({ zoom, centerX, centerY }) => {
  return (
    <div className="space-y-1">
      <div className="text-red-600 font-medium">
        <strong>Map Center:</strong> ({Math.round(centerX)}, {Math.round(centerY)})
      </div>
      <div className="text-gray-500">(Red dot marks the position)</div>

      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="text-gray-600">
          <strong>Current zoom level world size:</strong>
        </div>
        <div className="text-gray-500">
          {Math.pow(2, zoom) * 256} × {Math.pow(2, zoom) * 256} pixels
        </div>
        <div className="text-gray-500">
          = {Math.pow(2, zoom)} × {Math.pow(2, zoom)} tiles
        </div>
      </div>
    </div>
  );
};
