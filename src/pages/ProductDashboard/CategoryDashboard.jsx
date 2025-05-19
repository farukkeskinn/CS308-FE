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
  IconButton,
  Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const CategoryDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`)
      .then((res) => {
        setCategories(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  };

  const toggleExpand = (parentId) => {
    setExpanded((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  const handleDeleteCategory = (categoryId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (confirmDelete) {
      axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/categories/${categoryId}`)
        .then(() => window.location.reload())
        .catch((err) => console.error("Error deleting category:", err));
    }
  };

  const mainCategories = categories.filter(cat => cat.parentCategory === null);

  return (
    <Box p={4} sx={{ backgroundColor: "#000", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#fff" }}>
        Category Management
      </Typography>

      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/productdashboard/new-category")}
          sx={{
            marginRight: "1rem",
            boxShadow: 3,
            '&:hover': { boxShadow: 6 }
          }}
        >
          Add New Category
        </Button>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {mainCategories.map((parent) => (
            <Box key={parent.categoryId} mb={2}>
              <ListItem
                button
                onClick={() => toggleExpand(parent.categoryId)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  backgroundColor: "#111",
                  '&:hover': { backgroundColor: '#222' },
                  padding: 1,
                  borderRadius: 1,
                  color: "#fff",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(parent.categoryId);
                    }}
                    sx={{ color: "#fff" }}
                  >
                    {expanded[parent.categoryId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <ListItemText primary={parent.categoryName} sx={{ ml: 1 }} />
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(parent.categoryId);
                  }}
                  size="small"
                  sx={{ boxShadow: 2, '&:hover': { boxShadow: 5 } }}
                >
                  Delete Category
                </Button>
              </ListItem>

              <Collapse in={expanded[parent.categoryId]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {categories
                    .filter(sub => sub.parentCategory?.categoryId === parent.categoryId)
                    .map((sub) => (
                      <ListItem
                        key={sub.categoryId}
                        sx={{
                          pl: 4,
                          display: "flex",
                          justifyContent: "space-between",
                          backgroundColor: "#1a1a1a",
                          borderRadius: 1,
                          '&:hover': { backgroundColor: '#2a2a2a' },
                          color: "#fff"
                        }}
                      >
                        <ListItemText
                          primary={sub.categoryName}
                          sx={{ fontSize: '0.9rem' }}
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteCategory(sub.categoryId)}
                          size="small"
                          sx={{ boxShadow: 2, '&:hover': { boxShadow: 5 } }}
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
