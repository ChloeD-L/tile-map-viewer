import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { TileMap } from "../TileMap";

// Mock the child components
vi.mock("../controls/ZoomControls", () => ({
  ZoomControls: ({ zoom, onZoomIn, onZoomOut }: any) => (
    <div data-testid="zoom-controls">
      <button onClick={onZoomIn}>Zoom In</button>
      <button onClick={onZoomOut}>Zoom Out</button>
      <span>Zoom: {zoom}</span>
    </div>
  ),
}));

vi.mock("../info/InfoPanel", () => ({
  InfoPanel: ({ zoom, centerX, centerY, viewportSize, visibleTiles }: any) => (
    <div data-testid="info-panel">
      <div>Zoom: {zoom}</div>
      <div>
        Center: {Math.round(centerX)}, {Math.round(centerY)}
      </div>
      <div>
        Viewport: {Math.round(viewportSize.width)} × {Math.round(viewportSize.height)}
      </div>
      <div>Tiles: {visibleTiles.length}</div>
    </div>
  ),
}));

vi.mock("../tile/RenderTiles", () => ({
  RenderTiles: ({ tiles, token }: any) => (
    <div data-testid="render-tiles">
      Tiles: {tiles.length}, Token: {token}
    </div>
  ),
}));

// Mock tileUtils
vi.mock("../../../utils/tileUtils", () => ({
  getTilesForViewport: vi.fn(() => [
    { x: 0, y: 0, z: 1 },
    { x: 1, y: 0, z: 1 },
    { x: 0, y: 1, z: 1 },
    { x: 1, y: 1, z: 1 },
  ]),
}));

// Mock ResizeObserver
const mockResizeObserverCallback = vi.fn();
const mockResizeObserver = vi.fn((callback) => {
  mockResizeObserverCallback.mockImplementation(callback);
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});
globalThis.ResizeObserver = mockResizeObserver;

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback) => {
  callback();
  return 1;
});
globalThis.requestAnimationFrame = mockRequestAnimationFrame;

