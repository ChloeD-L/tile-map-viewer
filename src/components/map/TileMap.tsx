import { useRef } from "react";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { getTilesForViewport } from "../../utils/tileUtils";
import { ZoomControls } from "./controls/ZoomControls";
import { InfoPanel } from "./info/InfoPanel";
import { RenderTiles } from "./tile/RenderTiles";

interface TileMapProps {
  token: string;
  initialZoom?: number;
}

const getWorldCenter = (zoom: number) => {
  const worldSize = Math.pow(2, zoom) * 256;
  return worldSize / 2;
};

export const TileMap: React.FC<TileMapProps> = ({ token, initialZoom = 0 }) => {
  const [zoom, setZoom] = useState(initialZoom);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [centerX, setCenterX] = useState(() => getWorldCenter(initialZoom));
  const [centerY, setCenterY] = useState(() => getWorldCenter(initialZoom));
  const [viewportSize, setViewportSize] = useState({
    width: 800,
    height: 600,
  });

  const updateViewportSize = useCallback(() => {
    if (mapContainerRef.current) {
      const borderWidth = 4; // 2px border on each side (border-2 = 2px)
      const newSize = {
        width: mapContainerRef.current.clientWidth - borderWidth,
        height: mapContainerRef.current.clientHeight - borderWidth,
      };

      setViewportSize(newSize);
    }
  }, []);

  // Update viewport size on component mount and window resize
  useEffect(() => {
    updateViewportSize();

    const handleResize = () => {
      requestAnimationFrame(updateViewportSize);
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
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

  const visibleTiles = getTilesForViewport(zoom, centerX, centerY, viewportSize.width, viewportSize.height);

  const worldSize = Math.pow(2, zoom) * 256;
  const margin = 4 * 10;
  const containerSize = {
    width: Math.max(worldSize + margin * 2, viewportSize.width),
    height: Math.max(worldSize + margin * 2, viewportSize.height),
  };

  const handleZoomIn = useCallback(() => {
    if (zoom < 3) {
      setZoom(zoom + 1);
      setCenterX(centerX * 2);
      setCenterY(centerY * 2);
    }
  }, [zoom, centerX, centerY]);

  const handleZoomOut = useCallback(() => {
    if (zoom > 0) {
      setZoom(zoom - 1);
      setCenterX(centerX / 2);
      setCenterY(centerY / 2);
    }
  }, [zoom, centerX, centerY]);

  // Auto-scroll to center when container size changes or component mounts
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Simple centering: scroll to the middle of the scrollable area
      const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      const scrollTop = (container.scrollHeight - container.clientHeight) / 2;

      container.scrollLeft = scrollLeft;
      container.scrollTop = scrollTop;
    }
  }, [containerSize.width, containerSize.height, viewportSize.width, viewportSize.height]);

  return (
    <div
      ref={mapContainerRef}
      className="relative w-[calc(100vw-10rem-4*2*2px)] h-[calc(100vh-11rem-4*2*2px)] 
                 sm:w-[calc(100vw-10rem-4*2*2px)] sm:h-[calc(100vh-11rem-4*2*2px)]
                 bg-gray-100 border border-gray-400"
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    >
      {/* Scrollable container - constrained to parent size */}
      <div ref={scrollContainerRef} className="overflow-auto w-full h-full relative">
        {/* Large scrollable area with map centered */}
        <RenderTiles
          tiles={visibleTiles}
          token={token}
          centerX={centerX}
          centerY={centerY}
          containerSize={containerSize}
        />
      </div>

      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-[1000] pointer-events-auto">
        <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} minZoom={0} maxZoom={3} />
      </div>

      <InfoPanel
        zoom={zoom}
        centerX={centerX}
        centerY={centerY}
        viewportSize={viewportSize}
        visibleTiles={visibleTiles}
      />
    </div>
  );
};
