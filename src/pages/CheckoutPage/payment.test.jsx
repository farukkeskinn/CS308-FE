import React from "react";
import { render, screen } from "@testing-library/react";
import Checkout from "./CheckoutPage";
import { CartProvider } from "../../context/CartContext";
import { BrowserRouter } from "react-router-dom";

describe("Checkout - Order Summary Total", () => {
  test("displays the correct total price", () => {
    const mockCart = [
      { productId: 1, name: "Laptop", price: 1000, quantity: 1 },
      { productId: 2, name: "Mouse", price: 50, quantity: 2 },
      { productId: 3, name: "Keyboard", price: 150, quantity: 1 },
    ];
    localStorage.setItem("shoppingCart", JSON.stringify(mockCart));

    render(
      <CartProvider>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </CartProvider>
    );

    const expectedTotal = (1000 + 100 + 150).toFixed(2); // 1250.00

    const totalRegex = new RegExp(`\\$${expectedTotal}`);
    const totalElement = screen.getByText(totalRegex);

    expect(totalElement).toBeInTheDocument();
  });
});
