import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define a custom dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark", // Set the theme mode to dark
    primary: {
      main: "#1976d2", // Customize primary color
    },
    secondary: {
      main: "#9c27b0", // Customize secondary color
    },
    background: {
      default: "#121212", // Background color for the page
      paper: "#1c1c1c", // Background color for Paper component
    },
    error: {
      main: "#f44336", // Customize error color
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: "bold", // Customize heading styles
    },
  },
});


const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  // Fetch products from the backend API
  useEffect(() => {
    axios.get("http://localhost:8080/api/product-managers/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Delete product with confirmation popup
  const handleDelete = (productId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (confirmDelete) {
      axios.delete(`http://localhost:8080/api/product-managers/products/${productId}`)
        .then(() => {
          setProducts(products.filter(product => product.productId !== productId));
        })
        .catch(err => console.error("Error deleting product:", err));
    }
  };

  // Update stock with a popup to show old quantity and ask for new quantity
  const handleUpdateStock = (product) => {
    const newQuantity = window.prompt("Update Stock:\nCurrent quantity: " + product.quantity + "\nEnter new quantity:");
    if (newQuantity !== null && newQuantity.trim() !== "" && !isNaN(newQuantity)) {
      axios.patch(`http://localhost:8080/api/product-managers/products/${product.productId}/stock`, null, {
        params: { quantity: newQuantity }
      })
      .then(res => {
        setProducts(products.map(p => (p.productId === product.productId ? res.data : p)));
      })
      .catch(err => console.error("Error updating stock:", err));
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* This line ensures the dark theme is applied */}
      <Box p={4} sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Product Manager Dashboard
        </Typography>

        {/* Action Buttons for Product Management */}
        <Box
          mb={2}
          sx={{
            display: "flex",
            gap: 2,                // 16px gap between every button
            flexWrap: "wrap",      
            mb: 3,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/productdashboard/new-product")}
            sx={{ boxShadow: 3, '&:hover': { boxShadow: 6 } }}
          >
            Add New Product
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => navigate("/productdashboard/categories")}
            sx={{ boxShadow: 3, '&:hover': { boxShadow: 6 } }}
          >
            Manage Categories
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/productdashboard/reviews")}
            sx={{ boxShadow: 3, '&:hover': { boxShadow: 6 } }}
          >
            Manage Reviews
          </Button>

          <Button
            variant="contained"
            color="info"
            onClick={() => navigate("/productdashboard/manage-orders")}
            sx={{ boxShadow: 3, '&:hover': { boxShadow: 6 } }}
          >
            Manage Orders
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
                <TableCell sx={{ color: "#f1f1f1" }}>Product ID</TableCell>  {/* Darker header text */}
                <TableCell sx={{ color: "#f1f1f1" }}>Name</TableCell>
                <TableCell sx={{ color: "#f1f1f1" }}>Price</TableCell>
                <TableCell sx={{ color: "#f1f1f1" }}>Quantity</TableCell>
                <TableCell sx={{ color: "#f1f1f1" }}>Actions</TableCell>
              </TableRow>
              </TableHead>
              <TableBody>
                {products.map(product => (
                  <TableRow 
                    key={product.productId} 
                    sx={{
                      '&:hover': { 
                        backgroundColor: "#333", // Darker hover effect instead of white
                        transition: 'background-color 0.3s', 
                      },
                    }}
                  >
                    <TableCell sx={{ color: "#e0e0e0" }}>{product.productId}</TableCell> 
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(product.productId)}
                        size="small"
                        sx={{ marginRight: '0.5rem', boxShadow: 2, '&:hover': { boxShadow: 5 } }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleUpdateStock(product)}
                        size="small"
                        sx={{ boxShadow: 2, '&:hover': { boxShadow: 5 } }}
                      >
                        Update Stock
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
