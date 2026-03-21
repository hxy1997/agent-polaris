import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";

import { ChatPage } from "../pages/ChatPage";
import { renderWithProviders } from "./renderWithProviders";

const fetchMock = vi.fn();
const scrollIntoViewMock = vi.fn();
const scrollToMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoViewMock,
    writable: true
  });
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: scrollToMock,
    writable: true
  });
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => [{ id: "sales-assistant", name: "销售助理" }]
  });
  scrollIntoViewMock.mockReset();
  scrollToMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

test("renders chat home state with scene title and composer", async () => {
  renderWithProviders(<ChatPage />);

  expect(await screen.findByText("销售助理")).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText("输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要")
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

  await screen.findByText("销售助理");
  fireEvent.change(await screen.findByPlaceholderText("输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要"), {
    target: { value: "帮我写一封跟进邮件" }
  });
  fireEvent.click(screen.getByRole("button", { name: "发送" }));

  await waitFor(() => {
    expect(screen.getAllByText("Global model API key is not configured")).toHaveLength(1);
  });

  expect(document.querySelectorAll(".conversation__message")).toHaveLength(0);
});

test("restores the draft when sending fails", async () => {
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
        json: async () => ({ detail: "Scene model configuration is incomplete" })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<ChatPage />);

  await screen.findByText("销售助理");
  const composer = await screen.findByPlaceholderText("输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要");
  fireEvent.change(composer, {
    target: { value: "帮我整理客户需求" }
  });
  fireEvent.click(screen.getByRole("button", { name: "发送" }));

  await waitFor(() => {
    expect(screen.getByDisplayValue("帮我整理客户需求")).toBeInTheDocument();
  });

  expect(document.querySelectorAll(".conversation__message")).toHaveLength(0);
});

test("submits on Enter and allows Option+Enter for newline", async () => {
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
    if (url === "/api/chat/sessions/session-001/messages") {
      return {
        ok: true,
        json: async () => ({ session_id: "session-001", status: "accepted" })
      };
    }
    if (url === "/api/chat/sessions/session-001/stream") {
      return {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode('data: {"chunk":"已发送"}\n\n')
            );
            controller.close();
          }
        })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<ChatPage />);

  await screen.findByText("销售助理");
  const composer = await screen.findByPlaceholderText("输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要");
  expect(screen.getByText("Enter 发送，Option + Enter 换行")).toBeInTheDocument();

  fireEvent.change(composer, {
    target: { value: "第一行" }
  });
  fireEvent.keyDown(composer, {
    altKey: true,
    key: "Enter"
  });

  expect(fetchMock).not.toHaveBeenCalledWith(
    "/api/chat/sessions/session-001/messages",
    expect.anything()
  );

  fireEvent.keyDown(composer, {
    key: "Enter"
  });

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat/sessions/session-001/messages",
      expect.objectContaining({
        body: JSON.stringify({ content: "第一行", user_id: "0000" }),
        method: "POST"
      })
    );
  });
});

test("switches to docked composer layout after a conversation starts", async () => {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
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
    if (url === "/api/chat/sessions/session-001/messages") {
      return {
        ok: true,
        json: async () => ({ session_id: "session-001", status: "accepted" })
      };
    }
    if (url === "/api/chat/sessions/session-001/stream") {
      return {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"chunk":"你好"}\n\n'));
            controller.close();
          }
        })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<ChatPage />);

  await screen.findByText("销售助理");
  fireEvent.change(await screen.findByPlaceholderText("输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要"), {
    target: { value: "你好" }
  });
  fireEvent.click(screen.getByRole("button", { name: "发送" }));

  await waitFor(() => {
    expect(document.querySelectorAll(".conversation__message")).toHaveLength(2);
  });

  expect(document.querySelector(".chat-shell__dock")).not.toBeNull();
  expect(document.querySelector(".chat-shell__suggestions")).toBeNull();
});

test("scrolls to the newest message when the conversation grows", async () => {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
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
    if (url === "/api/chat/sessions/session-001/messages") {
      return {
        ok: true,
        json: async () => ({ session_id: "session-001", status: "accepted" })
      };
    }
    if (url === "/api/chat/sessions/session-001/stream") {
      return {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"chunk":"第一段"}\n\n'));
            controller.enqueue(new TextEncoder().encode('data: {"chunk":"第二段"}\n\n'));
            controller.close();
          }
        })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<ChatPage />);

  await screen.findByText("销售助理");
  fireEvent.change(await screen.findByPlaceholderText("输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要"), {
    target: { value: "继续" }
  });
  fireEvent.click(screen.getByRole("button", { name: "发送" }));

  await waitFor(() => {
    expect(document.querySelectorAll(".conversation__message")).toHaveLength(2);
  });

  expect(scrollToMock).toHaveBeenCalled();
});

