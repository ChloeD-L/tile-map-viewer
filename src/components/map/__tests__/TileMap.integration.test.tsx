import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TileMap } from "../TileMap";

// Mock child components
vi.mock("../controls/ZoomControls", () => ({
  ZoomControls: ({ zoom, onZoomIn, onZoomOut, minZoom, maxZoom }: any) => (
    <div data-testid="zoom-controls">
      <button onClick={onZoomIn} disabled={zoom >= maxZoom}>
        Zoom In
      </button>
      <button onClick={onZoomOut} disabled={zoom <= minZoom}>
        Zoom Out
      </button>
      <span>Zoom: {zoom}</span>
    </div>
  ),
}));

vi.mock("../../infoPanel/InfoPanel", () => ({
  InfoPanel: (props: any) => (
    <div data-testid="info-panel">
      Zoom: {props.zoom}, Center: {props.centerX},{props.centerY}
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

// Mock utility functions
vi.mock("../../../utils/tileUtils", () => ({
  getTilesForViewport: vi.fn(() => [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 1, y: 1, z: 0 },
  ]),
}));

describe("TileMap Integration", () => {
  const defaultProps = {
    token: "test-token",
    initialZoom: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock ResizeObserver
    (globalThis as any).ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock requestAnimationFrame
    (globalThis as any).requestAnimationFrame = vi.fn((cb) => {
      cb(0);
      return 0;
    });
  });

  it("should render with initial state and all child components", () => {
    render(<TileMap {...defaultProps} />);

    // Check initial zoom level
    expect(screen.getByText("Zoom: 1")).toBeInTheDocument();

    // Check all child components are rendered
    expect(screen.getByTestId("zoom-controls")).toBeInTheDocument();
    expect(screen.getByTestId("info-panel")).toBeInTheDocument();
    expect(screen.getByTestId("render-tiles")).toBeInTheDocument();

    // Check correct props passed to RenderTiles
    expect(screen.getByText(/Tiles: 4, Token: test-token/)).toBeInTheDocument();
  });

  it("should handle zoom in functionality", async () => {
    render(<TileMap {...defaultProps} initialZoom={1} />);

    const zoomInButton = screen.getByText("Zoom In");
    fireEvent.click(zoomInButton);

    await waitFor(() => {
      expect(screen.getByText("Zoom: 2")).toBeInTheDocument();
    });
  });

  it("should handle zoom out functionality", async () => {
    render(<TileMap {...defaultProps} initialZoom={1} />);

    const zoomOutButton = screen.getByText("Zoom Out");
    fireEvent.click(zoomOutButton);

    await waitFor(() => {
      expect(screen.getByText("Zoom: 0")).toBeInTheDocument();
    });
  });

  it("should respect zoom limits", async () => {
    // Test maximum zoom limit
    render(<TileMap {...defaultProps} initialZoom={3} />);
    const zoomInButton = screen.getByText("Zoom In");
    expect(zoomInButton).toBeDisabled();
  });

  it("should respect minimum zoom limit", async () => {
    // Test minimum zoom limit
    render(<TileMap {...defaultProps} initialZoom={0} />);
    const zoomOutButton = screen.getByText("Zoom Out");
    expect(zoomOutButton).toBeDisabled();
  });

  it("should update center coordinates when zoom changes", async () => {
    render(<TileMap {...defaultProps} initialZoom={1} />);

    // Get initial center coordinates
    const initialInfoPanel = screen.getByTestId("info-panel");
    const initialText = initialInfoPanel.textContent;

    // Zoom in and check coordinates change
    const zoomInButton = screen.getByText("Zoom In");
    fireEvent.click(zoomInButton);

    await waitFor(() => {
      const updatedInfoPanel = screen.getByTestId("info-panel");
      const updatedText = updatedInfoPanel.textContent;
      expect(updatedText).not.toBe(initialText);
      expect(updatedText).toContain("Zoom: 2");
    });
  });

  it("should cleanup resources on unmount", () => {
    const mockDisconnect = vi.fn();
    (globalThis as any).ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: mockDisconnect,
    }));

    const { unmount } = render(<TileMap {...defaultProps} />);
    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
