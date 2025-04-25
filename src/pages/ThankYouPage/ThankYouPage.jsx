import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
} from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const ThankYouPage = () => {
  const [showInvoice, setShowInvoice] = useState(false);
  const location = useLocation();
  const invoicePdfUrl = location.state?.invoicePdfUrl || null;

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh", // Full viewport height
    }}>
      {/* Main content - flex-grow will push footer down */}
      <Box
        sx={{
          flexGrow: 1, // This makes the content area expand
          py: 6,
          px: { xs: 3, md: 10 },
          backgroundColor: "rgba(255, 255, 255, 0.7)", // Transparent white background
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={6}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              mb: 5,
              textAlign: "center",
              backgroundColor: "rgba(255, 255, 255, 0.85)", // Transparent white paper
              borderLeft: `6px solid #1f1c66`, // Neptune blue accent
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: "#1f1c66" }}>
                🎉 Thank You!
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Your order has been placed successfully.
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                We truly appreciate your business and hope you enjoy your purchase.
              </Typography>
            </Box>

            <Box sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
              mt: 4
            }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingBagIcon />}
                component={Link}
                to="/"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.2,
                  backgroundColor: "#1f1c66",
                  "&:hover": {
                    backgroundColor: "#161446",
                  },
                }}
              >
                Continue Shopping
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<ReceiptLongIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.2,
                  borderColor: "#1f1c66",
                  color: "#1f1c66",
                  "&:hover": {
                    borderColor: "#161446",
                    backgroundColor: "rgba(31, 28, 102, 0.04)",
                  },
                }}
                onClick={() => setShowInvoice((prev) => !prev)}
              >
                {showInvoice ? "Hide Invoice" : "View Invoice"}
              </Button>
            </Box>
          </Paper>

          {showInvoice && (
            <Paper
              elevation={3}
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 2,
                backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent white
                transition: "all 0.3s ease",
                borderLeft: `4px solid #1f1c66`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: "#1f1c66" }}>
                Your Official Invoice
              </Typography>

              {invoicePdfUrl ? (
                <Box mt={2}>
                  <iframe
                    src={invoicePdfUrl}
                    title="Invoice PDF"
                    width="100%"
                    height="600px"
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      backgroundColor: "#f9f9f9"
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{
                  p: 4,
                  textAlign: "center",
                  backgroundColor: "rgba(255, 249, 249, 0.8)", // Transparent error background
                  borderRadius: 1,
                  border: "1px dashed #ffcdd2"
                }}>
                  <Typography
                    color="error"
                    sx={{ fontWeight: 500 }}
                  >
                    Invoice file not available. Please contact customer support.
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Container>
      </Box>

      {/* Footer - now properly at the bottom */}
      <Box
        component="footer"
        sx={{
          backgroundColor: "#212529",
          color: "white",
          textAlign: "center",
          py: 2,
          mt: "auto",
        }}
      >
        &copy; 2025 Neptune. All rights reserved.
      </Box>
    </Box>
  );
};

export default ThankYouPage;