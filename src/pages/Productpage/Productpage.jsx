import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { ShoppingCart, Favorite, FavoriteBorder } from "@mui/icons-material";
import { useCartContext } from "../../context/CartContext";

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [cartClicked, setCartClicked] = useState(false);
  const { addToCart } = useCartContext();

  useEffect(() => {
    if (!productId) return;

    axios.get(`http://localhost:8080/api/products/${productId}/details`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
        return axios.get(`http://localhost:8080/api/products/${productId}/recommended`);
      })
      .then((recommendedResponse) => {
        if (recommendedResponse.data.content && Array.isArray(recommendedResponse.data.content)) {
          setRecommendedProducts(recommendedResponse.data.content);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return <Typography align="center" mt={5}>Loading product details...</Typography>;
  }

  if (!product) {
    return <Typography align="center" mt={5}>Product not found.</Typography>;
  }

  const totalReviews = product.reviews ? product.reviews.length : 0;
  const averageRating = totalReviews > 0
    ? (product.reviews.reduce((sum, c) => sum + c.rating, 0) / totalReviews).toFixed(1)
    : "No Rating Yet";

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Box p={4}>
        <Typography variant="h4" fontWeight="bold">
          {product.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {productId}
        </Typography>
  
        <Box mt={1} display="flex" alignItems="center" gap={2}>
          <Typography fontWeight="bold">⭐ {averageRating}</Typography>
          <Typography>
            {totalReviews > 0 ? `${totalReviews} reviews` : "No Reviews Yet"}
          </Typography>
        </Box>
  
        <Grid container spacing={4} mt={3}>
          <Grid item xs={12} md={5}>
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: "100%", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                backgroundColor: "#1f1c66",
                color: "white",
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box mb={3}>
                <Typography variant="body1" sx={{ fontSize: "16px", lineHeight: 1.2 }}>
                  {product.description}
                </Typography>
              </Box>

              <Box>
                <TableSection product={product} />

                <Typography
                  component="div"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "baseline",
                    mt: 3,
                  }}
                >
                  {(() => {
                    const [dollars, cents] = product.price.toFixed(2).split(".");
                    return (
                      <>
                        <span style={{ fontSize: "34px", fontWeight: 700 }}>${dollars}</span>
                        <span style={{ fontSize: "18px", marginLeft: "2px" }}>.{cents}</span>
                      </>
                    );
                  })()}
                </Typography>

                <Box mt={2} display="flex" gap={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    disabled={product.quantity === 0} // 🔒 Sepete ekleme devre dışı
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                      setCartClicked(true);
                      setTimeout(() => setCartClicked(false), 300);
                    }}
                    sx={{
                      backgroundColor: product.quantity === 0
                        ? "#ccc"
                        : cartClicked
                        ? "#2ecc71"
                        : "#ffffff",
                      color: product.quantity === 0
                        ? "#666"
                        : cartClicked
                        ? "white"
                        : "#1f1c66",
                      borderColor: "#1f1c66",
                      height: "45px",
                      fontWeight: "bold",
                      fontSize: "16px",
                      borderRadius: "10px",
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        backgroundColor:
                          product.quantity === 0
                            ? "#ccc"
                            : cartClicked
                            ? "#27ae60"
                            : "#e1e1ff",
                      },
                    }}
                  >
                    {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  <Button
                    variant="contained"
                    color={isFavorited ? "success" : "error"}
                    fullWidth
                    startIcon={
                      isFavorited ? (
                        <Favorite sx={{ transition: "transform 0.3s ease", transform: "scale(1.1)" }} />
                      ) : (
                        <FavoriteBorder sx={{ transition: "transform 0.3s ease", transform: "scale(1)" }} />
                      )
                    }
                    onClick={() => setIsFavorited(!isFavorited)}
                    sx={{
                      height: "45px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      transition: "all 0.3s ease",
                      backgroundColor: isFavorited ? "#2e7d32" : "#d32f2f",
                      "&:hover": {
                        backgroundColor: isFavorited ? "#1b5e20" : "#b71c1c",
                        transform: "scale(1.03)",
                      },
                    }}
                  >
                    {isFavorited ? "Added to Favorites" : "Add to Favorites"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
  
        <Paper
          elevation={3}
          sx={{
            mt: 5,
            p: 3,
            backgroundColor: "#fff",
            borderRadius: "10px",
            position: "relative",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <Typography variant="h5" fontWeight="bold">
              Product Reviews
            </Typography>

            <IconButton
              onClick={() => setReviewsVisible(!reviewsVisible)}
              sx={{
                backgroundColor: "#1f1c66",
                color: "white",
                "&:hover": { backgroundColor: "#181552" },
              }}
            >
              {reviewsVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </div>

          <Collapse in={reviewsVisible}>
            <Divider sx={{ my: 2 }} />

            <div className="border rounded p-3 bg-light">
              <Typography variant="subtitle1" fontWeight="bold">
                ⭐ Rating Breakdown
              </Typography>
              <div className="progress-container mt-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = product.reviews.filter((c) => c.rating === star).length;
                  return (
                    <div
                      key={star}
                      className="d-flex align-items-center gap-2 mb-1"
                    >
                      <span className="fw-bold">{star} ⭐</span>
                      <div className="progress flex-grow-1" style={{ height: "5px" }}>
                        <div
                          className="progress-bar bg-warning"
                          role="progressbar"
                          style={{ width: `${(count / totalReviews) * 100}%` }}
                        ></div>
                      </div>
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="mt-3 p-3 rounded border bg-light"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Customer Reviews
              </Typography>
              {totalReviews > 0 ? (
                <ul className="list-group mt-2">
                  {product.reviews.map((review, index) => (
                    <li key={index} className="list-group-item p-2">
                      <span className="fw-bold">
                        {"⭐".repeat(review.rating)}
                      </span>{" "}
                      - {review.comment || "No Comment"}
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No Comments Yet.
                </Typography>
              )}
            </div>
          </Collapse>
        </Paper>
  
        <Box mt={6} p={3} borderRadius={3} sx={{ backgroundColor: "#1f1c66", color: "white" }}>
          <Typography variant="h6" textAlign="center" mb={3}>
            Recommended Products
          </Typography>
          <Grid container spacing={3}>
            {recommendedProducts.length > 0 ? (
              recommendedProducts.map((rec) => (
                <Grid item xs={12} md={4} key={rec.productId}>
                  <Link to={`/product/${rec.productId}`} style={{ textDecoration: "none" }}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={rec.image_url}
                        alt={rec.name}
                        sx={{ objectFit: "contain", padding: 2 }}
                      />
                      <CardContent>
                        <Typography variant="subtitle1" color="text.primary" fontWeight="bold">
                          {rec.name}
                        </Typography>
                        <Typography
                          component="div"
                          sx={{
                            color: "#1f1c66",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "left",
                            alignItems: "baseline",
                            mt: 1,
                          }}
                        >
                          {(() => {
                            const [dollars, cents] = rec.price.toFixed(2).split(".");
                            return (
                              <>
                                <span style={{ fontSize: "24px", fontWeight: 700 }}>${dollars}</span>
                                <span style={{ fontSize: "14px", marginLeft: "2px" }}>.{cents}</span>
                              </>
                            );
                          })()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              ))
            ) : (
              <Typography color="white">No recommended products found.</Typography>
            )}
          </Grid>
        </Box>
      </Box>
  
      <Box component="footer" className="bg-dark text-white text-center py-3 mt-auto">
        <Typography color="white">© 2025 Neptune. All Rights Reserved.</Typography>
      </Box>
    </Box>
  );
}
  
function TableSection({ product }) {
  return (
    <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
      <Table size="big">
        <TableBody>
          <TableRow>
            <TableCell>Model</TableCell>
            <TableCell>{product.model}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Serial Number</TableCell>
            <TableCell>{product.serialNumber}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Stock</TableCell>
            <TableCell>{product.quantity} Available</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Warranty</TableCell>
            <TableCell>{product.warrantyStatus} Years</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Distributor</TableCell>
            <TableCell>{product.distributor}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}