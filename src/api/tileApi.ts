import type { TileErrorType } from "../types";

export interface TileLoadResult {
  success: boolean;
  imageUrl?: string;
  errorType?: TileErrorType;
  statusCode?: number;
  error?: Error;
}

export const loadTile = async (url: string): Promise<TileLoadResult> => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      return {
        success: true,
        imageUrl: blobUrl,
        statusCode: response.status,
      };
    } else {
      // Handle specific HTTP errors
      let errorType: TileErrorType;
      switch (response.status) {
        case 404:
          errorType = "not-found";
          break;
        case 403:
          errorType = "forbidden";
          break;
        case 500:
        case 502:
        case 503:
          errorType = "server-error";
          break;
        default:
          errorType = "unknown";
      }

      return {
        success: false,
        errorType,
        statusCode: response.status,
      };
    }
  } catch (error) {
    return {
      success: false,
      errorType: "network",
      error: error as Error,
    };
  }
};
