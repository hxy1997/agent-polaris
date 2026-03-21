import { render, screen } from "@testing-library/react";

import { AdminPage } from "../pages/AdminPage";

test("renders admin page with scene list and tabs", () => {
  render(<AdminPage />);

  expect(screen.getByText(/Base Scenes/i)).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Prompt" })).toBeInTheDocument();
});
