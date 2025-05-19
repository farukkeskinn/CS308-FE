import React, { useState } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Box,
  Chip
} from "@mui/material";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import DiscountIcon from '@mui/icons-material/Discount';
import Favorite from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCartContext } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { existsInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCartContext();
  const [adding, setAdding] = useState(false);

  return (
    <Card
      sx={{
        position: "relative",
        borderRadius: 2,
        boxShadow: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      {/* Wishlist Heart */}
      <IconButton
        onClick={() => toggleWishlist(product)}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 2,
          color: existsInWishlist(product.productId)
            ? "error.main"
            : "grey.500"
        }}
      >
        {existsInWishlist(product.productId) ? <Favorite /> : <FavoriteBorder />}
      </IconButton>

      {/* Discount Badge */}
      {product.discounted && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            alignItems: "center",
            gap: 0.5
          }}
        >
          {/* İcon */}
          <DiscountIcon fontSize="medium" color="black" />

          {/* Yüzde badge’i */}
          <Chip
            label={`-${product.discountPercentage}%`}
            color="success"
            size="medium"
            sx={{ fontWeight: "bold" }}
          />
        </Box>
      )}

      {/* Product Link */}
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
            variant="body2"
            sx={{ mt: 1 }}
            color={product.stock === 0 ? "error" : "text.secondary"}
          >
            {product.stock === 0
              ? "Out of Stock"
              : `In Stock: ${product.stock}`}
          </Typography>

          {/* Price Display */}
          <Typography
            sx={{
              color: "#1f1c66",
              
              fontWeight: "bold",
              mt: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start"
            }}
          >
            {/* Eğer indirim varsa orijinal fiyat çizgili olarak üstte */}
            {product.discounted ? (
              // İndirim varsa eski fiyatı göster
              <span
                style={{
                  textDecoration: "line-through",
                  color: "#888",
                  marginBottom: 4
                }}
              >
                ${product.price.toFixed(2)}
              </span>
            ) : (
              // İndirim yoksa görünmez bir placeholder koy, aynı marginBottom’a sahip
              <span
                style={{
                  visibility: "hidden",
                  marginBottom: 4
                }}
              >
                ${product.price.toFixed(2)}
              </span>
            )}

            {/* Geçerli fiyat (indirimli veya normal) her zaman altta */}
            {(() => {
              const priceToShow = product.discounted
                ? product.discountedPrice
                : product.price;
              const [intPart, decPart] = priceToShow.toFixed(2).split(".");
              return (
                <span style={{ display: "flex", alignItems: "baseline" }}>
                  <span style={{ fontSize: 24, fontWeight: 700 }}>
                    ${intPart}
                  </span>
                  <span style={{ fontSize: 14, marginLeft: 2 }}>
                    .{decPart}
                  </span>
                </span>
              );
            })()}
          </Typography>
        </CardContent>
      </CardActionArea>

      {/* Add to Cart Button */}     
      <Button
        fullWidth
        variant="contained"
        startIcon={<ShoppingCartIcon />}
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
