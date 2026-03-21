import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";

import { routes } from "./routes";
import "./styles/app.css";

const queryClient = new QueryClient();

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div>
          <p className="app-shell__eyebrow">Internal agent platform</p>
          <h1>Polaris</h1>
        </div>
        <nav className="app-shell__nav" aria-label="Primary">
          {routes
            .filter((route) => route.navLabel)
            .map((route) => (
              <Link key={route.path} to={route.path}>
                {route.navLabel}
              </Link>
            ))}
        </nav>
      </header>
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
