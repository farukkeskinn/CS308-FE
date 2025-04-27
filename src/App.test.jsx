// src/App.test.jsx
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), 
  })
);
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  test("renders footer text", () => {
    render(<App />);
    const footerElement = screen.getByText(/Neptune\. All rights reserved\./i);
    expect(footerElement).toBeInTheDocument();
  });
});
