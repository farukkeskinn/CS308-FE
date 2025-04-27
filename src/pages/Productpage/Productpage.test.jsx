import React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductPage from "./Productpage";
import axios from "axios";
import { CartProvider } from "../../context/CartContext";

jest.mock("axios");

describe("ProductPage", () => {
  test("shows loading text initially and renders product", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          productId: 1,
          name: "Test Product",
          description: "This is a sample product.",
          image_url: "https://example.com/image.jpg",
          quantity: 10,
          price: 199.99,
          reviews: [],
          model: "X2025",
          serialNumber: "SN123456",
          warrantyStatus: 2,
          distributor: "Neptune Inc.",
        },
      }) // product
      .mockResolvedValueOnce({}) // product details (even if unused)
      .mockResolvedValueOnce({ data: { content: [] } });

    render(
      <CartProvider>
        <MemoryRouter initialEntries={["/product/1"]}>
          <Routes>
            <Route path="/product/:productId" element={<ProductPage />} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    );

    // "Loading" text should appear
    expect(screen.getByText(/loading product details/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });
});
