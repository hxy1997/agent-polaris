import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";

import { AdminPage } from "../pages/AdminPage";
import { renderWithProviders } from "./renderWithProviders";

function buildSkillTreeResponse(includeUploaded = false) {
  return {
    nodes: [
      {
        id: "scene:reply-draft",
        name: "reply-draft",
        path: "reply-draft",
        node_type: "directory",
        source: "scene",
        is_read_only: false,
        is_overridden: false,
        is_skill_root: true,
        children: [
          {
            id: "scene:reply-draft/SKILL.md",
            name: "SKILL.md",
            path: "reply-draft/SKILL.md",
            node_type: "file",
            source: "scene",
            is_read_only: false,
            is_overridden: false,
            is_skill_root: false,
            children: []
          }
        ]
      },
      ...(includeUploaded
        ? [
            {
              id: "scene:uploaded-skill",
              name: "uploaded-skill",
              path: "uploaded-skill",
              node_type: "directory",
              source: "scene",
              is_read_only: false,
              is_overridden: false,
              is_skill_root: true,
              children: [
                {
                  id: "scene:uploaded-skill/SKILL.md",
                  name: "SKILL.md",
                  path: "uploaded-skill/SKILL.md",
                  node_type: "file",
                  source: "scene",
                  is_read_only: false,
                  is_overridden: false,
                  is_skill_root: false,
                  children: []
                }
              ]
            }
          ]
        : [])
    ]
  };
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

test("toggles directories and previews selected file content", async () => {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
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

    if (url === "/api/admin/scenes/sales-assistant/skills/tree") {
      return {
        ok: true,
        json: async () => buildSkillTreeResponse()
      };
    }

    if (url === "/api/admin/scenes/sales-assistant/skills/file?path=reply-draft%2FSKILL.md&source=scene") {
      return {
        ok: true,
        json: async () => ({
          path: "reply-draft/SKILL.md",
          name: "SKILL.md",
          source: "scene",
          content: "# reply-draft",
          is_read_only: false
        })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<AdminPage />);

  fireEvent.click(await screen.findByRole("tab", { name: "Skills" }));

  expect(await screen.findByText("reply-draft")).toBeInTheDocument();
  expect(screen.getByText("SKILL.md")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /reply-draft/i }));
  await waitFor(() => {
    expect(screen.queryByText("SKILL.md")).toBeNull();
  });

  fireEvent.click(screen.getByRole("button", { name: /reply-draft/i }));
  expect(await screen.findByText("SKILL.md")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /SKILL\.md/i }));

  await waitFor(() => {
    expect(screen.getByText("# reply-draft")).toBeInTheDocument();
  });
});

test("uploads a skill directory with multipart form data", async () => {
  let includeUploaded = false;

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

    if (url === "/api/admin/scenes/sales-assistant/skills/tree") {
      return {
        ok: true,
        json: async () => buildSkillTreeResponse(includeUploaded)
      };
    }

    if (url === "/api/admin/scenes/sales-assistant/skills/upload" && init?.method === "POST") {
      includeUploaded = true;
      return {
        ok: true,
        json: async () => buildSkillTreeResponse(true)
      };
    }

    if (url === "/api/admin/scenes/sales-assistant/skills/file?path=reply-draft%2FSKILL.md&source=scene") {
      return {
        ok: true,
        json: async () => ({
          path: "reply-draft/SKILL.md",
          name: "SKILL.md",
          source: "scene",
          content: "# reply-draft",
          is_read_only: false
        })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<AdminPage />);

  fireEvent.click(await screen.findByRole("tab", { name: "Skills" }));
  expect(screen.getByRole("button", { name: "上传技能目录" })).toBeInTheDocument();

  const uploadInput = document.querySelector('input[type="file"]');
  if (!(uploadInput instanceof HTMLInputElement)) {
    throw new Error("上传输入框未找到");
  }

  const skillFile = new File(["# uploaded"], "SKILL.md", { type: "text/markdown" });
  Object.defineProperty(skillFile, "webkitRelativePath", {
    value: "uploaded-skill/SKILL.md"
  });

  fireEvent.change(uploadInput, {
    target: {
      files: [skillFile]
    }
  });

  await waitFor(() => {
    const uploadCall = fetchMock.mock.calls.find(
      ([url, init]) => url === "/api/admin/scenes/sales-assistant/skills/upload" && init?.method === "POST"
    );

    expect(uploadCall).toBeDefined();
    if (!uploadCall) {
      return;
    }

    const body = uploadCall[1]?.body;
    expect(body).toBeInstanceOf(FormData);

    const formData = body as FormData;
    expect(formData.get("folder_name")).toBe("uploaded-skill");
    expect(formData.getAll("paths")).toEqual(["SKILL.md"]);
  });
});

test("deletes the selected scene skill root", async () => {
  vi.stubGlobal("confirm", vi.fn(() => true));

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

    if (url === "/api/admin/scenes/sales-assistant/skills/tree") {
      return {
        ok: true,
        json: async () => buildSkillTreeResponse()
      };
    }

    if (url === "/api/admin/scenes/sales-assistant/skills/file?path=reply-draft%2FSKILL.md&source=scene") {
      return {
        ok: true,
        json: async () => ({
          path: "reply-draft/SKILL.md",
          name: "SKILL.md",
          source: "scene",
          content: "# reply-draft",
          is_read_only: false
        })
      };
    }

    if (url === "/api/admin/scenes/sales-assistant/skills/node?path=reply-draft" && init?.method === "DELETE") {
      return {
        ok: true,
        json: async () => ({ nodes: [] })
      };
    }

    return {
      ok: true,
      json: async () => []
    };
  });

  renderWithProviders(<AdminPage />);

  fireEvent.click(await screen.findByRole("tab", { name: "Skills" }));
  fireEvent.click(screen.getByRole("button", { name: "删除技能 reply-draft" }));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/scenes/sales-assistant/skills/node?path=reply-draft",
      expect.objectContaining({ method: "DELETE" })
    );
  });
});
