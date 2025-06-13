import { useRef } from "react";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { getTilesForViewport } from "../../utils/tileUtils";
import { ZoomControls } from "./controls/ZoomControls";
import { InfoPanel } from "./info/InfoPanel";
import { RenderTiles } from "./tile/RenderTiles";
import type { TileCoordinate } from "../../types";

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
  const [isDragging, setIsDragging] = useState(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });

  // map center in world coordinates
  const [mapCenterX, setMapCenterX] = useState(() => getWorldCenter(initialZoom));
  const [mapCenterY, setMapCenterY] = useState(() => getWorldCenter(initialZoom));

  // offset from the center
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [viewportSize, setViewportSize] = useState({
    width: 800,
    height: 600,
  });
  const [allTiles, setAllTiles] = useState<TileCoordinate[]>([]);

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

  // add new tiles to existing list (deduplication)
  const addNewTiles = useCallback((newTiles: TileCoordinate[]) => {
    setAllTiles((prevTiles) => {
      const tileSet = new Set(prevTiles.map((t) => `${t.z}-${t.x}-${t.y}`));
      const uniqueNewTiles = newTiles.filter((t) => !tileSet.has(`${t.z}-${t.x}-${t.y}`));

      if (uniqueNewTiles.length > 0) {
        console.log(`Adding ${uniqueNewTiles.length} new tiles`);
        return [...prevTiles, ...uniqueNewTiles];
      }
      return prevTiles;
    });
  }, []);

  const updateVisibleTiles = useCallback(() => {
    // Calculate the world size at current zoom level
    const worldSize = Math.pow(2, zoom) * 256;

    // Ensure we're not going beyond world boundaries
    const boundedCenterX = Math.max(0, Math.min(worldSize, mapCenterX + offsetX));
    const boundedCenterY = Math.max(0, Math.min(worldSize, mapCenterY + offsetY));

    const newVisibleTiles = getTilesForViewport(
      zoom,
      boundedCenterX,
      boundedCenterY,
      viewportSize.width,
      viewportSize.height
    );

    addNewTiles(newVisibleTiles);
  }, [zoom, mapCenterX, mapCenterY, offsetX, offsetY, viewportSize, addNewTiles]);

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

  // initialize tiles
  useEffect(() => {
    updateVisibleTiles();
  }, [zoom, mapCenterX, mapCenterY, offsetX, offsetY, viewportSize, updateVisibleTiles]);

  const worldSize = Math.pow(2, zoom) * 256;
  const containerSize = {
    width: worldSize,
    height: worldSize,
  };

  const handleZoomIn = useCallback(() => {
    if (zoom < 3) {
      setAllTiles([]); // Clear existing tiles
      const newZoom = zoom + 1;
      setZoom(newZoom);

      // Reset offset and center the view
      setOffsetX(0);
      setOffsetY(0);

      // Calculate the world size at the new zoom level
      const newWorldSize = Math.pow(2, newZoom) * 256;
      const newCenter = newWorldSize / 2;

      // Set the map center to the new world center
      setMapCenterX(newCenter);
      setMapCenterY(newCenter);

      console.log("Zoom in", {
        zoom,
        newZoom,
        newCenter,
        offsetX,
        offsetY,
      });
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    if (zoom > 0) {
      setAllTiles([]); // Clear existing tiles
      const newZoom = zoom - 1;
      setZoom(newZoom);

      // Reset offset and center the view
      setOffsetX(0);
      setOffsetY(0);

      // Calculate the world size at the new zoom level
      const newWorldSize = Math.pow(2, newZoom) * 256;
      const newCenter = newWorldSize / 2;

      // Set the map center to the new world center
      setMapCenterX(newCenter);
      setMapCenterY(newCenter);
    }
  }, [zoom]);

  // Mouse event handlers for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - lastPositionRef.current.x;
      const dy = e.clientY - lastPositionRef.current.y;

      // Scale the drag distance based on zoom level
      const scale = Math.pow(2, zoom);
      setOffsetX((prev) => prev - dx * scale);
      setOffsetY((prev) => prev - dy * scale);

      lastPositionRef.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="relative w-[calc(100vw-10rem-4*2*2px)] h-[calc(100vh-11rem-4*2*2px)] 
                 sm:w-[calc(100vw-10rem-4*2*2px)] sm:h-[calc(100vh-11rem-4*2*2px)]
                 bg-gray-100 border border-gray-400 overflow-hidden select-none"
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Map container with absolute positioning */}
      <div
        className="absolute"
        style={{
          width: containerSize.width,
          height: containerSize.height,
          left: `calc(50% - ${containerSize.width / 2}px)`,
          top: `calc(50% - ${containerSize.height / 2}px)`,
        }}
      >
        <RenderTiles
          tiles={allTiles}
          token={token}
          centerX={mapCenterX + offsetX}
          centerY={mapCenterY + offsetY}
          containerSize={containerSize}
        />
      </div>

      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-[1000] pointer-events-auto">
        <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} minZoom={0} maxZoom={3} />
      </div>

      <InfoPanel
        zoom={zoom}
        centerX={mapCenterX + offsetX}
        centerY={mapCenterY + offsetY}
        viewportSize={viewportSize}
        allTiles={allTiles}
      />
    </div>
  );
};