describe("TileMap Integration", () => {
  const defaultProps = {
    token: "test-token",
    initialZoom: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestAnimationFrame.mockClear();
  });

  it("should render with initial state and all child components", () => {
    render(<TileMap {...defaultProps} />);

    // Check that all child components are rendered
    expect(screen.getByTestId("zoom-controls")).toBeInTheDocument();
    expect(screen.getByTestId("info-panel")).toBeInTheDocument();
    expect(screen.getByTestId("render-tiles")).toBeInTheDocument();

    // Check initial zoom level in zoom controls
    const zoomControls = screen.getByTestId("zoom-controls");
    expect(zoomControls).toHaveTextContent("Zoom: 1");

    // Check all child components are rendered
    expect(screen.getByText("Tiles: 4, Token: test-token")).toBeInTheDocument();
  });

  it("should handle zoom in functionality", async () => {
    render(<TileMap {...defaultProps} />);

    const zoomInButton = screen.getByText("Zoom In");
    fireEvent.click(zoomInButton);

    await waitFor(() => {
      const zoomControls = screen.getByTestId("zoom-controls");
      expect(zoomControls).toHaveTextContent("Zoom: 2");
    });

    // Check that center coordinates doubled (zoom in effect)
    const infoPanel = screen.getByTestId("info-panel");
    expect(infoPanel).toHaveTextContent("Center: 512, 512");
  });

  it("should handle zoom out functionality", async () => {
    render(<TileMap {...defaultProps} />);

    const zoomOutButton = screen.getByText("Zoom Out");
    fireEvent.click(zoomOutButton);

    await waitFor(() => {
      const zoomControls = screen.getByTestId("zoom-controls");
      expect(zoomControls).toHaveTextContent("Zoom: 0");
    });

    // Check that center coordinates halved (zoom out effect)
    const infoPanel = screen.getByTestId("info-panel");
    expect(infoPanel).toHaveTextContent("Center: 128, 128");
  });

  it("should update center coordinates when zoom changes", () => {
    render(<TileMap {...defaultProps} />);

    // Get initial center coordinates
    const initialInfoPanel = screen.getByTestId("info-panel");
    expect(initialInfoPanel).toHaveTextContent("Center: 256, 256");

    // Zoom in
    const zoomInButton = screen.getByText("Zoom In");
    fireEvent.click(zoomInButton);

    // Check updated coordinates
    expect(initialInfoPanel).toHaveTextContent("Center: 512, 512");
  });

  it("should render map container with correct styling", () => {
    const { container } = render(<TileMap {...defaultProps} />);

    const mapContainer = container.querySelector(".relative");
    expect(mapContainer).toHaveClass("bg-gray-100");
    expect(mapContainer).toHaveClass("border-gray-400");
  });

  describe("Resize handling", () => {
    it("should setup ResizeObserver on mount", () => {
      render(<TileMap {...defaultProps} />);

      expect(mockResizeObserver).toHaveBeenCalledWith(expect.any(Function));
      expect(mockResizeObserver.mock.results[0].value.observe).toHaveBeenCalled();
    });

    it("should handle ResizeObserver entries and update viewport size", async () => {
      render(<TileMap {...defaultProps} />);

      // Simulate ResizeObserver callback with new dimensions
      const mockEntries = [
        {
          contentRect: {
            width: 1000,
            height: 800,
          },
        },
      ];

      // Trigger the ResizeObserver callback wrapped in act
      await act(async () => {
        mockResizeObserverCallback(mockEntries);
      });

      await waitFor(() => {
        const infoPanel = screen.getByTestId("info-panel");
        expect(infoPanel).toHaveTextContent("Viewport: 1000 × 800");
      });
    });

    it("should handle window resize events", async () => {
      // Mock clientWidth and clientHeight for the map container
      Object.defineProperty(HTMLDivElement.prototype, "clientWidth", {
        configurable: true,
        value: 900,
      });
      Object.defineProperty(HTMLDivElement.prototype, "clientHeight", {
        configurable: true,
        value: 700,
      });

      render(<TileMap {...defaultProps} />);

      // Trigger window resize event
      fireEvent.resize(window);

      // Wait for requestAnimationFrame to be called
      await waitFor(() => {
        expect(mockRequestAnimationFrame).toHaveBeenCalled();
      });

      // Check that viewport size is updated (should account for border width)
      await waitFor(() => {
        const infoPanel = screen.getByTestId("info-panel");
        expect(infoPanel).toHaveTextContent("Viewport: 896 × 696"); // 900-4, 700-4 (border width)
      });
    });

    it("should handle multiple resize events efficiently using requestAnimationFrame", async () => {
      render(<TileMap {...defaultProps} />);

      // Trigger multiple resize events rapidly
      fireEvent.resize(window);
      fireEvent.resize(window);
      fireEvent.resize(window);

      await waitFor(() => {
        // requestAnimationFrame should be called but efficiently throttled
        expect(mockRequestAnimationFrame).toHaveBeenCalled();
      });
    });

    it("should cleanup resize event listeners on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const disconnectSpy = vi.fn();

      // Mock ResizeObserver with disconnect spy
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: disconnectSpy,
      };
      mockResizeObserver.mockReturnValueOnce(mockObserver);

      const { unmount } = render(<TileMap {...defaultProps} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
      expect(disconnectSpy).toHaveBeenCalled();

      removeEventListenerSpy.mockRestore();
    });

    it("should handle ResizeObserver unavailability gracefully", () => {
      // Temporarily remove ResizeObserver
      const originalResizeObserver = globalThis.ResizeObserver;
      delete (globalThis as any).ResizeObserver;

      expect(() => {
        render(<TileMap {...defaultProps} />);
      }).not.toThrow();

      // Restore ResizeObserver
      globalThis.ResizeObserver = originalResizeObserver;
    });

    it("should update viewport size accounting for border width", async () => {
      // Mock specific dimensions
      Object.defineProperty(HTMLDivElement.prototype, "clientWidth", {
        configurable: true,
        value: 1004, // 1000 + 4 (border)
      });
      Object.defineProperty(HTMLDivElement.prototype, "clientHeight", {
        configurable: true,
        value: 804, // 800 + 4 (border)
      });

      render(<TileMap {...defaultProps} />);

      // Trigger resize to update viewport
      fireEvent.resize(window);

      await waitFor(() => {
        const infoPanel = screen.getByTestId("info-panel");
        // Should subtract border width (4px total: 2px each side)
        expect(infoPanel).toHaveTextContent("Viewport: 1000 × 800");
      });
    });
  });

  it("should handle viewport size updates", () => {
    render(<TileMap {...defaultProps} />);

    const infoPanel = screen.getByTestId("info-panel");
    // After ResizeObserver is triggered, viewport should be updated from ResizeObserver callback
    expect(infoPanel).toHaveTextContent("Viewport: 1000 × 800");
  });

  it("should cleanup resources on unmount", () => {
    const { unmount } = render(<TileMap {...defaultProps} />);

    // Should not throw errors on unmount
    expect(() => unmount()).not.toThrow();
  });
});
