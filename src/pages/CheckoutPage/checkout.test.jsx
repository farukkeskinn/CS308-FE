import React from "react";
import { render, screen } from "@testing-library/react";
import Checkout from "./CheckoutPage";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "../../context/CartContext";


const renderWithProviders = (ui) => {
  return render(
    <CartProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </CartProvider>
  );
};

describe("Checkout Page", () => {
  test("renders address name field", () => {
    renderWithProviders(<Checkout />);
    const addressInput = screen.getByLabelText(/address name/i);
    expect(addressInput).toBeInTheDocument();
  });
});
