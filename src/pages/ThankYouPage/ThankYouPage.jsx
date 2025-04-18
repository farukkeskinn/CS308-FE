import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  useTheme,
} from "@mui/material";
import { useCartContext } from "../../context/CartContext";

const ThankYouPage = () => {
  const [showInvoice, setShowInvoice] = useState(false);
  const { cartItems } = useCartContext();
  const theme = useTheme();

  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);
  const fullName = cartItems[0]?.customerName || "John Doe";

  return (
    <Box
      sx={{
        py: 6,
        px: { xs: 3, md: 10 },
        backgroundColor: "#f7fbff",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          mb: 5,
          textAlign: "center",
          background: "linear-gradient(to right, #e0f7fa, #fce4ec)",
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
          🎉 Thank You!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your order has been placed successfully.
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          We truly appreciate your business, <strong>{fullName}</strong>.
        </Typography>
      </Paper>

      <Box textAlign="center">
        <Button
          variant="contained"
          size="large"
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            backgroundColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
          onClick={() => setShowInvoice((prev) => !prev)}
        >
          {showInvoice ? "Hide Invoice" : "View Invoice"}
        </Button>
      </Box>

      {showInvoice && (
        <Paper
          elevation={4}
          sx={{
            p: { xs: 4, md: 5 },
            mt: 5,
            borderRadius: 4,
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🧾 Invoice Summary
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            Customer: <strong>{fullName}</strong>
          </Typography>
          <Divider sx={{ my: 2 }} />

          {cartItems.map((item) => (
            <Box key={item.productId} sx={{ mb: 2 }}>
              <Grid container justifyContent="space-between">
                <Typography>
                  {item.name} × {item.quantity}
                </Typography>
                <Typography color="text.secondary">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Grid>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}

          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mt: 3, textAlign: "right" }}
          >
            Total: ${totalPrice}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ThankYouPage;