import { render, screen } from "@testing-library/react";

import { App } from "../App";

test("renders route shell", () => {
  render(<App />);

  expect(screen.getByText(/Polaris/i)).toBeInTheDocument();
});
