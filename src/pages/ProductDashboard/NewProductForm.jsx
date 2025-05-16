import React, { useState } from "react";
import { Box, TextField, Button, Typography, Alert, Paper } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewProductForm = () => {
  const [product, setProduct] = useState({
    name: "",
    model: "",
    description: "",
    cost: "",
    serialNumber: "",
    quantity: "",
    warranty_status: "",
    distributor: "",
    image_url: "",
    categoryId: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Create form data object
    const formData = new FormData();

    // Add product fields to form data
    formData.append("name", product.name);
    formData.append("model", product.model);
    formData.append("description", product.description);
    formData.append("cost", product.cost ? product.cost : "");
    formData.append("serialNumber", product.serialNumber);
    formData.append("quantity", product.quantity ? product.quantity : "");
    formData.append("warranty_status", product.warranty_status ? product.warranty_status : "");
    formData.append("distributor", product.distributor);
    formData.append("image_url", product.image_url);

    const categoryJson = JSON.stringify({
      categoryId: parseInt(product.categoryId)
    });
    formData.append("category", new Blob([categoryJson], { type: 'application/json' }));

    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/product-managers/products`, {
      method: "POST",
      body: JSON.stringify({
        name: product.name,
        model: product.model,
        description: product.description,
        cost: product.cost ? parseFloat(product.cost) : null,
        serialNumber: product.serialNumber,
        quantity: product.quantity ? parseInt(product.quantity) : null,
        warranty_status: product.warranty_status ? parseInt(product.warranty_status) : null,
        distributor: product.distributor,
        image_url: product.image_url,
        category: {
          categoryId: product.categoryId ? parseInt(product.categoryId) : null
        }
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Success:", data);
        alert("Product created successfully! The sales manager will set its price before it appears on the website.");
        navigate("/productdashboard");
      })
      .catch(err => {
        console.error("Error creating product:", err);
        setError(`Error creating product: ${err.message}`);

        // If fetch failed, try an alternative approach with axios and x-www-form-urlencoded
        console.log("Trying alternative approach...");

        const params = new URLSearchParams();
        params.append("name", product.name);
        params.append("model", product.model);
        params.append("description", product.description);
        params.append("cost", product.cost ? product.cost : "");
        params.append("serialNumber", product.serialNumber);
        params.append("quantity", product.quantity ? product.quantity : "");
        params.append("warranty_status", product.warranty_status ? product.warranty_status : "");
        params.append("distributor", product.distributor);
        params.append("image_url", product.image_url);
        params.append("category.categoryId", product.categoryId);

        axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/product-managers/products`, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .then(response => {
            console.log("Success with alternative approach:", response);
            alert("Product created successfully! The sales manager will set its price before it appears on the website.");
            navigate("/productdashboard");
          })
          .catch(secondErr => {
            console.error("Error with alternative approach:", secondErr);
            setError(`Error creating product: ${err.message}. Alternative approach also failed: ${secondErr.message}`);
          });
      });
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Add New Product
      </Typography>

      <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa" }}>
        <Alert severity="info">
          New products will not be visible on the website until a sales manager sets their price.
          As a product manager, you can set the cost, but the sales price will be determined by the sales team.
        </Alert>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={product.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Model"
          name="model"
          value={product.model}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Description"
          name="description"
          value={product.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />
        <TextField
          label="Cost"
          name="cost"
          type="number"
          value={product.cost}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          helperText="Enter the production/acquisition cost of this product"
        />
        <TextField
          label="Serial Number"
          name="serialNumber"
          value={product.serialNumber}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          value={product.quantity}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
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
          value={product.categoryId}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Create Product
        </Button>
      </form>
    </Box>
  );
};

export default NewProductForm;
