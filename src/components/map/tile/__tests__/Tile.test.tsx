import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { waitFor } from "@testing-library/dom";
import { Tile } from "../Tile";
import { loadTile } from "../../../../api/tileApi";

// Mock the tileApi
vi.mock("../../../../api/tileApi");
const mockLoadTile = vi.mocked(loadTile);

describe("Tile", () => {
  const defaultProps = {
    x: 1,
    y: 2,
    z: 3,
    url: "https://example.com/tile/3/1/2.png",
    style: { left: 100, top: 200 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    mockLoadTile.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Tile {...defaultProps} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render successful tile image", async () => {
    const blobUrl = "blob:test-url";
    mockLoadTile.mockResolvedValue({
      success: true,
      imageUrl: blobUrl,
      statusCode: 200,
    });

    render(<Tile {...defaultProps} />);

    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", blobUrl);
      expect(img).toHaveAttribute("alt", "Tile 3/1/2");
    });
  });

  it("should render error states with correct styling", async () => {
    const errorCases = [
      { errorType: "forbidden" as const, expectedClass: "bg-red-100", expectedText: "Access Denied (403)" },
      { errorType: "not-found" as const, expectedClass: "bg-gray-100", expectedText: "Tile Not Found (404)" },
      { errorType: "server-error" as const, expectedClass: "bg-orange-100", expectedText: "Server Error (500)" },
      { errorType: "network" as const, expectedClass: "bg-yellow-100", expectedText: "Network Error" },
    ];

    for (const { errorType, expectedClass, expectedText } of errorCases) {
      mockLoadTile.mockResolvedValue({
        success: false,
        errorType,
        statusCode: errorType === "forbidden" ? 403 : errorType === "not-found" ? 404 : 500,
      });

      const { unmount } = render(<Tile {...defaultProps} />);

      await waitFor(() => {
        const errorDiv = screen.getByText(expectedText);
        expect(errorDiv.closest(".border-2")).toHaveClass(expectedClass);
      });

      unmount();
    }
  });

  it("should have correct positioning and size", async () => {
    mockLoadTile.mockResolvedValue({
      success: true,
      imageUrl: "blob:test-url",
    });

    const { container } = render(<Tile {...defaultProps} />);

    const tileDiv = container.firstChild as HTMLElement;
    expect(tileDiv).toHaveStyle({
      left: "100px",
      top: "200px",
      width: "256px",
      height: "256px",
    });
  });

  it("should cleanup blob URL on unmount", async () => {
    const blobUrl = "blob:test-url";
    mockLoadTile.mockResolvedValue({
      success: true,
      imageUrl: blobUrl,
    });

    const { unmount } = render(<Tile {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    unmount();

    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(blobUrl);
  });

  it("should not cleanup blob URL if load failed", () => {
    mockLoadTile.mockResolvedValue({
      success: false,
      errorType: "not-found",
    });

    const { unmount } = render(<Tile {...defaultProps} />);
    unmount();

    expect(globalThis.URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("should call loadTile with correct URL", () => {
    render(<Tile {...defaultProps} />);

    expect(mockLoadTile).toHaveBeenCalledWith(defaultProps.url);
  });
});
