import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(globalThis.URL, "createObjectURL", {
  value: vi.fn(() => "mock-blob-url"),
});
Object.defineProperty(globalThis.URL, "revokeObjectURL", {
  value: vi.fn(),
});

// Mock fetch
globalThis.fetch = vi.fn() as any;
