import { Grid, Typography, Box } from "@mui/material";
import { useWishlist }  from "../../context/WishlistContext";
import ProductCard      from "../../components/ProductCard";

export default function WishlistPage() {
  const { items, loading } = useWishlist();

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={4}>My Wishlist</Typography>

      {loading ? (
        <Typography>Loading…</Typography>
      ) : items.length === 0 ? (
        <Typography>No favourites yet.</Typography>
      ) : (
        <Grid container spacing={4}>
          {items.map(wi => (
            <Grid item xs={12} sm={6} md={4} key={wi.wishlistItemId}>
              {/* JSON’da artık product objesi var */}
              <ProductCard product={wi.product}/>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
