import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ZoomControls } from "../ZoomControls";

describe("ZoomControls", () => {
  const defaultProps = {
    zoom: 1,
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    minZoom: 0,
    maxZoom: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render current zoom level", () => {
    render(<ZoomControls {...defaultProps} zoom={2} />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should call onZoomIn when zoom in button is clicked", () => {
    render(<ZoomControls {...defaultProps} />);

    const zoomInButton = screen.getByLabelText("Zoom in");
    fireEvent.click(zoomInButton);

    expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(1);
  });

  it("should call onZoomOut when zoom out button is clicked", () => {
    render(<ZoomControls {...defaultProps} />);

    const zoomOutButton = screen.getByLabelText("Zoom out");
    fireEvent.click(zoomOutButton);

    expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(1);
  });

  it("should disable zoom out button at minimum zoom", () => {
    render(<ZoomControls {...defaultProps} zoom={0} />);

    const zoomOutButton = screen.getByLabelText("Zoom out");
    expect(zoomOutButton).toBeDisabled();
  });

  it("should disable zoom in button at maximum zoom", () => {
    render(<ZoomControls {...defaultProps} zoom={3} />);

    const zoomInButton = screen.getByLabelText("Zoom in");
    expect(zoomInButton).toBeDisabled();
  });

  it("should enable both buttons at middle zoom levels", () => {
    render(<ZoomControls {...defaultProps} zoom={1} />);

    const zoomInButton = screen.getByLabelText("Zoom in");
    const zoomOutButton = screen.getByLabelText("Zoom out");

    expect(zoomInButton).not.toBeDisabled();
    expect(zoomOutButton).not.toBeDisabled();
  });

  it("should not call onZoomIn when button is disabled", () => {
    render(<ZoomControls {...defaultProps} zoom={3} />);

    const zoomInButton = screen.getByLabelText("Zoom in");
    fireEvent.click(zoomInButton);

    expect(defaultProps.onZoomIn).not.toHaveBeenCalled();
  });

  it("should not call onZoomOut when button is disabled", () => {
    render(<ZoomControls {...defaultProps} zoom={0} />);

    const zoomOutButton = screen.getByLabelText("Zoom out");
    fireEvent.click(zoomOutButton);

    expect(defaultProps.onZoomOut).not.toHaveBeenCalled();
  });

  it("should have correct styling for enabled buttons", () => {
    render(<ZoomControls {...defaultProps} zoom={1} />);

    const zoomInButton = screen.getByLabelText("Zoom in");
    const zoomOutButton = screen.getByLabelText("Zoom out");

    expect(zoomInButton).toHaveClass("hover:bg-blue-50");
    expect(zoomOutButton).toHaveClass("hover:bg-blue-50");
  });
});
