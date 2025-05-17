import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CssBaseline,
  createTheme,
  ThemeProvider,
} from "@mui/material";

// Dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
    error: { main: "#f44336" },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: "bold" },
  },
});

const DeliveredOrders = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/api/deliveries")
      .then((res) => {
        
        const filtered = res.data.filter(d => d.deliveryStatus === "DELIVERED");
        setDeliveries(filtered);
      })
      .catch((err) => console.error("Error fetching deliveries:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box p={4} sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom color="white">
          Delivered Orders
        </Typography>

        {loading ? (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        ) : deliveries.length === 0 ? (
          <Box textAlign="center" p={2}>
            <Typography color="white">No delivered orders found.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 3, backgroundColor: "background.paper" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#333" }}>
                <TableRow>
                  <TableCell sx={{ color: "#f1f1f1" }}>Delivery ID</TableCell>
                  <TableCell sx={{ color: "#f1f1f1" }}>Order ID</TableCell>
                  <TableCell sx={{ color: "#f1f1f1" }}>Delivery Status</TableCell>
                  <TableCell sx={{ color: "#f1f1f1" }}>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow
                    key={delivery.deliveryId}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#2a2a2a",
                        transition: "background-color 0.3s",
                      },
                    }}
                  >
                    <TableCell sx={{ color: "#e0e0e0" }}>{delivery.deliveryId}</TableCell>
                    <TableCell sx={{ color: "#e0e0e0" }}>{delivery.order?.orderId || "N/A"}</TableCell>
                    <TableCell sx={{ color: "#e0e0e0" }}>{delivery.deliveryStatus}</TableCell>
                    <TableCell sx={{ color: "#e0e0e0" }}>
                      {delivery.address?.addressName} – {delivery.address?.addressLine}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default DeliveredOrders;
