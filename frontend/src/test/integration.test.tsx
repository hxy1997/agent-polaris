import { screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { ChatPage } from "../pages/ChatPage";
import { renderWithProviders } from "./renderWithProviders";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

test("loads available scenes from the API", async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => [{ id: "sales-assistant", name: "销售助理" }]
  });

  renderWithProviders(<ChatPage />);

  expect(await screen.findByText("销售助理")).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith("/api/chat/scenes", undefined);
});
