import { fireEvent, screen, waitFor, within } from "@testing-library/react";
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
          description: "销售支持",
          base_scene_id: "corp-default",
          system_prompt: "system prompt",
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

  expect(await screen.findByRole("button", { name: "销售助理" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "返回对话" })).toHaveAttribute("href", "/chat");
  expect(screen.getByRole("tab", { name: "概览" })).toBeInTheDocument();
  expect(screen.getByText("交互性能")).toBeInTheDocument();
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
          description: "销售支持",
          base_scene_id: "corp-default",
          system_prompt: "system prompt",
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
          description: "销售支持",
          base_scene_id: "corp-default",
          system_prompt: "system prompt",
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

  fireEvent.click(await screen.findByRole("tab", { name: "模型" }));

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

test("creates and selects a new scene from the header action", async () => {
  fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    if (url === "/api/admin/base-scenes") {
      return {
        ok: true,
        json: async () => [{ id: "corp-default", name: "企业默认场景" }]
      };
    }
    if (url === "/api/admin/scenes" && init?.method === "POST") {
      return {
        ok: true,
        json: async () => ({
          id: "scene",
          name: "新建场景 1",
          description: "新场景描述",
          base_scene_id: "corp-default",
          system_prompt: "Describe the business workflow and desired assistant behavior here.\n",
          base_url: "",
          model_name: ""
        })
      };
    }
    if (url === "/api/admin/scenes") {
      return {
        ok: true,
        json: async () => [
          { id: "sales-assistant", name: "销售助理" },
          { id: "scene", name: "新建场景 1" }
        ]
      };
    }
    if (url === "/api/admin/scenes/scene") {
      return {
        ok: true,
        json: async () => ({
          id: "scene",
          name: "新建场景 1",
          description: "新场景描述",
          base_scene_id: "corp-default",
          system_prompt: "Describe the business workflow and desired assistant behavior here.\n",
          base_url: "",
          model_name: ""
        })
      };
    }
    if (url === "/api/admin/scenes/sales-assistant") {
      return {
        ok: true,
        json: async () => ({
          id: "sales-assistant",
          name: "销售助理",
          description: "销售支持",
          base_scene_id: "corp-default",
          system_prompt: "system prompt",
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

  fireEvent.click(await screen.findByRole("button", { name: "新建场景" }));
  const modal = screen
    .getAllByLabelText("新建场景")
    .find((element) => element.tagName === "SECTION");

  expect(modal).toBeDefined();
  if (!modal) {
    throw new Error("新建场景弹窗未找到");
  }
  fireEvent.change(within(modal).getByLabelText("场景名称"), { target: { value: "新建场景 1" } });
  fireEvent.change(within(modal).getByLabelText("场景描述"), { target: { value: "新场景描述" } });
  fireEvent.change(within(modal).getByLabelText("场景 ID"), { target: { value: "scene" } });
  fireEvent.click(within(modal).getByRole("button", { name: "保存场景" }));

  await waitFor(() => {
    const createCall = fetchMock.mock.calls.find(
      ([url, init]) => url === "/api/admin/scenes" && init?.method === "POST"
    );

    expect(createCall).toBeDefined();
    const requestInit = createCall?.[1] as RequestInit | undefined;

    expect(requestInit?.method).toBe("POST");
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      base_scene_id: "corp-default",
      description: "新场景描述",
      name: "新建场景 1",
      scene_id: "scene"
    });
  });

  expect(await screen.findByRole("button", { name: "新建场景 1" })).toBeInTheDocument();
});
