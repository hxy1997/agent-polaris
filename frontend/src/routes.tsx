import type { ReactElement } from "react";

import { AdminPage } from "./pages/AdminPage";
import { ChatPage } from "./pages/ChatPage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section>
      <h2>{title}</h2>
    </section>
  );
}

type AppRoute = {
  path: string;
  element: ReactElement;
  navLabel?: string;
};

export const routes: AppRoute[] = [
  {
    path: "/",
    element: <ChatPage />
  },
  {
    path: "/chat",
    element: <ChatPage />,
    navLabel: "对话"
  },
  {
    path: "/admin",
    element: <AdminPage />,
    navLabel: "管理台"
  }
];
