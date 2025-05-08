import {
    Card, CardActionArea, CardContent, CardMedia,
    Typography, IconButton, Button
  } from "@mui/material";
  import FavoriteBorder      from "@mui/icons-material/FavoriteBorder";
  import Favorite            from "@mui/icons-material/Favorite";
  import ShoppingCartIcon    from "@mui/icons-material/ShoppingCart";
  import { Link }            from "react-router-dom";
  import { useWishlist }     from "../context/WishlistContext";
  import { useCartContext }  from "../context/CartContext";
  import { useState }        from "react";
  
  export default function ProductCard({ product }) {
    const { existsInWishlist, toggleWishlist } = useWishlist();
    const { addToCart }             = useCartContext();
    const [adding, setAdding]       = useState(false);
  
    return (
      <Card sx={{
        position: "relative",
        borderRadius: 2,
        boxShadow: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        {/* --- Kalp --- */}
        <IconButton
          onClick={() => toggleWishlist(product)}
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 2,
                color: existsInWishlist(product.productId) ? "error.main" : "grey.500" }}
        >
          {existsInWishlist(product.productId) ? <Favorite/> : <FavoriteBorder/>}
        </IconButton>
  
        {/* --- Ürün detay linki --- */}
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
              {product.description?.length > 80
                ? product.description.slice(0, 80) + "…"
                : product.description}
            </Typography>
  
            <Typography
              variant="body2" sx={{ mt: 1 }}
              color={product.stock === 0 ? "error" : "text.secondary"}
            >
              {product.stock === 0 ? "Out of Stock" : `In Stock: ${product.stock}`}
            </Typography>
  
            {/* Fiyat formatı */}
            <Typography sx={{
              color: "#1f1c66", fontWeight: "bold", mt: 1,
              display: "flex", alignItems: "baseline"
            }}>
              {(() => {
                const [d, c] = product.price?.toFixed(2).split(".");
                return <>
                  <span style={{ fontSize: 24, fontWeight: 700 }}>${d}</span>
                  <span style={{ fontSize: 14, marginLeft: 2 }}>.{c}</span>
                </>;
              })()}
            </Typography>
          </CardContent>
        </CardActionArea>
  
        {/* --- Sepete ekle --- */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCartIcon/>}
          disabled={product.stock === 0}
          onClick={() => {
            setAdding(true);
            addToCart(product);
            setTimeout(() => setAdding(false), 300);
          }}
          sx={{
            mt: "auto",
            borderRadius: "0 0 15px 15px",
            backgroundColor: adding ? "#2ecc71" : "#1f1c66",
            "&:hover": { backgroundColor: adding ? "#27ae60" : "#181552" }
          }}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </Card>
    );
  }
  