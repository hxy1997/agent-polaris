import type { ReactElement } from "react";

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
    element: <ChatPage />,
    navLabel: "Chat"
  },
  {
    path: "/chat",
    element: <ChatPage />,
    navLabel: "Chat"
  },
  {
    path: "/admin",
    element: <PlaceholderPage title="Admin" />,
    navLabel: "Admin"
  }
];
