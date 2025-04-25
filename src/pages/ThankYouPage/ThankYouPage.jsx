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
import { useLocation } from "react-router-dom";

const ThankYouPage = () => {
  const [showInvoice, setShowInvoice] = useState(false);
  const { cartItems } = useCartContext();
  const theme = useTheme();
  const location = useLocation();

  const invoicePdfUrl = location.state?.invoicePdfUrl || null;
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
        <>
          {invoicePdfUrl ? (
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Your Official Invoice (PDF)
              </Typography>
              <iframe
                src={invoicePdfUrl}
                title="Invoice PDF"
                width="100%"
                height="600px"
                style={{ border: "1px solid #ccc", borderRadius: "8px" }}
              />
            </Box>
          ) : (
            <Typography
              color="error"
              textAlign="center"
              sx={{ mt: 4, fontWeight: 500 }}
            >
              Invoice file not available.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default ThankYouPage;
