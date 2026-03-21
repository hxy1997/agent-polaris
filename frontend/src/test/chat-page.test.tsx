import { render, screen } from "@testing-library/react";

import { ChatPage } from "../pages/ChatPage";

test("renders chat home state with scene title and composer", () => {
  render(<ChatPage />);

  expect(screen.getByText("Sales Assistant")).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText(/Enter a request, customer notes, or product context/i)
  ).toBeInTheDocument();
});
