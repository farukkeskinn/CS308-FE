import { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Link as MuiLink, Button } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:8080/orderpage", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      }
    };

    fetchOrders();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Content Area */}
      <Box sx={{ flexGrow: 1, px: { xs: 2, md: 10 }, py: 5, backgroundColor: "#f5f5f5" }}>
        <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
          Order History
        </Typography>

        {orders.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: "center", backgroundColor: "white" }}>
            <Typography variant="h6" gutterBottom>
              No purchase has been made.
            </Typography>
            <Typography>
              Make your first purchase now!{" "}
              <MuiLink component={Link} to="/" color="primary" underline="hover">
                Continue Shopping
              </MuiLink>
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} md={6} key={order.order_id}>
                <Paper elevation={3} sx={{ p: 3, backgroundColor: "white" }}>
                  <Typography variant="h6" gutterBottom>
                    Order ID: {order.order_id}
                  </Typography>
                  <Typography>Total Price: ${order.total_price}</Typography>
                  <Typography>
                    Order Date: {new Date(order.order_date).toLocaleString()}
                  </Typography>
                  <Typography>Order Status: {order.order_status}</Typography>
                  <Typography>Payment Status: {order.payment_status}</Typography>
                  {order.invoice_link && (
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ mt: 1 }}
                      component="a"
                      href={order.invoice_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Invoice
                    </Button>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Sticky Footer */}
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
