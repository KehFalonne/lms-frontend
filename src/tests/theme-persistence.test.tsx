import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeProvider, useTheme } from "@/components/providers/theme-provider";

function ThemeProbe() {
  const { theme, setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme("dark")}>
      theme: {theme}
    </button>
  );
}

describe("ThemeProvider persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("restores the stored theme without clobbering it on mount", async () => {
    localStorage.setItem("gu-lms-theme", "light");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent("theme: light")
    );
    expect(localStorage.getItem("gu-lms-theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists a newly chosen theme", async () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByRole("button"));

    expect(localStorage.getItem("gu-lms-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
