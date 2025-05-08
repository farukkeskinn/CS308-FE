// src/pages/ProductDashboard/ManageOrders.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

export default function ManageOrders() {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);

  // Confirm‐status dialog state
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentStatus, setCurrentStatus]     = useState("");
  const [nextStatus, setNextStatus]           = useState("");

  // Address‐view dialog state
  const [addrDialogOpen, setAddrDialogOpen]   = useState(false);
  const [addressData, setAddressData]         = useState(null);

  // load all orders
  const loadOrders = () => {
    setLoading(true);
    axios.get("http://localhost:8080/api/orders")
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // compute next in PROCESSING → IN_TRANSIT → DELIVERED
  const calcNextStatus = s =>
    s === "PROCESSING" ? "IN_TRANSIT"
  : s === "IN_TRANSIT"  ? "DELIVERED"
  : /* else */           null;

  const openConfirm = o => {
    const ns = calcNextStatus(o.orderStatus);
    if (!ns) return; // already DELIVERED
    setSelectedOrderId(o.orderId);
    setCurrentStatus(o.orderStatus);
    setNextStatus(ns);
    setDialogOpen(true);
  };

  const onConfirm = () => {
    setDialogOpen(false);
    setLoading(true);

    axios
      .patch(
        `http://localhost:8080/api/product-managers/orders/${selectedOrderId}/status`,
        null,
        { params: { status: nextStatus } }
      )
      .catch(console.error)
      .finally(() => loadOrders());
  };

  // open address dialog using the already-fetched shippingAddress
  const openAddressDialog = o => {
    if (!o.shippingAddress) {
      return alert("No shipping address available");
    }
    setAddressData(o.shippingAddress);
    setAddrDialogOpen(true);
  };

  if (loading) {
    return (
      <Box textAlign="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Manage Orders
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Total Price</TableCell>
            <TableCell>Order Status</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {orders.map(o => {
            const ns = calcNextStatus(o.orderStatus);
            return (
              <TableRow key={o.orderId}>
                <TableCell>{o.orderId}</TableCell>
                <TableCell>${o.totalPrice.toFixed(2)}</TableCell>
                <TableCell>{o.orderStatus}</TableCell>

                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openAddressDialog(o)}
                  >
                    View Address
                  </Button>
                </TableCell>

                <TableCell>
                  {ns
                    ? <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        onClick={() => openConfirm(o)}
                      >
                        Change Order Status
                      </Button>
                    : <Typography>Delivered</Typography>
                  }
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Confirm Status Change Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Change status from <strong>{currentStatus}</strong> to{" "}
            <strong>{nextStatus}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onConfirm}>
            Yes, change
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Address Dialog */}
      <Dialog open={addrDialogOpen} onClose={() => setAddrDialogOpen(false)}>
        <DialogTitle>Shipping Address</DialogTitle>
        <DialogContent>
          {addressData ? (
            <>
              <Typography gutterBottom>
                <strong>Name:</strong> {addressData.addressName}
              </Typography>
              <Typography>
                <strong>Address:</strong> {addressData.addressLine}
              </Typography>
            </>
          ) : (
            <Typography color="error">
              No address information available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
