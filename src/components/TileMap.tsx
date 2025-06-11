import { useState, useEffect, useCallback, useRef } from "react";
import { Tile } from "./Tile";
import { ZoomControls } from "./ZoomControls";
import { getTilesForViewport, getTileUrl, getTilePosition } from "../utils/tileUtils";
import type { TileCoordinate } from "../types";

interface TileMapProps {
  token: string;
  initialZoom?: number;
}

// Calculate world center point for specified zoom level
const getWorldCenter = (zoom: number) => {
  const worldSize = Math.pow(2, zoom) * 256; // World pixel size at current zoom level
  return worldSize / 2; // Center point of the world
};

export const TileMap: React.FC<TileMapProps> = ({ token, initialZoom = 0 }) => {
  const [zoom, setZoom] = useState(initialZoom);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Map center point pixel coordinates (position in the entire map world coordinate system)
  //
  // Coordinate system explanation:
  // - zoom=0: entire world is 256×256 pixels (1 tile), center point is (128, 128)
  // - zoom=1: entire world is 512×512 pixels (4 tiles), center point is (256, 256)
  // - zoom=2: entire world is 1024×1024 pixels (16 tiles), center point is (512, 512)
  //
  // When zooming, we adjust center point coordinates accordingly:
  // - zoom in: centerX *= 2, centerY *= 2 (maintain relative position)
  // - zoom out: centerX /= 2, centerY /= 2
  const [centerX, setCenterX] = useState(() => getWorldCenter(initialZoom));
  const [centerY, setCenterY] = useState(() => getWorldCenter(initialZoom));
  const [viewportSize, setViewportSize] = useState({
    width: 800, // Initial default values
    height: 600,
  });

  // Function to accurately calculate viewport dimensions
  const updateViewportSize = useCallback(() => {
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const newSize = {
        width: rect.width,
        height: rect.height,
      };

      if (import.meta.env.DEV) {
        console.log("Viewport size updated:", newSize);
      }

      setViewportSize(newSize);
    }
  }, []);

  // Update viewport size on component mount and window resize
  useEffect(() => {
    // Initial calculation
    updateViewportSize();

    // Listen for window resize
    const handleResize = () => {
      // Use requestAnimationFrame to ensure DOM updates before calculation
      requestAnimationFrame(updateViewportSize);
    };

    window.addEventListener("resize", handleResize);

    // Use ResizeObserver to monitor container size changes (more accurate)
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (import.meta.env.DEV) {
            console.log("ResizeObserver detected size change:", { width, height });
          }
          setViewportSize({ width, height });
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [updateViewportSize]);

  // Get tiles that should be visible in current viewport
  const visibleTiles = getTilesForViewport(zoom, centerX, centerY, viewportSize.width, viewportSize.height);

  const handleZoomIn = useCallback(() => {
    if (zoom < 3) {
      setZoom(zoom + 1);
      // When zooming in, scale the center coordinates
      setCenterX(centerX * 2);
      setCenterY(centerY * 2);
    }
  }, [zoom, centerX, centerY]);

  const handleZoomOut = useCallback(() => {
    if (zoom > 0) {
      setZoom(zoom - 1);
      // When zooming out, scale down the center coordinates
      setCenterX(centerX / 2);
      setCenterY(centerY / 2);
    }
  }, [zoom, centerX, centerY]);

  return (
    <div ref={mapContainerRef} className="relative w-full h-full overflow-auto bg-gray-100 border-2 border-red-500">
      <div className="relative" style={{ width: "200%", height: "200%" }}>
        {visibleTiles.map((tile) => {
          const position = getTilePosition(tile.x, tile.y, centerX, centerY, viewportSize.width, viewportSize.height);
          const url = getTileUrl(tile.x, tile.y, tile.z, token);

          return (
            <Tile
              key={`${tile.z}-${tile.x}-${tile.y}`}
              x={tile.x}
              y={tile.y}
              z={tile.z}
              url={url}
              style={{
                left: position.x,
                top: position.y,
              }}
            />
          );
        })}
      </div>

      {/* Map center point marker */}
      <div
        className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"
        style={{
          left: viewportSize.width / 2 - 8, // -8 for half of marker width
          top: viewportSize.height / 2 - 8, // -8 for half of marker height
          zIndex: 1000,
        }}
      >
        <div className="absolute -top-6 -left-6 text-xs font-bold text-red-600 bg-white px-1 rounded shadow">
          Center
        </div>
      </div>

      {/* Zoom controls - fixed in bottom right corner */}
      <div className="absolute bottom-4 right-4">
        <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} minZoom={0} maxZoom={3} />
      </div>

      {/* Info panel - fixed in top left corner */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="text-sm font-medium mb-2">Map Viewer - Zoom Level: {zoom}</div>

        <div className="space-y-1 text-xs">
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

          <div className="text-gray-600">
            <strong>Viewport size:</strong> {Math.round(viewportSize.width)} × {Math.round(viewportSize.height)}
          </div>
          <div className="text-gray-600">
            <strong>Visible tiles:</strong> {visibleTiles.length}
          </div>

          {import.meta.env.DEV && (
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
                    Left: {Math.round(centerX - viewportSize.width / 2)}, Right:{" "}
                    {Math.round(centerX + viewportSize.width / 2)}
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
          )}
        </div>
      </div>
    </div>
  );
};

// HMR configuration (development mode)
if (import.meta.hot) {
  import.meta.hot.accept("./TileMap", () => {
    console.log("TileMap hot reloaded successfully");
  });
}
