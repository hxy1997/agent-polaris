import type { ReactElement } from "react";

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
    element: <PlaceholderPage title="Chat" />,
    navLabel: "Chat"
  },
  {
    path: "/chat",
    element: <PlaceholderPage title="Chat" />,
    navLabel: "Chat"
  },
  {
    path: "/admin",
    element: <PlaceholderPage title="Admin" />,
    navLabel: "Admin"
  }
];
