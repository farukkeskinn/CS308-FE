import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewCategoryForm = () => {
  const [category, setCategory] = useState({
    categoryName: "",
    parentCategory: null
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8080/api/categories")
      .then(res => setAvailableCategories(res.data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "parentCategory") {
      setCategory({ ...category, parentCategory: value === "" ? null : { categoryId: value } });
    } else {
      setCategory({ ...category, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:8080/api/categories", category)
      .then(() => {
        navigate("/productdashboard/categories");
        window.location.reload();
      })
      .catch(err => console.error("Error creating category:", err));
  };

  // 🖤 Ortak stil
  const darkFieldStyle = {
    backgroundColor: "#000",
    input: { color: "#fff" },
    label: { color: "#fff" },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: "#444" },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: "#888" }
  };

  return (
    <Box p={4} sx={{ backgroundColor: "#000", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#fff" }}>
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
          required
          sx={darkFieldStyle}
        />

        <FormControl fullWidth margin="normal" sx={{ ...darkFieldStyle }}>
          <InputLabel id="parent-category-label" sx={{ color: "#fff" }}>
            Parent Category (Optional)
          </InputLabel>
          <Select
            labelId="parent-category-label"
            name="parentCategory"
            value={category.parentCategory ? category.parentCategory.categoryId : ""}
            label="Parent Category (Optional)"
            onChange={handleChange}
            sx={{
              color: "#fff",
              '& .MuiOutlinedInput-notchedOutline': { borderColor: "#444" },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: "#888" }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "#111",
                  color: "#fff"
                }
              }
            }}
          >
            <MenuItem value="">
              <em>None (Main Category)</em>
            </MenuItem>
            {availableCategories
              .filter(cat => cat.parentCategory === null)
              .map(mainCat => (
                <MenuItem key={mainCat.categoryId} value={mainCat.categoryId}>
                  {mainCat.categoryName}
                </MenuItem>
              ))}
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
