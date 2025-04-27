import React from "react";
import { render, screen } from "@testing-library/react";
import { CartProvider } from "../../context/CartContext";
import Checkout from "./CheckoutPage";
import { BrowserRouter } from "react-router-dom";

// Wrapper to provide CartContext and BrowserRouter
function CartProviderWrapper({ children }) {
  return (
    <CartProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </CartProvider>
  );
}

test("renders correct products in Order Summary", () => {
  
  const dummyCartItems = [
    { productId: 1, name: "Product A", quantity: 2, price: 300 },
    { productId: 2, name: "Product B", quantity: 1, price: 450 },
  ];
  localStorage.setItem("shoppingCart", JSON.stringify(dummyCartItems));

  // Render the Checkout page with the wrapper
  render(<Checkout />, { wrapper: CartProviderWrapper });

  // Check that product names and quantities are displayed
  expect(screen.getByText(/Product A x 2/i)).toBeInTheDocument();
  expect(screen.getByText(/Product B x 1/i)).toBeInTheDocument();

  // Check that the calculated prices are displayed
  expect(screen.getByText(/\$600\.00/i)).toBeInTheDocument(); // 2 * 300
  expect(screen.getByText(/\$450\.00/i)).toBeInTheDocument(); // 1 * 450
});
