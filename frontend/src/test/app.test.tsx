import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";

import { App } from "../App";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => [{ id: "sales-assistant", name: "销售助理" }]
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

test("renders route shell", async () => {
  render(<App />);

  expect(await screen.findByText("Polaris")).toBeInTheDocument();
  expect(screen.getByText("对话模式")).toBeInTheDocument();
  expect(screen.getAllByText("管理后台").length).toBeGreaterThan(0);
});
