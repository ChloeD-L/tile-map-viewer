import { useState } from "react";

interface TileProps {
  x: number;
  y: number;
  z: number;
  url: string;
  style: React.CSSProperties;
}

export const Tile: React.FC<TileProps> = ({ x, y, z, url, style }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);

    // Log error details for debugging
    console.error(`Tile ${z}/${x}/${y} failed to load:`, {
      url,
      event,
      naturalWidth: event.currentTarget.naturalWidth,
      naturalHeight: event.currentTarget.naturalHeight,
    });

    // Detect error type
    if (url.includes("token=")) {
      setErrorDetails("Token/Auth Error");
    } else {
      setErrorDetails("Network Error");
    }
  };

  return (
    <div
      className="absolute"
      style={{
        ...style,
        width: 256,
        height: 256,
      }}
    >
      {!hasError ? (
        <img
          src={url}
          alt={`Tile ${z}/${x}/${y}`}
          className="w-full h-full object-cover"
          onLoad={handleLoad}
          onError={handleError}
          crossOrigin="anonymous"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-red-100 border-2 border-red-300 flex flex-col items-center justify-center text-red-600 text-xs p-2">
          <div className="font-bold">Load Failed</div>
          <div className="text-center mt-1">
            <div>
              {z}/{x}/{y}
            </div>
            <div className="text-red-500">{errorDetails}</div>
            <div className="mt-2 text-xs break-all">{url.substring(0, 50)}...</div>
          </div>
        </div>
      )}

      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
          <div className="text-blue-600 text-sm">Loading...</div>
        </div>
      )}
    </div>
  );
};
