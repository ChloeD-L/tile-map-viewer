import type { TileErrorType } from "../types";

export const getErrorMessage = (errorType: TileErrorType, statusCode?: number): string => {
  switch (errorType) {
    case "not-found":
      return `Tile Not Found (404)`;
    case "forbidden":
      return `Access Denied (403)`;
    case "server-error":
      return `Server Error (${statusCode || "Unknown"})`;
    case "network":
      return "Network Error";
    case "unknown":
      return `HTTP Error (${statusCode || "Unknown"})`;
    default:
      return "Load Failed";
  }
};

export const getErrorStyling = (errorType: TileErrorType): string => {
  switch (errorType) {
    case "not-found":
      return "bg-gray-100 border-gray-300 text-gray-600";
    case "forbidden":
      return "bg-red-100 border-red-300 text-red-600";
    case "server-error":
      return "bg-orange-100 border-orange-300 text-orange-700";
    case "network":
      return "bg-yellow-100 border-yellow-300 text-yellow-700";
    default:
      return "bg-red-100 border-red-300 text-red-600";
  }
};

export const getErrorHint = (errorType: TileErrorType): string => {
  switch (errorType) {
    case "forbidden":
      return "Check your API token";
    case "not-found":
      return "Tile does not exist at this location";
    case "server-error":
      return "Server is experiencing issues";
    case "network":
      return "Check your internet connection";
    default:
      return "Try refreshing the page";
  }
};
