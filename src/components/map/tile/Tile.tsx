import { useState, useEffect } from "react";
import { loadTile } from "../../../api/tileApi";
import { getErrorMessage, getErrorStyling, getErrorHint } from "../../../utils/errorUtils";
import type { TileErrorType } from "../../../types";

interface TileProps {
  x: number;
  y: number;
  z: number;
  url: string;
  style: React.CSSProperties;
}

export const Tile: React.FC<TileProps> = ({ x, y, z, url, style }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState<TileErrorType>("none");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | undefined>();

  useEffect(() => {
    let isCancelled = false;

    const loadTileAsync = async () => {
      setIsLoading(true);
      setErrorType("none");
      setImageUrl(null);

      const result = await loadTile(url);

      if (isCancelled) return;

      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl);
        setIsLoading(false);
      } else {
        setErrorType(result.errorType || "unknown");
        setStatusCode(result.statusCode);
        setIsLoading(false);

        // Log error for debugging
        console.error(`Tile ${z}/${x}/${y} failed to load:`, {
          url,
          errorType: result.errorType,
          statusCode: result.statusCode,
          error: result.error,
        });
      }
    };

    loadTileAsync();

    return () => {
      isCancelled = true;
    };
  }, [url, x, y, z]);

  // Cleanup blob URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div
      className="absolute"
      style={{
        ...style,
        width: 256,
        height: 256,
      }}
    >
      {errorType === "none" && imageUrl ? (
        <img src={imageUrl} alt={`Tile ${z}/${x}/${y}`} className="w-full h-full object-cover" loading="lazy" />
      ) : errorType !== "none" ? (
        <div
          className={`w-full h-full border-2 flex flex-col items-center justify-center text-xs p-2 ${getErrorStyling(
            errorType
          )}`}
        >
          <div className="font-bold">{getErrorMessage(errorType, statusCode)}</div>
          <div className="text-center mt-1">
            <div>
              Tile {z}/{x}/{y}
            </div>
            <div className="mt-1 text-xs opacity-75">{getErrorHint(errorType)}</div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
          <div className="text-blue-600 text-sm">Loading...</div>
        </div>
      )}
    </div>
  );
};
