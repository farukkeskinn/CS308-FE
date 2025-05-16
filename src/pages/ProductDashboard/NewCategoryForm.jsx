import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewCategoryForm = () => {
  const [category, setCategory] = useState({
    categoryName: "",
    // Optionally, for subcategories choose a parent ID; empty means a main category.
    parentCategory: null
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available categories so that you can choose a parent category if needed.
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`)
      .then(res => setAvailableCategories(res.data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For parentCategory, we store as an object
    if (name === "parentCategory") {
      setCategory({ ...category, parentCategory: value === "" ? null : { categoryId: value } });
    } else {
      setCategory({ ...category, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/categories`, category)
      .then(() => {
        navigate("/productdashboard/categories");
        // Reload the page so that the newly added category shows immediately.
        window.location.reload();
      })
      .catch(err => console.error("Error creating category:", err));
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Add New Category
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Category Name"
          name="categoryName"
          value={category.categoryName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="parent-category-label">Parent Category (Optional)</InputLabel>
          <Select
            labelId="parent-category-label"
            name="parentCategory"
            value={category.parentCategory ? category.parentCategory.categoryId : ""}
            label="Parent Category (Optional)"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>None (Main Category)</em>
            </MenuItem>
            {availableCategories
              // show only main categories, for example (where parentCategory is null)
              .filter(cat => cat.parentCategory === null)
              .map(mainCat => (
                <MenuItem key={mainCat.categoryId} value={mainCat.categoryId}>
                  {mainCat.categoryName}
                </MenuItem>
              ))
            }
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Create Category
        </Button>
      </form>
    </Box>
  );
};

export default NewCategoryForm;
