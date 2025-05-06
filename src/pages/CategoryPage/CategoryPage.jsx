import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import { useCartContext } from "../../context/CartContext";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("Products");
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [cartClicked, setCartClicked] = useState({});
  const { addToCart } = useCartContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setSortOption("");
    setLoading(true);
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    axios
      .get(`http://localhost:8080/api/categories/${categoryId}`)
      .then((response) => {
        setCategoryDetails(response.data);
        setCategoryName(response.data.categoryName);
      })
      .catch((error) => {
        console.error("Error loading category details:", error);
      });
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;

    axios
      .get(`http://localhost:8080/api/products/by-category/${categoryId}`)
      .then((response) => {
        // Filter out products that aren't published
        const publishedProducts = response.data.content.filter(
          product => product.published === true && product.price !== null
        );
        setProducts(publishedProducts || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        setLoading(false);
      });
  }, [categoryId]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "Price: Low to High") return (a.price || 0) - (b.price || 0);
    if (sortOption === "Price: High to Low") return (b.price || 0) - (a.price || 0);
    if (sortOption === "Rating: Low to High") return (a.rating || 0) - (b.rating || 0);
    if (sortOption === "Rating: High to Low") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = (option) => {
    if (option) setSortOption(option);
    setAnchorEl(null);
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Box component="main" flexGrow={1} py={5} className="container text-center">
        <Box
          sx={{
            boxShadow: 3,
            borderRadius: 2,
            p: 4,
            backgroundColor: "white",
            textAlign: "center",
            mx: "auto",
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {categoryName}
          </Typography>
          {categoryDetails?.parentCategory && (
            <Typography variant="subtitle1" color="text.primary" mt={1}>
              <Link to={`/category/${categoryDetails.parentCategory.categoryId}`}
                style={{ textDecoration: 'none', color: '#1f1c66' }}>
                {`${categoryDetails.parentCategory.categoryName}`}
              </Link>
            </Typography>
          )}
          {products.length > 0 && (
            <Typography variant="subtitle1" color="text.secondary" mt={1}>
              We found {products.length} products matching this category.
            </Typography>
          )}
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button
            onClick={handleClick}
            startIcon={<SortIcon />}
            variant="contained"
            sx={{ backgroundColor: "#1f1c66", color: "white" }}
          >
            {sortOption ? ` ${sortOption}` : "Sort"}
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose(null)}>
            <MenuItem onClick={() => handleClose("Price: Low to High")}>Price: Low to High</MenuItem>
            <MenuItem onClick={() => handleClose("Price: High to Low")}>Price: High to Low</MenuItem>
            <MenuItem onClick={() => handleClose("Rating: Low to High")}>Rating: Low to High</MenuItem>
            <MenuItem onClick={() => handleClose("Rating: High to Low")}>Rating: High to Low</MenuItem>
          </Menu>
        </Box>

        <Grid container spacing={4}>
          {loading ? (
            <Grid item xs={12} textAlign="center">
              <CircularProgress />
              <Typography variant="h6" mt={2}>
                Products loading...
              </Typography>
            </Grid>
          ) : sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.productId}>
                <Card
                  sx={{
                    position: "relative",
                    borderRadius: "10px",
                    boxShadow: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <IconButton
                    onClick={() =>
                      setFavorites((prev) => ({
                        ...prev,
                        [product.productId]: !prev[product.productId],
                      }))
                    }
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: favorites[product.productId] ? "error.main" : "grey.500",
                      zIndex: 2,
                    }}
                  >
                    {favorites[product.productId] ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>

                  <CardActionArea component={Link} to={`/product/${product.productId}`}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image_url}
                      alt={product.name}
                      sx={{ objectFit: "contain", p: 2 }}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.description && product.description.length > 80
                          ? product.description.substring(0, 80) + "..."
                          : product.description || ""}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 1 }}
                        color={product.stock === 0 ? "error" : "text.secondary"}
                      >
                        {product.stock === 0
                          ? "Out of Stock"
                          : `In Stock: ${product.stock}`}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#1f1c66",
                          fontWeight: "bold",
                          mt: 1,
                          display: "flex",
                          alignItems: "baseline",
                        }}
                      >
                        {(() => {
                          // Add null check for price
                          const price = product.price || 0;
                          const [dollars, cents] = price.toFixed(2).split(".");
                          return (
                            <>
                              <span style={{ fontSize: "24px", fontWeight: 700 }}>${dollars}</span>
                              <span style={{ fontSize: "14px", marginLeft: "2px" }}>.{cents}</span>
                            </>
                          );
                        })()}
                      </Typography>
                    </CardContent>
                  </CardActionArea>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    disabled={product.stock === 0}
                    onClick={() => {
                      setCartClicked((prev) => ({ ...prev, [product.productId]: true }));
                      addToCart(product);
                      setTimeout(() =>
                        setCartClicked((prev) => ({ ...prev, [product.productId]: false })),
                        300
                      );
                    }}
                    sx={{
                      mt: "auto",
                      borderRadius: "0 0 10px 10px",
                      backgroundColor: cartClicked[product.productId] ? "#2ecc71" : "#1f1c66",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "14px",
                      height: "45px",
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        backgroundColor: cartClicked[product.productId] ? "#27ae60" : "#181552",
                      },
                    }}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="h6">No products found in this category.</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      <Box component="footer" className="bg-dark text-white text-center py-3 mt-auto">
        &copy; 2025 Neptune. All rights reserved.
      </Box>
    </Box>
  );
}