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
  DialogActions,
  Paper
} from "@mui/material";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [nextStatus, setNextStatus] = useState("");

  const [addrDialogOpen, setAddrDialogOpen] = useState(false);
  const [addressData, setAddressData] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders`)
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const calcNextStatus = s =>
    s === "PROCESSING" ? "IN_TRANSIT"
      : s === "IN_TRANSIT" ? "DELIVERED"
        : null;

  const openConfirm = o => {
    const ns = calcNextStatus(o.orderStatus);
    if (!ns) return;
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
        `${process.env.REACT_APP_API_BASE_URL}/api/product-managers/orders/${selectedOrderId}/status`,
        null,
        { params: { status: nextStatus } }
      )
      .catch(console.error)
      .finally(() => loadOrders());
  };

  const openAddressDialog = o => {
    if (!o.shippingAddress) return alert("No shipping address available");
    setAddressData(o.shippingAddress);
    setAddrDialogOpen(true);
  };

  if (loading) {
    return (
      <Box textAlign="center" p={4} sx={{ backgroundColor: "#000", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4} sx={{ backgroundColor: "#000", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom sx={{ color: "#fff" }}>
        Manage Orders
      </Typography>

      <Paper sx={{ backgroundColor: "#111", color: "#fff" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Order ID", "Total Price", "Order Status", "Address", "Invoice", "Action"].map(header => (
                <TableCell key={header} sx={{ color: "#fff", fontWeight: "bold" }}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.map(o => {
              const ns = calcNextStatus(o.orderStatus);
              return (
                <TableRow key={o.orderId} sx={{ '&:hover': { backgroundColor: "#1a1a1a" } }}>
                  <TableCell sx={{ color: "#fff" }}>{o.orderId}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>${o.totalPrice.toFixed(2)}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{o.orderStatus}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => openAddressDialog(o)}>
                      View Address
                    </Button>
                  </TableCell>
                  <TableCell>
                    {o.invoiceLink ? (
                      <Button size="small" variant="outlined" onClick={() => window.open(o.invoiceLink, "_blank")}>
                        View Invoice
                      </Button>
                    ) : (
                      <Typography sx={{ color: "#888" }}>Not Available</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {ns ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        onClick={() => openConfirm(o)}
                      >
                        Change Order Status
                      </Button>
                    ) : (
                      <Typography sx={{ color: "#aaa" }}>Delivered</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

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
          <Button variant="contained" onClick={onConfirm}>Yes, change</Button>
        </DialogActions>
      </Dialog>

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
            <Typography color="error">No address information available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
