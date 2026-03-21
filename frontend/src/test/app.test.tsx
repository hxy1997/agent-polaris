import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";

import { App } from "../App";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => [{ id: "sales-assistant", name: "Sales Assistant" }]
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

test("renders route shell", async () => {
  render(<App />);

  expect(await screen.findByRole("heading", { level: 1, name: "Polaris" })).toBeInTheDocument();
});
