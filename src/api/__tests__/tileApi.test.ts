import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadTile } from "../tileApi";

// Mock fetch response helper
const mockFetchResponse = (status: number, ok: boolean, blob?: Blob) => {
  const mockResponse = {
    ok,
    status,
    blob: vi.fn().mockResolvedValue(blob || new Blob()),
  };
  vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse as any);
};

describe("tileApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadTile", () => {
    it("should return success result for successful tile load", async () => {
      const mockBlob = new Blob(["test"], { type: "image/png" });
      mockFetchResponse(200, true, mockBlob);

      const result = await loadTile("https://example.com/tile.png");

      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe("mock-blob-url");
      expect(result.statusCode).toBe(200);
      expect(result.errorType).toBeUndefined();
    });

    it("should return not-found error for 404 status", async () => {
      mockFetchResponse(404, false);

      const result = await loadTile("https://example.com/tile.png");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("not-found");
      expect(result.statusCode).toBe(404);
      expect(result.imageUrl).toBeUndefined();
    });

    it("should return forbidden error for 403 status", async () => {
      mockFetchResponse(403, false);

      const result = await loadTile("https://example.com/tile.png");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("forbidden");
      expect(result.statusCode).toBe(403);
      expect(result.imageUrl).toBeUndefined();
    });

    it("should return server-error for 500 status", async () => {
      mockFetchResponse(500, false);

      const result = await loadTile("https://example.com/tile.png");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("server-error");
      expect(result.statusCode).toBe(500);
    });

    it("should return server-error for 502 status", async () => {
      mockFetchResponse(502, false);

      const result = await loadTile("https://example.com/tile.png");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("server-error");
      expect(result.statusCode).toBe(502);
    });

    it("should return server-error for 503 status", async () => {
      mockFetchResponse(503, false);

      const result = await loadTile("https://example.com/tile.png");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("server-error");
      expect(result.statusCode).toBe(503);
    });

    it("should return unknown error for other HTTP error status", async () => {
      mockFetchResponse(418, false);

      const result = await loadTile("https://example.com/tile.png");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("unknown");
      expect(result.statusCode).toBe(418);
    });

    it("should return network error for fetch failure", async () => {
      const networkError = new Error("Network error");
      vi.mocked(globalThis.fetch).mockRejectedValue(networkError);

      const result = await loadTile("https://example.com/tile.png");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("network");
      expect(result.error).toBe(networkError);
      expect(result.statusCode).toBeUndefined();
    });

    it("should call fetch with correct URL", async () => {
      mockFetchResponse(200, true);
      const testUrl = "https://example.com/tile/1/2/3.png";

      await loadTile(testUrl);

      expect(globalThis.fetch).toHaveBeenCalledWith(testUrl);
    });

    it("should create blob URL for successful response", async () => {
      const mockBlob = new Blob(["test"], { type: "image/png" });
      mockFetchResponse(200, true, mockBlob);

      await loadTile("https://example.com/tile.png");

      expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });
  });
});
