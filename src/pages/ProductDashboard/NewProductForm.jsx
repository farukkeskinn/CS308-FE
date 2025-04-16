import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewProductForm = () => {
  const [product, setProduct] = useState({
    name: "",
    model: "",
    description: "",
    price: "",
    cost: "",
    serialNumber: "",
    quantity: "",
    warranty_status: "",
    distributor: "",
    image_url: "",
    // Assuming category is an object with only categoryId for selection.
    category: { categoryId: "" }
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For nested object category, we handle separately.
    if (name === "categoryId") {
      setProduct({ ...product, category: { categoryId: value } });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:8080/api/product-managers/products", product)
      .then(() => navigate("/productdashboard"))
      .catch(err => console.error("Error creating product:", err));
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Add New Product
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={product.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Model"
          name="model"
          value={product.model}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={product.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Price"
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Cost"
          name="cost"
          type="number"
          value={product.cost}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Serial Number"
          name="serialNumber"
          value={product.serialNumber}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          value={product.quantity}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Warranty (months)"
          name="warranty_status"
          type="number"
          value={product.warranty_status}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Distributor"
          name="distributor"
          value={product.distributor}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Image URL"
          name="image_url"
          value={product.image_url}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Category ID"
          name="categoryId"
          type="number"
          value={product.category.categoryId}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Create Product
        </Button>
      </form>
    </Box>
  );
};

export default NewProductForm;
