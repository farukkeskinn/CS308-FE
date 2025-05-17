import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CssBaseline,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
    error: { main: "#f44336" },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: "bold" },
  },
});

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/product-managers/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleDelete = (productId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (confirmDelete) {
      axios
        .delete(`http://localhost:8080/api/product-managers/products/${productId}`)
        .then(() => {
          setProducts(products.filter((p) => p.productId !== productId));
        })
        .catch((err) => console.error("Error deleting product:", err));
    }
  };

  const handleUpdateStock = (product) => {
    const newQuantity = window.prompt(`Update Stock:\nCurrent quantity: ${product.quantity}\nEnter new quantity:`);
    if (newQuantity !== null && newQuantity.trim() !== "" && !isNaN(newQuantity)) {
      axios
        .patch(`http://localhost:8080/api/product-managers/products/${product.productId}/stock`, null, {
          params: { quantity: newQuantity },
        })
        .then((res) => {
          setProducts(products.map((p) => (p.productId === product.productId ? res.data : p)));
        })
        .catch((err) => console.error("Error updating stock:", err));
    }
  };

  const handleChangeCategory = (product) => {
    const newCategoryId = window.prompt("Enter new category ID:");
    if (newCategoryId !== null && newCategoryId.trim() !== "" && !isNaN(newCategoryId)) {
      axios
        .put(`http://localhost:8080/api/products/${product.productId}/category/${newCategoryId}`)
        .then((res) => {
          setProducts(products.map((p) => (p.productId === product.productId ? res.data : p)));
        })
        .catch((err) => {
          console.error("Error updating category:", err);
          alert("Failed to change category.");
        });
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box p={4} sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom>
          Product Manager Dashboard
        </Typography>

        <Box mb={3} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button variant="contained" color="primary" onClick={() => navigate("/productdashboard/new-product")}>
            Add New Product
          </Button>
          <Button variant="contained" color="error" onClick={() => navigate("/productdashboard/categories")}>
            Manage Categories
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/productdashboard/reviews")}>
            Manage Reviews
          </Button>
          <Button variant="contained" color="info" onClick={() => navigate("/productdashboard/manage-orders")}>
            Manage Orders
          </Button>
          <Button variant="contained" color="success" onClick={() => navigate("/productdashboard/deliveries")}>
            Delivered Items
          </Button>
        </Box>

        {loadingProducts ? (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#333" }}>
                <TableRow>
                  <TableCell sx={{ color: "#f1f1f1" }}>Product ID</TableCell>
                  <TableCell sx={{ color: "#f1f1f1" }}>Name</TableCell>
                  <TableCell sx={{ color: "#f1f1f1" }}>Price</TableCell>
                  <TableCell sx={{ color: "#f1f1f1" }}>Quantity</TableCell>
                  <TableCell sx={{ color: "#f1f1f1" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.productId}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#2a2a2a",
                        transition: "background-color 0.3s",
                      },
                    }}
                  >
                    <TableCell sx={{ color: "#ccc" }}>{product.productId}</TableCell>
                    <TableCell sx={{ color: "#eee" }}>{product.name}</TableCell>
                    <TableCell sx={{ color: "#eee" }}>${product.price}</TableCell>
                    <TableCell sx={{ color: "#eee" }}>{product.quantity}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(product.productId)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleUpdateStock(product)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Update Stock
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleChangeCategory(product)}
                        size="small"
                      >
                        Change Category
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default ProductDashboard;
