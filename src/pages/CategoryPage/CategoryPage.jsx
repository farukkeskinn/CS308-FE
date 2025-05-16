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
  MenuList,
  Checkbox,
  FormControlLabel,
  TextField,
  Stack,
} from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import { useCartContext } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

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
  const { existsInWishlist, toggleWishlist } = useWishlist();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Filter States
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  useEffect(() => {
    setSortOption("");
    setLoading(true);
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/categories/${categoryId}`)
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
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/products/by-category/${categoryId}`)
      .then((response) => {
        // Filter out products that aren't published
        const publishedProducts = response.data.content;
        setProducts(publishedProducts || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        setLoading(false);
      });
  }, [categoryId]);

  // Handle input changes
  const handleMinPriceChange = (event) => {
    const value = event.target.value;
    // Allow empty string or numbers only
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setMinPrice(value);
    }
  };

  const handleMaxPriceChange = (event) => {
    const value = event.target.value;
    // Allow empty string or numbers only
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setMaxPrice(value);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "Price: Low to High") return (a.price || 0) - (b.price || 0);
    if (sortOption === "Price: High to Low") return (b.price || 0) - (a.price || 0);
    if (sortOption === "Rating: Low to High") return (a.rating || 0) - (b.rating || 0);
    if (sortOption === "Rating: High to Low") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const filteredProducts = sortedProducts.filter(product => {
    // Parse the min and max values, defaulting to 0 and MAX_SAFE_INTEGER if empty
    const min = minPrice === "" ? 0 : parseFloat(minPrice);
    const max = maxPrice === "" ? Number.MAX_SAFE_INTEGER : parseFloat(maxPrice);

    const inPriceRange = product.price >= min && product.price <= max;
    const inStockMatch =
      (showInStock && product.stock > 0) ||
      (showOutOfStock && product.stock === 0);
    return inPriceRange && inStockMatch;
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
          {/* Filter Button */}
          <Button
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            startIcon={<FilterAltIcon />}
            variant="contained"
            sx={{ backgroundColor: "#1f1c66", color: "white", mr: 2 }}
          >
            Filter
          </Button>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuList sx={{ width: 250, px: 2, py: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Price Range
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <TextField
                  label="Min $"
                  variant="outlined"
                  size="small"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  placeholder="0"
                  sx={{ width: '45%' }}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                />
                <Typography variant="body2">to</Typography>
                <TextField
                  label="Max $"
                  variant="outlined"
                  size="small"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  placeholder="Max"
                  sx={{ width: '45%' }}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                />
              </Stack>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showInStock}
                    onChange={(e) => setShowInStock(e.target.checked)}
                  />
                }
                label="In Stock"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOutOfStock}
                    onChange={(e) => setShowOutOfStock(e.target.checked)}
                  />
                }
                label="Out of Stock"
              />
            </MenuList>
          </Menu>

          {/* Sort Button */}
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
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
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
                    onClick={() => {
                      const token = localStorage.getItem("jwtToken");
                      if (!token) { window.location.href = "/login"; return; }
                      toggleWishlist(product);
                    }}
                    sx={{
                      position: "absolute", top: 8, right: 8, zIndex: 2,
                      color: existsInWishlist(product.productId) ? "error.main" : "grey.500",
                    }}
                  >
                    {existsInWishlist(product.productId) ? <Favorite /> : <FavoriteBorder />}
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
                          // İndirim uygulanmışsa discountedPrice, aksi halde normal price
                          const priceToShow = product.discounted
                            ? product.discountedPrice
                            : product.price;

                          // Eğer undefined/null gelirse 0’a düşsün
                          const [dollars, cents] = (priceToShow || 0).toFixed(2).split(".");

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