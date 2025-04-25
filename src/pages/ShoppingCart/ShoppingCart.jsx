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
  const { setCartItems: updateContextCart } = useCartContext();
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const { cartItems, setCartItems, fetchUserCart } = useCartContext();


  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    setCartItems(storedCart);
  }, [setCartItems]);

  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);

  const hasOutOfStockItem = cartItems.some((item) => item.stock === 0);

  const increaseQuantity = async (index, newQuantity) => {
    const updatedCart = [...cartItems];
    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    // 🔐 Logged-in user: update DB
    if (jwtToken && customerId) {
      try {
        const product = updatedCart[index].product; // ✅ fix: use .product for logged-in cart
        const response = await fetch("http://localhost:8080/api/cart-management/add-item", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            customerId,
            productId: product.productId,
            quantity: 1,
          }),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          if (result.message === "There is no enough stock") {
            alert("There is no enough stock");
            return;
          } else {
            await fetchUserCart(customerId, jwtToken); // ✅ Refresh cart from DB
            return;
          }
        } else {
          console.error("Cart API error:", result.message);
          return;
        }
      } catch (err) {
        console.error("Error while adding to cart:", err);
        return;
      }
    }
    // 👤 Guest user logic
    const stock = updatedCart[index].stock;
  
    if (newQuantity > stock) {
      alert(`Only ${stock} units available in stock.`);
      return;
    }
  
    if (newQuantity === 0) {
      updatedCart.splice(index, 1);
    } else {
      console.log("Updating quantity:", newQuantity);
      updatedCart[index].quantity = newQuantity;
      console.log("Updated cart:", updatedCart);
    }

    setCartItems(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    updateContextCart(updatedCart);
  };

  const decreaseQuantity = async (index, newQuantity) => {
    const updatedCart = [...cartItems];
    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    // 🔐 Logged-in user: update DB
    if (jwtToken && customerId) {
      try {
        const item = updatedCart[index];
        const response = await fetch("http://localhost:8080/api/cart-management/remove-item-quantity", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },

          body: JSON.stringify({
            itemId: item.shoppingCartItemId,
            quantity: 1,
          }),
        });
  
        if (!response.ok) {
          console.error("Failed to decrease quantity:", await response.text());
          return;
        }
  
        // ✅ Always sync with backend after any quantity change
        await fetchUserCart(customerId, jwtToken);
        return; // 🔁 Let fetchUserCart handle UI update
      } catch (error) {
        console.error("Error decreasing quantity on server:", error);
        return;
      }
    }

    if (newQuantity === 0) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = newQuantity;
    }

    setCartItems(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    updateContextCart(updatedCart);
  };

  const removeItemFromCart = async (index) => {
    const updatedCart = [...cartItems];
    const removedItem = updatedCart[index];

    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    // 🔐 Send delete to backend if logged in
    console.log("🗑 Removing from backend:", removedItem.shoppingCartItemId);
    if (jwtToken && customerId && removedItem?.shoppingCartItemId) {
      try {
        await fetch(`http://localhost:8080/api/cart-management/remove-item/${removedItem.shoppingCartItemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        // ✅ Refresh cart from DB to sync quantities + item IDs
        await fetchUserCart(customerId, jwtToken);
        return;
      } catch (error) {
        console.error("❌ Failed to remove item from server:", error);
      }
    }

    // ✅ Local update (unchanged)
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    updateContextCart(updatedCart);
  };

  const emptyCart = async () => {
    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    if (!jwtToken || !customerId) {
      // Guest fallback
      setCartItems([]);
      localStorage.removeItem("shoppingCart");
      return;
    }

    try {
      // Step 1: Fetch cart to get cartId
      const cartRes = await fetch(`http://localhost:8080/api/cart-management/cart-by-customer/${customerId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!cartRes.ok) {
        console.error("Failed to fetch cart to clear:", cartRes.status);
        return;
      }

      const cart = await cartRes.json();
      const cartId = cart.cartId;

      // Step 2: Send DELETE request
      const deleteRes = await fetch(`http://localhost:8080/api/cart-management/clear-cart/${cartId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (deleteRes.ok) {
        // Step 3: Clear context + localStorage
        setCartItems([]);
        localStorage.removeItem("shoppingCart");
      } else {
        console.error("Failed to clear cart:", deleteRes.status);
      }
    } catch (err) {
      console.error("Cart clear error:", err);
    }
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

    if (cartItems.length === 0) {
      setErrorMessage("🛒 Your cart is empty.");
      return;
    }

    // ✅ All checks passed – proceed
    navigate("/checkout");
  };




  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Content Wrapper */}
      <Box sx={{ flexGrow: 1, py: 5, px: { xs: 2, md: 10 } }}>
        <Paper
          elevation={3}
          sx={{ backgroundColor: "white", p: 4, textAlign: "center", mb: 4 }}
        >
          <Typography variant="h4" fontWeight="bold">
            Shopping Cart
          </Typography>
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ backgroundColor: "#1f1c66", p: 3, borderRadius: 2 }}>
              {cartItems.length === 0 ? (
                <Typography color="white">Your cart is empty.</Typography>
              ) : (
                cartItems.map((item, idx) => (
                  <Card
                    key={item.productId}
                    sx={{ mb: 3, display: "flex", p: 2, alignItems: "center" }}
                  >
                    <Link to={`/product/${item.productId}`}>
                      <CardMedia
                        component="img"
                        image={item.image_url}
                        alt={item.name}
                        sx={{ width: 120, height: 120, objectFit: "cover" }}
                      />
                    </Link>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Link
                        to={`/product/${item.productId}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Typography variant="h6">{item.name}</Typography>
                      </Link>
                      <Typography variant="body2">{item.description}</Typography>
                      {item.stock === 0 ? (
                        <Typography color="error" fontWeight="bold">
                          Out of Stock
                        </Typography>
                      ) : (
                        <Typography color="text.secondary">
                          In Stock: {item.stock}
                        </Typography>
                      )}
                    </CardContent>
                    <Box sx={{ textAlign: "right" }}>
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
                          const [dollars, cents] = (
                            item.price * item.quantity
                          )
                            .toFixed(2)
                            .split(".");
                          return (
                            <>
                              <span style={{ fontSize: "20px", fontWeight: 700 }}>
                                ${dollars}
                              </span>
                              <span style={{ fontSize: "14px", marginLeft: "2px" }}>
                                .{cents}
                              </span>
                            </>
                          );
                        })()}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          mt: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => decreaseQuantity(idx, item.quantity - 1)}
                          disabled={item.quantity === 1}
                        >
                          -
                        </Button>
                        <Typography mx={2}>{item.quantity}</Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => increaseQuantity(idx, item.quantity + 1)}
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

      {/* Sticky footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: "#212529",
          color: "white",
          textAlign: "center",
          py: 2,
          mt: "auto",
          width: "100%",
        }}
      >
        &copy; 2025 Neptune. All rights reserved.
      </Box>
    </Box>
  );
}  