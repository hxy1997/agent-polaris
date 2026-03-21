import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";

import { ChatPage } from "../pages/ChatPage";
import { renderWithProviders } from "./renderWithProviders";

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

test("renders chat home state with scene title and composer", async () => {
  renderWithProviders(<ChatPage />);

  expect(await screen.findByText("销售助理")).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText("输入请求、客户笔记或产品背景")
  ).toBeInTheDocument();
  expect(screen.getByText("从一个需求、一段客户笔记或一份会议纪要开始。")).toBeInTheDocument();
});


test("shows backend configuration errors when sending a message fails", async () => {
  fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    if (url === "/api/chat/scenes") {
      return {
        ok: true,
        json: async () => [{ id: "sales-assistant", name: "销售助理" }]
      };
    }
    if (url === "/api/chat/sessions") {
      return {
        ok: true,
        json: async () => ({ session_id: "session-001", scene_id: "sales-assistant" })
      };
    }
    if (url === "/api/chat/sessions/session-001/messages" && init?.method === "POST") {
      return {
        ok: false,
        json: async () => ({ detail: "Global model API key is not configured" })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<ChatPage />);

  fireEvent.change(await screen.findByPlaceholderText("输入请求、客户笔记或产品背景"), {
    target: { value: "帮我写一封跟进邮件" }
  });
  fireEvent.click(screen.getByRole("button", { name: "发送" }));

  await waitFor(() => {
    expect(screen.getAllByText("Global model API key is not configured").length).toBeGreaterThan(0);
  });
});
