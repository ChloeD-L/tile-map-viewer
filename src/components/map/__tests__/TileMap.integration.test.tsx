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
  InfoPanel: ({ zoom, centerX, centerY, viewportSize, allTiles }: any) => (
    <div data-testid="info-panel">
      <div>Zoom: {zoom}</div>
      <div>
        Center: {Math.round(centerX)}, {Math.round(centerY)}
      </div>
      <div>
        Viewport: {Math.round(viewportSize.width)} × {Math.round(viewportSize.height)}
      </div>
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

  describe("Scroll handling", () => {
    it("should update viewport center on scroll", async () => {
      const { container } = render(<TileMap {...defaultProps} />);
      const scrollContainer = container.querySelector(".overflow-auto");

      // Mock scroll properties with getters and setters
      let scrollLeft = 100;
      let scrollTop = 100;

      Object.defineProperty(scrollContainer, "scrollLeft", {
        get: () => scrollLeft,
        set: (value) => {
          scrollLeft = value;
        },
        configurable: true,
      });

      Object.defineProperty(scrollContainer, "scrollTop", {
        get: () => scrollTop,
        set: (value) => {
          scrollTop = value;
        },
        configurable: true,
      });

      Object.defineProperty(scrollContainer, "scrollWidth", { get: () => 1000 });
      Object.defineProperty(scrollContainer, "scrollHeight", { get: () => 1000 });
      Object.defineProperty(scrollContainer, "clientWidth", { get: () => 800 });
      Object.defineProperty(scrollContainer, "clientHeight", { get: () => 600 });

      const mockScrollEvent = new Event("scroll");
      fireEvent.scroll(scrollContainer!, mockScrollEvent);

      await waitFor(() => {
        const infoPanel = screen.getByTestId("info-panel");
        expect(infoPanel).toHaveTextContent(/Center: \d+, \d+/);
      });
    });
  });

  describe("Resize handling", () => {
    it("should setup ResizeObserver on mount", () => {
      render(<TileMap {...defaultProps} />);
      expect(mockResizeObserver).toHaveBeenCalled();
    });

    it("should handle window resize", async () => {
      render(<TileMap {...defaultProps} />);

      await act(async () => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it("should update viewport size on container resize", async () => {
      const { container } = render(<TileMap {...defaultProps} />);
      const mapContainer = container.querySelector(".relative");

      // Mock container size with border width
      const borderWidth = 4; // 2px border on each side
      Object.defineProperty(mapContainer, "clientWidth", { get: () => 1000 });
      Object.defineProperty(mapContainer, "clientHeight", { get: () => 800 });

      await act(async () => {
        // Trigger ResizeObserver callback with contentRect
        mockResizeObserverCallback([
          {
            contentRect: {
              width: 1000 - borderWidth,
              height: 800 - borderWidth,
            },
          },
        ]);
      });

      await waitFor(() => {
        const infoPanel = screen.getByTestId("info-panel");
        expect(infoPanel).toHaveTextContent("Viewport: 996 × 796");
      });
    });
  });

  describe("Cleanup", () => {
    it("should cleanup event listeners on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = render(<TileMap {...defaultProps} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });

    it("should disconnect ResizeObserver on unmount", () => {
      const disconnectSpy = vi.fn();
      mockResizeObserver.mockReturnValueOnce({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: disconnectSpy,
      });

      const { unmount } = render(<TileMap {...defaultProps} />);
      unmount();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});
