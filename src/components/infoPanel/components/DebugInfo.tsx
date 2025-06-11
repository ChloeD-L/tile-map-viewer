interface DebugInfoProps {
  zoom: number;
  centerX: number;
  centerY: number;
  viewportSize: { width: number; height: number };
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ zoom, centerX, centerY, viewportSize }) => {
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="text-green-600">HMR Active</div>
        <div className="text-blue-600">ResizeObserver Active</div>
      </div>

      {/* Calculation details */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="font-medium text-blue-600">Calculation Details:</div>
        <div className="text-gray-500 space-y-1">
          <div>Viewport range:</div>
          <div className="ml-2">
            Left: {Math.round(centerX - viewportSize.width / 2)}, Right: {Math.round(centerX + viewportSize.width / 2)}
          </div>
          <div className="ml-2">
            Top: {Math.round(centerY - viewportSize.height / 2)}, Bottom:{" "}
            {Math.round(centerY + viewportSize.height / 2)}
          </div>

          <div className="mt-1">Tile range:</div>
          <div className="ml-2">
            X: {Math.max(0, Math.floor((centerX - viewportSize.width / 2) / 256) - 2)} to{" "}
            {Math.min(Math.pow(2, zoom) - 1, Math.floor((centerX + viewportSize.width / 2) / 256))}
          </div>
          <div className="ml-2">
            Y: {Math.max(0, Math.floor((centerY - viewportSize.height / 2) / 256) - 2)} to{" "}
            {Math.min(Math.pow(2, zoom) - 1, Math.floor((centerY + viewportSize.height / 2) / 256))}
          </div>
        </div>
      </div>
    </>
  );
};
