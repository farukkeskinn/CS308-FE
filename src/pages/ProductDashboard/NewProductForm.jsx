import React, { useState } from "react";
import { Box, TextField, Button, Typography, Alert, Paper } from "@mui/material";
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
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["cost", "quantity", "warranty_status"];
    if (numericFields.includes(name)) {
      if (/^\d*$/.test(value)) {
        setProduct({ ...product, [name]: value });
      }
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (product.cost && isNaN(product.cost)) return setError("Cost must be a valid number.");
    if (product.quantity && isNaN(product.quantity)) return setError("Quantity must be a valid number.");
    if (product.warranty_status && isNaN(product.warranty_status)) return setError("Warranty must be a valid number.");

    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/product-managers/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: product.name,
        model: product.model,
        description: product.description,
        cost: product.cost ? parseFloat(product.cost) : null,
        serialNumber: product.serialNumber,
        quantity: product.quantity ? parseInt(product.quantity) : null,
        warranty_status: product.warranty_status ? parseInt(product.warranty_status) : null,
        distributor: product.distributor,
        image_url: product.image_url
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to create product");
        return res.json();
      })
      .then(() => {
        alert("Product created successfully!");
        navigate("/productdashboard");
      })
      .catch(err => setError(`Error creating product: ${err.message}`));
  };

  const darkFieldStyle = {
    '& .MuiInputBase-root': {
      backgroundColor: '#1e1e1e !important',
      color: '#fff',
    },
    '& input': {
      backgroundColor: '#1e1e1e !important',
      color: '#fff',
    },
    '& .MuiInputBase-inputMultiline': {
      backgroundColor: '#1e1e1e !important',
      color: '#fff',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#444',
      },
      '&:hover fieldset': {
        borderColor: '#888',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#aaa',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#ccc',
    },
  };

  return (
    <Box p={4} sx={{ backgroundColor: "#000", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#fff" }}>
        Add New Product
      </Typography>

      <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: "#111", color: "#fff" }}>
        <Alert severity="info">
          New products will not be visible until a sales manager sets the price.
        </Alert>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField label="Name" name="name" value={product.name} onChange={handleChange} fullWidth margin="normal" required sx={darkFieldStyle} />
        <TextField label="Model" name="model" value={product.model} onChange={handleChange} fullWidth margin="normal" required sx={darkFieldStyle} />
        <TextField label="Description" name="description" value={product.description} onChange={handleChange} fullWidth multiline rows={4} margin="normal" sx={darkFieldStyle} />
        <TextField label="Cost" name="cost" value={product.cost} onChange={handleChange} fullWidth margin="normal" required sx={darkFieldStyle} />
        <TextField label="Serial Number" name="serialNumber" value={product.serialNumber} onChange={handleChange} fullWidth margin="normal" required sx={darkFieldStyle} />
        <TextField label="Quantity" name="quantity" value={product.quantity} onChange={handleChange} fullWidth margin="normal" required sx={darkFieldStyle} />
        <TextField label="Warranty (months)" name="warranty_status" value={product.warranty_status} onChange={handleChange} fullWidth margin="normal" sx={darkFieldStyle} />
        <TextField label="Distributor" name="distributor" value={product.distributor} onChange={handleChange} fullWidth margin="normal" sx={darkFieldStyle} />
        <TextField label="Image URL" name="image_url" value={product.image_url} onChange={handleChange} fullWidth margin="normal" sx={darkFieldStyle} />

        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Create Product
        </Button>
      </form>
    </Box>
  );
};

export default NewProductForm;
