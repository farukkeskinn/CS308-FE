import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductPage from "./Productpage";
import { CartProvider } from "../../context/CartContext";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

jest.mock("axios");

const fakeProduct = {
  productId: 1,
  name: "Test Product",
  description: "This is a test product",
  image_url: "https://example.com/test.jpg",
  price: 199.99,
  quantity: 5,
  model: "TST123",
  serialNumber: "SN12345",
  warrantyStatus: 2,
  distributor: "Test Distributor",
  reviews: [],
};

const fakeRecommendedProducts = {
  content: [],
};

const Wrapper = ({ children }) => (
  <CartProvider>
    <MemoryRouter initialEntries={["/product/1"]}>
      <Routes>
        <Route path="/product/:productId" element={children} />
      </Routes>
    </MemoryRouter>
  </CartProvider>
);

describe("ProductPage Add to Cart Test", () => {
  beforeEach(() => {
    // Mock axios.get calls
    axios.get.mockImplementation((url) => {
      if (url.includes("/recommended")) {
        return Promise.resolve({ data: fakeRecommendedProducts });
      }
      if (url.includes("/details")) {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: fakeProduct });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("allows clicking the 'Add to Cart' button", async () => {
    render(<ProductPage />, { wrapper: Wrapper });

    // Wait for the "loading product details" text to disappear
    await waitFor(() =>
      expect(screen.queryByText(/loading product details/i)).not.toBeInTheDocument()
    );

    // See the product name
    expect(await screen.findByRole("heading", { name: /test product/i })).toBeInTheDocument();

    // Find the 'Add to Cart' button
    const addToCartButton = await screen.findByRole("button", { name: /add to cart/i });

    // The button should be enabled
    expect(addToCartButton).toBeEnabled();

    // Click the button
    fireEvent.click(addToCartButton);
  });
});
