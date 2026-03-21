import { fireEvent, screen, waitFor } from "@testing-library/react";
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
        json: async () => [{ id: "corp-default", name: "企业默认场景" }]
      };
    }
    if (url === "/api/admin/scenes/sales-assistant") {
      return {
        ok: true,
        json: async () => ({
          id: "sales-assistant",
          name: "销售助理",
          base_url: "https://openrouter.ai/api/v1",
          model_name: "openai/gpt-4.1-mini"
        })
      };
    }

    return {
      ok: true,
      json: async () => [{ id: "sales-assistant", name: "销售助理" }]
    };
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

test("renders admin page with scene list and tabs", async () => {
  renderWithProviders(<AdminPage />);

  expect(await screen.findByText("基础场景")).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "模型配置" })).toBeInTheDocument();
});


test("allows editing and saving scene model settings", async () => {
  fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    if (url === "/api/admin/base-scenes") {
      return {
        ok: true,
        json: async () => [{ id: "corp-default", name: "企业默认场景" }]
      };
    }
    if (url === "/api/admin/scenes") {
      return {
        ok: true,
        json: async () => [{ id: "sales-assistant", name: "销售助理" }]
      };
    }
    if (url === "/api/admin/scenes/sales-assistant" && init?.method === "PUT") {
      return {
        ok: true,
        json: async () => ({
          id: "sales-assistant",
          name: "销售助理",
          base_url: "https://api.openai.com/v1",
          model_name: "gpt-4.1-mini"
        })
      };
    }
    if (url === "/api/admin/scenes/sales-assistant") {
      return {
        ok: true,
        json: async () => ({
          id: "sales-assistant",
          name: "销售助理",
          base_url: "https://openrouter.ai/api/v1",
          model_name: "openai/gpt-4.1-mini"
        })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<AdminPage />);

  const baseUrlInput = await screen.findByDisplayValue("https://openrouter.ai/api/v1");
  const modelNameInput = screen.getByDisplayValue("openai/gpt-4.1-mini");
  const saveButton = screen.getByRole("button", { name: "保存模型配置" });

  fireEvent.change(baseUrlInput, { target: { value: "https://api.openai.com/v1" } });
  fireEvent.change(modelNameInput, { target: { value: "gpt-4.1-mini" } });
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/scenes/sales-assistant",
      expect.objectContaining({
        body: JSON.stringify({
          base_url: "https://api.openai.com/v1",
          model_name: "gpt-4.1-mini"
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "PUT"
      })
    );
  });
});
