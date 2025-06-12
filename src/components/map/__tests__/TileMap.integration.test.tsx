import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
globalThis.ResizeObserver = mockResizeObserver;

describe("TileMap Integration", () => {
  const defaultProps = {
    token: "test-token",
    initialZoom: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
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

  it("should handle viewport size updates", () => {
    render(<TileMap {...defaultProps} />);

    const infoPanel = screen.getByTestId("info-panel");
    // Default mock viewport size should be shown
    expect(infoPanel).toHaveTextContent("Viewport: -4 × -4");
  });

  it("should cleanup resources on unmount", () => {
    const { unmount } = render(<TileMap {...defaultProps} />);

    // Should not throw errors on unmount
    expect(() => unmount()).not.toThrow();
  });
});
