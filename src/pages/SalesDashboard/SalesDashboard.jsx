import {
  Box, Typography, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

export default function SalesDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/api/sales-managers/orders").then(res => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Sales Manager Panel
      </Typography>

      <Typography variant="h6" mt={4}>Invoices</Typography>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.orderId}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>{order.orderStatus}</TableCell>
                  <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
