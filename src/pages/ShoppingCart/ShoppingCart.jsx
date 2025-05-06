import { useEffect, useState, useRef } from "react";
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
  CircularProgress,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import HomeIcon from '@mui/icons-material/Home';
import { useCartContext } from "../../context/CartContext";

export default function ShoppingCart() {
  const { cartItems, setCartItems, fetchUserCart, updateContextCart } = useCartContext();
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Use ref to track if initial fetch is complete
  const initialFetchDone = useRef(false);

  useEffect(() => {
    const loadCart = async () => {
      if (initialFetchDone.current) return; // Skip if already fetched

      setLoading(true);
      const jwtToken = localStorage.getItem("jwtToken");
      const customerId = localStorage.getItem("customerId");

      try {
        if (jwtToken && customerId) {
          // User is logged in, load cart from backend
          console.log("Fetching cart from backend...");
          await fetchUserCart(customerId, jwtToken);
        } else {
          // Guest user, load from localStorage
          console.log("Loading cart from localStorage...");
          const storedCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
          setCartItems(storedCart);
        }

        initialFetchDone.current = true; // Mark initial fetch as complete
      } catch (error) {
        console.error("Failed to load cart:", error);
        // Fallback to local storage if API fails
        const storedCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        setCartItems(storedCart);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [fetchUserCart, setCartItems]);

  // Log cart items for debugging
  useEffect(() => {
    console.log("Current cart items:", cartItems);
  }, [cartItems]);

  // Calculate total price safely
  const totalPrice = cartItems
    .reduce((acc, item) => {
      // Handle different item structures
      const price = getItemDetails(item).price;
      const quantity = getItemDetails(item).quantity;
      return acc + (price * quantity);
    }, 0)
    .toFixed(2);

  // Check for out-of-stock items
  const hasOutOfStockItem = cartItems.some(item =>
    getItemDetails(item).stock === 0
  );

  const increaseQuantity = async (index, newQuantity) => {
    const updatedCart = [...cartItems];
    const item = updatedCart[index];
    const itemDetails = getItemDetails(item);

    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    // Prevent exceeding stock
    if (newQuantity > itemDetails.stock) {
      alert(`Only ${itemDetails.stock} units available in stock.`);
      return;
    }

    // Update local state immediately
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);

    // Logged-in user - update backend
    if (jwtToken && customerId) {
      try {
        // Get the proper productId based on item structure
        const productId = item.product ? item.product.productId : item.productId;

        await fetch("http://localhost:8080/api/cart-management/add-item", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            customerId,
            productId: productId,
            quantity: 1,
          }),
        });

        // We don't need to refresh the cart - the local state is already updated
      } catch (err) {
        console.error("Error while adding to cart:", err);
      }
    } else {
      // Guest user - update localStorage
      localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    }
  };

  const decreaseQuantity = async (index, newQuantity) => {
    if (newQuantity === 0) {
      removeItemFromCart(index);
      return;
    }

    const updatedCart = [...cartItems];
    const item = updatedCart[index];

    // Update local state immediately
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);

    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    // Logged-in user - update backend
    if (jwtToken && customerId && item.shoppingCartItemId) {
      try {
        await fetch("http://localhost:8080/api/cart-management/remove-item-quantity", {
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

        // We don't need to refresh the cart - the local state is already updated
      } catch (error) {
        console.error("Error decreasing quantity on server:", error);
      }
    } else {
      // Guest user - update localStorage
      localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    }
  };

  const removeItemFromCart = async (index) => {
    const updatedCart = [...cartItems];
    const removedItem = updatedCart[index];

    // Update local state immediately
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);

    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    // Logged-in user - update backend
    if (jwtToken && customerId && removedItem?.shoppingCartItemId) {
      try {
        await fetch(`http://localhost:8080/api/cart-management/remove-item/${removedItem.shoppingCartItemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        // We don't need to refresh the cart - the local state is already updated
      } catch (error) {
        console.error("Failed to remove item from server:", error);
      }
    } else {
      // Guest user - update localStorage
      localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    }
  };

  const emptyCart = async () => {
    // Update local state immediately
    setCartItems([]);

    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    if (!jwtToken || !customerId) {
      // Guest user - update localStorage
      localStorage.removeItem("shoppingCart");
      return;
    }

    try {
      // Get cart ID
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

      // Clear cart on backend
      await fetch(`http://localhost:8080/api/cart-management/clear-cart/${cartId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      // We don't need to refresh the cart - the local state is already updated
      localStorage.removeItem("shoppingCart");
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

    // All checks passed – proceed
    navigate("/checkout");
  };

  // Helper function to normalize item details
  function getItemDetails(item) {
    // If the item has a product field (DB format)
    if (item.product) {
      const product = item.product || {};
      const category = product.category || {};

      return {
        id: product.productId || "",
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        stock: product.stock || 0,
        image_url: product.image_url || "",
        quantity: item.quantity || 1,
        categoryName: category.categoryName || "Uncategorized"
      };
    }

    // If the item has direct fields (localStorage format)
    return {
      id: item.productId || "",
      name: item.name || "",
      description: item.description || "",
      price: item.price || 0,
      stock: item.stock || 0,
      image_url: item.image_url || "",
      quantity: item.quantity || 1,
      categoryName: item.categoryName || (item.category && item.category.categoryName) || "Uncategorized"
    };
  }

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

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" py={4}>
            <CircularProgress />
            <Typography variant="h6" mt={2}>
              Loading your cart...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Box sx={{ backgroundColor: "#1f1c66", p: 3, borderRadius: 2 }}>
                {cartItems.length === 0 ? (
                  <Typography color="white">Your cart is empty.</Typography>
                ) : (
                  cartItems.map((item, idx) => {
                    const itemDetails = getItemDetails(item);

                    return (
                      <Card
                        key={idx}
                        sx={{ mb: 3, display: "flex", p: 2, alignItems: "center" }}
                      >
                        <Link to={`/product/${itemDetails.id}`}>
                          <CardMedia
                            component="img"
                            image={itemDetails.image_url}
                            alt={itemDetails.name}
                            sx={{ width: 120, height: 120, objectFit: "cover" }}
                          />
                        </Link>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Link
                            to={`/product/${itemDetails.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <Typography variant="h6">{itemDetails.name}</Typography>
                          </Link>
                          <Typography variant="body2">{itemDetails.description}</Typography>
                          {itemDetails.stock === 0 ? (
                            <Typography color="error" fontWeight="bold">
                              Out of Stock
                            </Typography>
                          ) : (
                            <Typography color="text.secondary">
                              In Stock: {itemDetails.stock}
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
                                itemDetails.price * itemDetails.quantity
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
                              onClick={() => decreaseQuantity(idx, itemDetails.quantity - 1)}
                              disabled={itemDetails.quantity <= 1}
                            >
                              -
                            </Button>
                            <Typography mx={2}>{itemDetails.quantity}</Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => increaseQuantity(idx, itemDetails.quantity + 1)}
                              disabled={itemDetails.quantity >= itemDetails.stock}
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
                    );
                  })
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
        )}

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