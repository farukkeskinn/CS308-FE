import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Button
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Product Manager Dashboard
      </Typography>

      {/* Action Buttons for Product Management */}
      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/productdashboard/new-product")}
          style={{ marginRight: '1rem' }}
        >
          Add New Product
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => navigate("/productdashboard/categories")}
        >
          Manage Categories
        </Button>
      </Box>

      {loadingProducts ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.productId}>
                  <TableCell>{product.productId}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(product.productId)}
                      size="small"
                      style={{ marginRight: '0.5rem' }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleUpdateStock(product)}
                      size="small"
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
  );
};

export default ProductDashboard;
