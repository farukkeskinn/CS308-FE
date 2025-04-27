import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'; 
import WelcomeMessage from "./WelcomeMessage";

describe("WelcomeMessage", () => {
  test("renders welcome text", () => {
    render(<WelcomeMessage />);
    const heading = screen.getByText("Welcome to Neptune!");
    expect(heading).toBeInTheDocument();
  });
});
