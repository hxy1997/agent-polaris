import { screen } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";

import { AdminPage } from "../pages/AdminPage";
import { renderWithProviders } from "./renderWithProviders";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
    const url = input.toString();
    if (url === "/api/admin/base-scenes") {
      return {
        ok: true,
        json: async () => [{ id: "corp-default", name: "Corporate Default" }]
      };
    }

    return {
      ok: true,
      json: async () => [{ id: "sales-assistant", name: "Sales Assistant" }]
    };
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

test("renders admin page with scene list and tabs", async () => {
  renderWithProviders(<AdminPage />);

  expect(await screen.findByText(/Base Scenes/i)).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Prompt" })).toBeInTheDocument();
});
