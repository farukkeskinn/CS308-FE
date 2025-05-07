import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
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
import { useCartContext } from "../../context/CartContext";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [sortOption, setSortOption] = useState("SORT");
  const [cartClicked, setCartClicked] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const open = Boolean(anchorEl);
  const { addToCart } = useCartContext();

  // Filter States
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:8080/api/products/published")
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
    if (sortOption === "Price: Low to High") return a.price - b.price;
    if (sortOption === "Price: High to Low") return b.price - a.price;
    if (sortOption === "Popularity: Low to High") return a.itemSold - b.itemSold;
    if (sortOption === "Popularity: High to Low") return b.itemSold - a.itemSold;
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
            Welcome to NEPTUNE
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mt={1}>
            Navigate the New Wave of Technology with <strong>NEPTUNE</strong> - All the tech you love, from brands you trust.
          </Typography>
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
            {sortOption ? `${sortOption}` : "Sort"}
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose(null)}>
            <MenuItem onClick={() => handleClose("Price: Low to High")}>Price: Low to High</MenuItem>
            <MenuItem onClick={() => handleClose("Price: High to Low")}>Price: High to Low</MenuItem>
            <MenuItem onClick={() => handleClose("Popularity: Low to High")}>Popularity: Low to High</MenuItem>
            <MenuItem onClick={() => handleClose("Popularity: High to Low")}>Popularity: High to Low</MenuItem>
          </Menu>
        </Box>

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
                          : product.description}
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
                          const [dollars, cents] = (product.price || 0).toFixed(2).split(".");
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
                      borderRadius: "0 0 15px 15px",
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
            <Grid item xs={12} textAlign="center">
              <Typography variant="h6">
                No products available at this time.
              </Typography>
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