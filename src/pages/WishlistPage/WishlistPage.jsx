// src/pages/WishlistPage.jsx
import { Grid, Typography, Box, Button } from "@mui/material";
import { useWishlist }  from "../../context/WishlistContext";
import ProductCard      from "../../components/ProductCard";
import { Link }         from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function WishlistPage() {
  const { items, loading } = useWishlist();

  return (
    /* ① ——— Dış sarmal: dikey flex + tam ekran yüksekliği */
    <Box display="flex" flexDirection="column" minHeight="100vh">

      {/* ② ——— Ana içerik: flexGrow 1  ➜  boşluğu kaplar */}
      <Box p={4} flexGrow={1}>
        <Typography variant="h4" fontWeight="bold" mb={4}>
          My Wishlist
        </Typography>

        {loading ? (
          <Typography>Loading…</Typography>
        ) : items.length === 0 ? (
          /* ——— Boş durum ——— */
          <Box
            minHeight="60vh"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{
              border: "2px dashed #e0e0e0",
              borderRadius: 3,
              backgroundColor: "#fafafa",
              py: 8,
            }}
          >
            <FavoriteBorderIcon sx={{ fontSize: 80, color: "grey.400" }} />
            <Typography variant="h6" color="text.secondary" mt={2}>
              No favourites yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Browse our catalogue and add items you love!
            </Typography>

            <Button
              component={Link}
              to="/"
              variant="contained"
              sx={{
                mt: 4,
                textTransform: "none",
                px: 4,
                backgroundColor: "#1f1c66",
                "&:hover": { backgroundColor: "#161446" },
              }}
            >
              Start adding favourites
            </Button>
          </Box>
        ) : (
          /* ——— Ürün kartları ——— */
          <Grid container spacing={4}>
            {items.map((wi) => (
              <Grid item xs={12} sm={6} md={4} key={wi.wishlistItemId}>
                <ProductCard product={wi.product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ③ ——— Footer: sabit yükseklik, en altta */}
      <Box
        component="footer"
        sx={{
          backgroundColor: "#212529",
          color: "white",
          textAlign: "center",
          py: 2,
        }}
      >
        © 2025 Neptune. All rights reserved.
      </Box>
    </Box>
  );
}