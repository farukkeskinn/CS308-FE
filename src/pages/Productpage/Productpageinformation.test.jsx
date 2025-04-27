import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductPage from "./Productpage";
import { CartProvider } from "../../context/CartContext";
import axios from "axios";

jest.mock("axios");

describe("ProductPage", () => {
  test("renders product detail fields correctly", async () => {
    const mockProduct = {
      productId: 1,
      name: "Test Product",
      description: "Test description",
      price: 299.99,
      image_url: "https://example.com/test.jpg",
      quantity: 3,
      reviews: [],
      model: "TP-200",
      serialNumber: "SN-000123",
      warrantyStatus: 1,
      distributor: "TestCorp",
    };

    axios.get
      .mockResolvedValueOnce({ data: mockProduct }) // /products/:id
      .mockResolvedValueOnce({})                    // /products/:id/details
      .mockResolvedValueOnce({ data: { content: [] } }); // /products/:id/recommended

    render(
      <CartProvider>
        <MemoryRouter initialEntries={["/product/1"]}>
          <Routes>
            <Route path="/product/:productId" element={<ProductPage />} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    );

    // Check if the product details are present in the DOM
    await waitFor(() => {
      expect(screen.getByText("TP-200")).toBeInTheDocument(); // Model
      expect(screen.getByText("SN-000123")).toBeInTheDocument(); // Serial Number
      expect(screen.getByText(/3\s+Available/i)).toBeInTheDocument(); // Stock
      expect(screen.getByText(/1\s+Years/i)).toBeInTheDocument(); // Warranty
      expect(screen.getByText("TestCorp")).toBeInTheDocument(); // Distributor
    });
  });
});
