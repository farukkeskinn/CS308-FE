import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductPage from "./Productpage";
import { CartProvider } from "../../context/CartContext";
import axios from "axios";

jest.mock("axios");

describe("ProductPage - Comment and Rating Section", () => {
  test("shows rating breakdown and customer reviews after toggling", async () => {
    const mockProduct = {
      productId: 1,
      name: "Mock Product",
      description: "Test Description",
      price: 299.99,
      image_url: "mock.jpg",
      quantity: 10,
      model: "MP-200",
      serialNumber: "XYZ123",
      warrantyStatus: 1,
      distributor: "Neptune Inc.",
      reviews: [
        { rating: 5, comment: "Excellent!", approvalStatus: "approved" },
        { rating: 4, comment: "Good", approvalStatus: "approved" },
        { rating: 3, comment: "Average", approvalStatus: "rejected" }, // should be ignored
      ],
    };

    const mockRecommended = { content: [] };

    axios.get
      .mockResolvedValueOnce({ data: mockProduct }) // /products/:id
      .mockResolvedValueOnce({})                    // /products/:id/details
      .mockResolvedValueOnce({ data: mockRecommended });

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

    // After product is loaded, check the name
    await waitFor(() => {
      expect(screen.getByText(/mock product/i)).toBeInTheDocument();
    });

    // Toggle to open reviews
    const toggleButton = screen.getByTestId("toggle-reviews");
    fireEvent.click(toggleButton);

    // The review title should appear
    await waitFor(() => {
      expect(screen.getByText(/customer reviews/i)).toBeInTheDocument();
      expect(screen.getByText(/excellent/i)).toBeInTheDocument();
      expect(screen.getByText(/good/i)).toBeInTheDocument();
      expect(screen.queryByText(/average/i)).not.toBeInTheDocument(); // average should be ignored
    });

    // Check if the rating breakdown title is visible
    expect(screen.getByText(/rating breakdown/i)).toBeInTheDocument();
  });
});
