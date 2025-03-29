import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import HomeIcon from '@mui/icons-material/Home';
import { useCartContext } from "../../context/CartContext";

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const { setCartItems: updateContextCart } = useCartContext();
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    setCartItems(storedCart);
  }, []);

  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);

  const hasOutOfStockItem = cartItems.some((item) => item.stock === 0);

  const updateQuantity = (index, newQuantity) => {
    const updatedCart = [...cartItems];
    if (newQuantity === 0) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = newQuantity;
    }
    setCartItems(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    updateContextCart(updatedCart);
  };

  const removeItemFromCart = (index) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    updateContextCart(updatedCart);
  };

  const emptyCart = () => {
    setCartItems([]);
    localStorage.removeItem("shoppingCart");
    updateContextCart([]);
  };

  const handleCheckout = () => {
    if (!localStorage.getItem("jwtToken")) {
      setOpenDialog(true);
      return;
    }
    if (hasOutOfStockItem) {
      setErrorMessage("⚠️ Please remove out-of-stock items to proceed.");
      return;
    }
    navigate("/checkout");
  };

  return (
    <Box sx={{ py: 5, px: { xs: 2, md: 10 } }}>
      {/* Başlık Kutusu */}
      <Paper
        elevation={3}
        sx={{ backgroundColor: "white", p: 4, textAlign: "center", mb: 4 }}
      >
        <Typography variant="h4" fontWeight="bold">
          Shopping Cart
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Lacivert Arka Planlı Kutucuk */}
        <Grid item xs={12} md={8}>
          <Box sx={{ backgroundColor: "#1f1c66", p: 3, borderRadius: 2 }}>
            {cartItems.length === 0 ? (
              <Typography color="white">Your cart is empty.</Typography>
            ) : (
              cartItems.map((item, idx) => (
                <Card key={item.productId} sx={{ mb: 3, display: 'flex', p: 2, alignItems: 'center' }}>
                  <Link to={`/product/${item.productId}`}>
                    <CardMedia
                      component="img"
                      image={item.image_url}
                      alt={item.name}
                      sx={{ width: 120, height: 120, objectFit: "cover" }}
                    />
                  </Link>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Link to={`/product/${item.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="h6">{item.name}</Typography>
                    </Link>
                    <Typography variant="body2">{item.description}</Typography>
                    {item.stock === 0 ? (
                      <Typography color="error" fontWeight="bold">
                        Out of Stock
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">In Stock: {item.stock}</Typography>
                    )}
                  </CardContent>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      sx={{
                        color: "#1f1c66",
                        fontWeight: "bold",
                        mt: 1,
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "flex-end",
                      }}
                    >
                      {(() => {
                        const [dollars, cents] = (item.price * item.quantity).toFixed(2).split(".");
                        return (
                          <>
                            <span style={{ fontSize: "20px", fontWeight: 700 }}>${dollars}</span>
                            <span style={{ fontSize: "14px", marginLeft: "2px" }}>.{cents}</span>
                          </>
                        );
                      })()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => updateQuantity(idx, item.quantity - 1)}
                        disabled={item.quantity === 1}
                      >
                        -
                      </Button>
                      <Typography mx={2}>{item.quantity}</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => updateQuantity(idx, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </Box>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => removeItemFromCart(idx)}
                    >
                      Remove
                    </Button>
                  </Box>
                </Card>
              ))
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Total: ${totalPrice}</Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ my: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingCartCheckoutIcon />}
              onClick={handleCheckout}
              sx={{
                mt: 2,
                backgroundColor: "#1f1c66",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#181552",
                  transform: "scale(1.02)",
                },
                "&:active": {
                  transform: "scale(0.96)",
                },
              }}
            >
              Go To Checkout
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<HomeIcon />}
              component={Link}
              to="/"
              sx={{
                mt: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.02)",
                  backgroundColor: "#f5f5f5",
                },
                "&:active": {
                  transform: "scale(0.96)",
                },
              }}
            >
              Continue Shopping
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={emptyCart}
              sx={{
                mt: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#c62828",
                  transform: "scale(1.02)",
                },
                "&:active": {
                  transform: "scale(0.96)",
                },
              }}
            >
              Empty Cart
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Popup Dialog on Unauthorized Checkout */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>Please login to proceed to checkout.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
