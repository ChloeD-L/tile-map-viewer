import React from "react";
import { Plus, Minus } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  minZoom: number;
  maxZoom: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomIn, onZoomOut, minZoom, maxZoom }) => {
  return (
    <div className="flex flex-col space-y-1 sm:space-y-2">
      <button
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
        className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded shadow-lg 
                   hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-all duration-200 flex items-center justify-center
                   active:scale-95"
        aria-label="Zoom in"
      >
        <Plus size={16} className="sm:w-5 sm:h-5" />
      </button>

      <div
        className="w-8 h-6 sm:w-10 sm:h-8 bg-white border border-gray-300 rounded shadow-lg 
                      flex items-center justify-center text-xs sm:text-sm font-medium text-gray-700"
      >
        {zoom}
      </div>

      <button
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
        className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded shadow-lg 
                   hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-all duration-200 flex items-center justify-center
                   active:scale-95"
        aria-label="Zoom out"
      >
        <Minus size={16} className="sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};
