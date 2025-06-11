interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  minZoom: number;
  maxZoom: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomIn, onZoomOut, minZoom, maxZoom }) => {
  return (
    <div className="flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
      <button
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
        title="Zoom In"
      >
        +
      </button>

      <div className="text-center text-sm font-medium text-gray-700 px-2">{zoom}</div>

      <button
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
        title="Zoom Out"
      >
        -
      </button>
    </div>
  );
};
