import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";


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

  const increaseQuantity = async (index, newQuantity) => {
    const updatedCart = [...cartItems];
    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");
  
    // 🔐 Logged-in user: update DB
    if (jwtToken && customerId) {
      try {
        const product = updatedCart[index]; // productId is required
        await fetch("http://localhost:8080/api/cart-management/add-item", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            customerId,
            productId: product.productId,
            quantity: 1, // increase by 1
          }),
        });
      } catch (error) {
        console.error("Error increasing quantity on server:", error);
      }
    }
  
    // 🧠 Local cart update
    if (newQuantity === 0) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = newQuantity;
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
        console.log("🧾 PATCHING /remove-item-quantity with:", {
          itemId: item?.shopping_cart_item_id,
          quantity: 1,
        });
        await fetch("http://localhost:8080/api/cart-management/remove-item-quantity", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          
          body: JSON.stringify({
            itemId: item.shopping_cart_item_id, // must be from cart item
            quantity: 1,
          }),
        });
      } catch (error) {
        console.error("Error decreasing quantity on server:", error);
      }
    }
  
    // 🧠 Local cart update
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
    console.log("🗑 Removing from backend:", removedItem.shopping_cart_item_id);
    if (jwtToken && customerId && removedItem?.shopping_cart_item_id) {
      try {
        await fetch(`http://localhost:8080/api/cart-management/remove-item/${removedItem.shopping_cart_item_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
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


  const handleCheckout = async () => {
    if (!localStorage.getItem("jwtToken")) {
      setOpenDialog(true);
      return;
    }
  
    if (hasOutOfStockItem) {
      setErrorMessage("⚠️ Please remove out-of-stock items to proceed.");
      return;
    }
  
    try {
      const itemsToSend = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      console.log("Sending to backend:", {
        items: itemsToSend,
        customerId: localStorage.getItem("customerId"),
        cart_status: "IN CART",
        cartStatus: "IN CART",

        
      });
      await axios.post(
        "http://localhost:8080/api/cart-management/add-item",
        {
          customerId: localStorage.getItem("customerId"),
          items: itemsToSend, 
          cart_status: "IN CART"
        }, // Adjust if your backend expects a different structure
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      navigate("/checkout");
    } catch (error) {
      if (error.response) {
        // Backend responded with an error status
        const status = error.response.status;
  
        if (status === 404) {
          setErrorMessage("❌ Server endpoint not found. Please check the URL or consult backend team.");
        } else if (status === 400) {
          setErrorMessage("❌ Invalid request format. Make sure your cart data matches backend expectations.");
        } else if (status === 401 || status === 403) {
          setErrorMessage("🔐 Unauthorized request. Please log in again.");
        } else {
          setErrorMessage(`❌ Server error (${status}). Please try again later.`);
        }
      } else if (error.request) {
        // Request made but no response
        setErrorMessage("🚫 Cannot reach backend server. Check network or server status.");
      } else {
        // Something else went wrong setting up the request
        setErrorMessage("❗ Unexpected error while preparing your request.");
      }
  
      console.error("Checkout failed:", error);
    }
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