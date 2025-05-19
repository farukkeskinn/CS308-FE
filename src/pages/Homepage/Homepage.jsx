// src/pages/HomePage.jsx
import ProductCard from "../../components/ProductCard";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Typography,
  Box,
  Grid,
  IconButton,
  Checkbox,
  FormControlLabel,
  MenuList,
  TextField,
  Stack,
} from "@mui/material";
import SortIcon from '@mui/icons-material/Sort';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { useNavigate, Link } from "react-router-dom";
import { useCartContext } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [sortOption, setSortOption] = useState("SORT");
  const [cartClicked, setCartClicked] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const open = Boolean(anchorEl);
  const [openDialog, setOpenDialog] = useState(false);
  const { addToCart } = useCartContext();
  const { existsInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  // Filter States
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/published`)
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API Error:", error);
        setLoading(false);
      });
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case "Price: Low to High": return a.price - b.price;
      case "Price: High to Low": return b.price - a.price;
      case "Popularity: Low to High": return a.itemSold - b.itemSold;
      case "Popularity: High to Low": return b.itemSold - a.itemSold;
      default: return 0;
    }
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

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* ------------------------------- Hero ------------------------- */}
      <Box component="main" flexGrow={1} py={5} className="container text-center">
        <Box sx={{
          boxShadow: 3, borderRadius: 2, p: 4, backgroundColor: "white",
          textAlign: "center", mx: "auto", mb: 4
        }}>
          <Typography variant="h4" fontWeight="bold">Welcome to NEPTUNE</Typography>
          <Typography variant="subtitle1" color="text.secondary" mt={1}>
            Navigate the New Wave of Technology with <strong>NEPTUNE</strong> – all the tech you love, from brands you trust.
          </Typography>
        </Box>

        {/* --------------------------- Sıralama ----------------------- */}
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
            onClick={e => setAnchorEl(e.currentTarget)}
            startIcon={<SortIcon />}
            variant="contained"
            sx={{ backgroundColor: "#1f1c66", color: "white" }}
          >
            {sortOption ? `${sortOption}` : "Sort"}
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
            {["Price: Low to High", "Price: High to Low",
              "Popularity: Low to High", "Popularity: High to Low"]
              .map(opt => (
                <MenuItem key={opt} onClick={() => { setSortOption(opt); setAnchorEl(null); }}>
                  {opt}
                </MenuItem>
              ))}
          </Menu>
        </Box>

        {/* ------------------------ Ürün Grid’i ----------------------- */}
        <Grid container spacing={4}>
          {loading ? (
            <Grid item xs={12} textAlign="center">
              <CircularProgress />
              <Typography variant="h6" mt={2}>
                Products loading.
              </Typography>
            </Grid>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.productId}>
                <ProductCard product={product} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12} textAlign="center">
              <Typography variant="h6">
                No products available at this time.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>Please login to add this product to your wishlist.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </DialogActions>
      </Dialog>
      {/* ----------------------------- Footer ----------------------- */}
      <Box component="footer" className="bg-dark text-white text-center py-3 mt-auto">
        © 2025 Neptune. All rights reserved.
      </Box>
    </Box>
  );
}