test("renders assistant replies as markdown", async () => {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
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
    if (url === "/api/chat/sessions/session-001/messages") {
      return {
        ok: true,
        json: async () => ({ session_id: "session-001", status: "accepted" })
      };
    }
    if (url === "/api/chat/sessions/session-001/stream") {
      return {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(
                'data: {"chunk":"# 标题\\n\\n---\\n\\n- 第一项\\n- **第二项**"}\n\n'
              )
            );
            controller.close();
          }
        })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<ChatPage />);

  await screen.findByText("销售助理");
  fireEvent.change(await screen.findByPlaceholderText("输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要"), {
    target: { value: "给我一段 markdown" }
  });
  fireEvent.click(screen.getByRole("button", { name: "发送" }));

  expect(await screen.findByRole("heading", { name: "标题" })).toBeInTheDocument();
  expect(screen.getByRole("separator")).toBeInTheDocument();
  expect(screen.getByText("第二项").tagName).toBe("STRONG");
});

test("starts a new session from the rail", async () => {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
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
    if (url === "/api/chat/sessions/session-001/messages") {
      return {
        ok: true,
        json: async () => ({ session_id: "session-001", status: "accepted" })
      };
    }
    if (url === "/api/chat/sessions/session-001/stream") {
      return {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"chunk":"你好"}\n\n'));
            controller.close();
          }
        })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<ChatPage />);

  await screen.findByText("销售助理");
  fireEvent.change(await screen.findByPlaceholderText("输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要"), {
    target: { value: "你好" }
  });
  fireEvent.click(screen.getByRole("button", { name: "发送" }));

  await waitFor(() => {
    expect(document.querySelectorAll(".conversation__message")).toHaveLength(2);
  });

  fireEvent.click(screen.getByRole("button", { name: "新会话" }));

  await waitFor(() => {
    expect(document.querySelectorAll(".conversation__message")).toHaveLength(0);
  });

  expect(screen.getByText("从一个需求、一段客户笔记或一份会议纪要开始。")).toBeInTheDocument();
});

test("restores a previous conversation from history", async () => {
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
        ok: true,
        json: async () => ({ session_id: "session-001", status: "accepted" })
      };
    }
    if (url === "/api/chat/sessions/session-001/stream") {
      return {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"chunk":"已归档"}\n\n'));
            controller.close();
          }
        })
      };
    }
    if (url === "/api/chat/history?scene_id=sales-assistant&user_id=0000") {
      return {
        ok: true,
        json: async () => [
          {
            session_id: "session-001",
            scene_id: "sales-assistant",
            user_id: "0000",
            title: "跟进 ACME 客户",
            created_at: "2026-03-21T12:00:00+00:00",
            updated_at: "2026-03-21T12:01:00+00:00"
          }
        ]
      };
    }
    if (url === "/api/chat/sessions/session-001/messages?user_id=0000") {
      return {
        ok: true,
        json: async () => ({
          session_id: "session-001",
          scene_id: "sales-assistant",
          user_id: "0000",
          messages: [
            { role: "user", content: "跟进 ACME 客户" },
            { role: "assistant", content: "已归档" }
          ]
        })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<ChatPage />);

  await screen.findByText("销售助理");
  fireEvent.change(await screen.findByPlaceholderText("输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要"), {
    target: { value: "跟进 ACME 客户" }
  });
  fireEvent.click(screen.getByRole("button", { name: "发送" }));

  await waitFor(() => {
    expect(screen.getByText("跟进 ACME 客户")).toBeInTheDocument();
    expect(screen.getByText("已归档")).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole("button", { name: "新会话" }));
  fireEvent.click(screen.getByRole("button", { name: "历史会话" }));
  fireEvent.click(await screen.findByRole("button", { name: /跟进 ACME 客户/ }));

  await waitFor(() => {
    expect(screen.getByText("跟进 ACME 客户")).toBeInTheDocument();
    expect(screen.getByText("已归档")).toBeInTheDocument();
  });
});
