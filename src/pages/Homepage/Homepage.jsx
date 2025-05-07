// src/pages/HomePage.jsx
import { useState, useEffect }   from "react";
import axios                     from "axios";
import {
  Box, Grid, Card, CardActionArea, CardMedia,
  CardContent, Typography, IconButton, Button,
  Menu, MenuItem, CircularProgress,   Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SortIcon          from "@mui/icons-material/Sort";
import FavoriteBorder    from "@mui/icons-material/FavoriteBorder";
import Favorite          from "@mui/icons-material/Favorite";
import ShoppingCart      from "@mui/icons-material/ShoppingCart";
import { useNavigate, Link } from "react-router-dom";
import { useCartContext } from "../../context/CartContext";
import { useWishlist   }   from "../../context/WishlistContext";

export default function HomePage() {
  /* ------------------------------------------------------------------ */
  /*  State                                                             */
  /* ------------------------------------------------------------------ */
  const [products,   setProducts ] = useState([]);
  const [sortOpt,    setSortOpt  ] = useState("SORT");
  const [cartClick,  setCartClick] = useState({});
  const [anchorEl,   setAnchorEl ] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const openMenu = Boolean(anchorEl);

  const { addToCart }                       = useCartContext();
  const { existsInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  /* ------------------------------------------------------------------ */
  /*  Ürünleri getir                                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    axios.get("http://localhost:8080/api/products")
         .then(res => setProducts(res.data))
         .catch(err => console.error("API Error:", err));
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Sıralama                                                          */
  /* ------------------------------------------------------------------ */
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOpt) {
      case "Price: Low to High":      return a.price    - b.price;
      case "Price: High to Low":      return b.price    - a.price;
      case "Popularity: Low to High": return a.itemSold - b.itemSold;
      case "Popularity: High to Low": return b.itemSold - a.itemSold;
      default:                        return 0;
    }
  });

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
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
          <Button
            onClick={e => setAnchorEl(e.currentTarget)}
            startIcon={<SortIcon/>}
            variant="contained"
            sx={{ backgroundColor: "#1f1c66", color: "white" }}
          >
            {sortOpt}
          </Button>
          <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
            {["Price: Low to High","Price: High to Low",
              "Popularity: Low to High","Popularity: High to Low"]
              .map(opt => (
                <MenuItem key={opt} onClick={() => { setSortOpt(opt); setAnchorEl(null); }}>
                  {opt}
                </MenuItem>
              ))}
          </Menu>
        </Box>

        {/* ------------------------ Ürün Grid’i ----------------------- */}
        <Grid container spacing={4}>
          {sortedProducts.length ? (
            sortedProducts.map(prod => (
              <Grid item xs={12} sm={6} md={4} key={prod.productId}>
                <Card sx={{
                  position: "relative", borderRadius: "10px", boxShadow: 3,
                  height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between"
                }}>
                  {/* ------ Kalp ikonu ------ */}
                  <IconButton
                    onClick={() => {
                      const token = localStorage.getItem("jwtToken");
                      if (!token) {            // ⬅️ oturum yok
                        setOpenDialog(true);   // 👉 diyalogu aç
                        return;                // toggle çağırma
                      }
                      toggleWishlist(prod);   
                    }}
                    sx={{
                      position: "absolute", top: 8, right: 8,
                      color: existsInWishlist(prod.productId) ? "error.main" : "grey.500",
                      zIndex: 2,
                    }}
                  >
                    {existsInWishlist(prod.productId) ? <Favorite/> : <FavoriteBorder/>}
                  </IconButton>

                  {/* ------ Ürün görsel / detay linki ------ */}
                  <CardActionArea component={Link} to={`/product/${prod.productId}`}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={prod.image_url}
                      alt={prod.name}
                      sx={{ objectFit: "contain", p: 2 }}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {prod.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {prod.description.length > 80
                          ? prod.description.slice(0, 80) + "…"
                          : prod.description}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 1 }}
                        color={prod.stock === 0 ? "error" : "text.secondary"}
                      >
                        {prod.stock === 0 ? "Out of Stock" : `In Stock: ${prod.stock}`}
                      </Typography>
                      <Typography sx={{
                        color: "#1f1c66", fontWeight: "bold", mt: 1,
                        display: "flex", alignItems: "baseline"
                      }}>
                        {(() => {
                          const [d, c] = prod.price.toFixed(2).split(".");
                          return <>
                            <span style={{ fontSize: 24, fontWeight: 700 }}>${d}</span>
                            <span style={{ fontSize: 14, marginLeft: 2 }}>.{c}</span>
                          </>;
                        })()}
                      </Typography>
                    </CardContent>
                  </CardActionArea>

                  {/* ------ Sepete ekle butonu ------ */}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCart/>}
                    disabled={prod.stock === 0}
                    onClick={() => {
                      setCartClick(prev => ({ ...prev, [prod.productId]: true }));
                      addToCart(prod);
                      setTimeout(() =>
                        setCartClick(prev => ({ ...prev, [prod.productId]: false })), 300);
                    }}
                    sx={{
                      mt: "auto", borderRadius: "0 0 15px 15px",
                      backgroundColor: cartClick[prod.productId] ? "#2ecc71" : "#1f1c66",
                      color: "white", fontWeight: "bold", fontSize: 14, height: 45,
                      transition: "background-color .3s ease",
                      "&:hover": {
                        backgroundColor: cartClick[prod.productId] ? "#27ae60" : "#181552",
                      }
                    }}
                  >
                    {prod.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12} textAlign="center">
              <CircularProgress/>
              <Typography variant="h6" mt={2}>Products loading.</Typography>
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
