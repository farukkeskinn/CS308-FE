import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Collapse,
  CircularProgress,
  IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const CategoryDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  // Object to track which parent categories are expanded
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios.get("http://localhost:8080/api/categories")
      .then((res) => {
        setCategories(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  };

  // Toggle expanded state for a parent category
  const toggleExpand = (parentId) => {
    setExpanded((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  // Handler for delete with confirmation
  const handleDeleteCategory = (categoryId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (confirmDelete) {
      axios.delete(`http://localhost:8080/api/categories/${categoryId}`)
        .then(() => {
          //fetchCategories();
          window.location.reload();
        })
        .catch((err) => console.error("Error deleting category:", err));
    }
  };

  // Filter only main categories (where parentCategory is null)
  const mainCategories = categories.filter(cat => cat.parentCategory === null);

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Category Management
      </Typography>
      
      {/* New Category Action Button */}
      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/productdashboard/new-category")}
          style={{ marginRight: "1rem" }}
        >
          Add New Category
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {mainCategories.map((parent) => (
            <Box key={parent.categoryId}>
              <ListItem
                button
                onClick={() => toggleExpand(parent.categoryId)}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {/* Icon for expanding/collapsing subcategories */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(parent.categoryId);
                    }}
                  >
                    {expanded[parent.categoryId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <ListItemText primary={parent.categoryName} />
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent toggling expand when clicking delete
                    handleDeleteCategory(parent.categoryId);
                  }}
                >
                  Delete Category
                </Button>
              </ListItem>

              <Collapse in={expanded[parent.categoryId]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {categories
                    .filter(sub => sub.parentCategory && sub.parentCategory.categoryId === parent.categoryId)
                    .map((sub) => (
                      <ListItem
                        key={sub.categoryId}
                        sx={{
                          pl: 4,
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <ListItemText primary={sub.categoryName} />
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteCategory(sub.categoryId)}
                        >
                          Delete Category
                        </Button>
                      </ListItem>
                    ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CategoryDashboard;
