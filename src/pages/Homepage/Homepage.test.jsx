import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "./Homepage";
import { CartProvider } from "../../context/CartContext";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

jest.mock("axios");

describe("HomePage Sort Functionality", () => {
  beforeEach(() => {
    axios.get.mockResolvedValueOnce({ data: [] }); 
  });

  test("opens sort menu and selects 'Price: High to Low'", async () => {
    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Find the sort button and click it
    const sortButton = screen.getByRole("button", { name: /sort/i });
    fireEvent.click(sortButton);

    // Find the 'Price: High to Low' option and check if it exists
    const highToLowOption = await screen.findByText(/Price: High to Low/i);
    expect(highToLowOption).toBeInTheDocument();

    // Click on the 'Price: High to Low' option
    fireEvent.click(highToLowOption);

    // Check if the menu has closed and the new selection is correctly displayed
    expect(screen.getByRole("button", { name: /Price: High to Low/i })).toBeInTheDocument();
  });
});
