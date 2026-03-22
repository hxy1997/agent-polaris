import { fireEvent, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, test, vi } from "vitest";

import { AdminPage } from "../pages/AdminPage";
import { renderWithProviders } from "./renderWithProviders";

type MockSkillNode = {
  id: string;
  name: string;
  path: string;
  node_type: "directory" | "file";
  source: "base" | "scene";
  is_read_only: boolean;
  is_overridden: boolean;
  is_skill_root: boolean;
  children: MockSkillNode[];
};

vi.mock("@monaco-editor/react", () => ({
  default: ({ value }: { value: string }) => <div data-testid="monaco-editor">{value}</div>
}));

vi.mock("react-arborist", () => ({
  Tree: ({
    children,
    data
  }: {
    children: (props: { node: { data: unknown; isSelected: boolean; isOpen: boolean; isInternal: boolean; level: number; toggle: () => void }; style: object; dragHandle: null }) => ReactNode;
    data: MockSkillNode[];
  }) => {
    function renderNode(node: MockSkillNode, level: number) {
      return (
        <div key={node.id}>
          {children({
            dragHandle: null,
            node: {
              data: node,
              isInternal: node.node_type === "directory",
              isOpen: true,
              isSelected: false,
              level,
              toggle: () => {}
            },
            style: {}
          })}
          {node.children.map((child) => renderNode(child, level + 1))}
        </div>
      );
    }

    return <div>{data.map((node) => renderNode(node, 0))}</div>;
  }
}));

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
        json: async () => ({
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
            }
          ]
        })
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
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

test("loads skill tree and previews selected file content", async () => {
  renderWithProviders(<AdminPage />);

  fireEvent.click(await screen.findByRole("tab", { name: "Skills" }));

  expect(await screen.findByText("reply-draft")).toBeInTheDocument();

  fireEvent.click(screen.getByText("SKILL.md"));

  await waitFor(() => {
    expect(screen.getByText("# reply-draft")).toBeInTheDocument();
  });
});
