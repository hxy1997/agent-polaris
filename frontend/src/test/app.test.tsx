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

  expect(await screen.findByRole("heading", { level: 1, name: "Polaris" })).toBeInTheDocument();
  expect(screen.getByText("内部智能体平台")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "对话" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "管理台" })).toBeInTheDocument();
});
