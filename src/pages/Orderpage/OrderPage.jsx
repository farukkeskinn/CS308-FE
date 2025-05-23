import { useEffect, useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Rating, TextField, Grid, Paper } from "@mui/material";
import { Link } from "react-router-dom";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [openItemsDialog, setOpenItemsDialog] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'cancel' | 'refund', orderId }
  const [refundReason, setRefundReason] = useState("Didn't like the product");


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const customerId = localStorage.getItem("customerId");
        const jwtToken = localStorage.getItem("jwtToken");
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/by-customer/${customerId}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const enrichItemsWithImages = async () => {
      const enriched = await Promise.all(
        selectedOrderItems.map(async (item) => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/${item.productId}`);
            if (!response.ok) throw new Error("Failed to fetch product image");
            const product = await response.json();
            return { ...item, image: product.image_url };
          } catch (err) {
            console.error("Failed to fetch product image:", err);
            return item;
          }
        })
      );
      setSelectedOrderItems(enriched);
    };

    if (openItemsDialog && selectedOrderItems.length > 0 && !selectedOrderItems[0].image) {
      enrichItemsWithImages();
    }
  }, [openItemsDialog, selectedOrderItems]);

  const handleSubmitReview = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const customerId = localStorage.getItem("customerId");
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/${customerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          productId: selectedProductId,
          rating,
          comment,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      alert("Review submitted!");
      setOpenReviewDialog(false);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Could not submit review. Try again later.");
    }
  };

  const handleConfirmAction = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");

      let response;
      console.log("Confirm action:", confirmAction);

      if (confirmAction?.type === "cancel") {
        // Cancel full order
        const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/orders/${confirmAction.orderId}/cancel`;
        console.log("my endpoint", endpoint);
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
      } else if (confirmAction?.type === "refund-all") {
        // Refund full order
        const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/refunds/request-all/${confirmAction.orderId}`;
        console.log("my endpoint", endpoint);
        console.log("confirmAction", confirmAction);
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
      } else {
        throw new Error("Unsupported action type");
      }

      if (!response.ok) throw new Error("Request failed");

      alert(
        confirmAction?.type === "cancel"
          ? "Order successfully cancelled."
          : confirmAction?.type === "refund-item"
            ? "Refund request submitted for item."
            : "Full order refund submitted."
      );

      // Optional: update UI state or re-fetch orders
    } catch (error) {
      console.error("Action failed:", error);
      alert("Something went wrong. Try again later.");
    } finally {
      setConfirmDialogOpen(false);
    }
  };



  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", py: 5, px: { xs: 2, md: 10 } }}>
      <Paper elevation={3} sx={{ backgroundColor: "white", p: 4, textAlign: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Order History
        </Typography>
      </Paper>

      {orders.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: "center", backgroundColor: "white" }}>
          <Typography variant="h6" gutterBottom>
            No purchase has been made.
          </Typography>
          <Typography>
            Make your first purchase now!{' '}
            <Link to="/" style={{ color: '#1976d2' }}>Continue Shopping</Link>
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ backgroundColor: "white", p: 3 }}>
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Order ID</th>
                <th scope="col">Order Date</th>
                <th scope="col">Total Price</th>
                <th scope="col">Status</th>
                <th scope="col">Payment</th>
                <th scope="col">Invoice</th>
                <th scope="col">Items</th>
                <th scope="col">Cancel/Refund</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.orderId}>
                  <th scope="row">{index + 1}</th>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {order.orderId}
                  </td>
                  <td>{new Date(order.orderDate).toLocaleString()}</td>
                  <td>${order.totalPrice.toFixed(2)}</td>
                  <td>{order.orderStatus}</td>
                  <td>{order.paymentStatus}</td>
                  <td>
                    {order.invoiceLink?.startsWith("http")
                      ? (
                        <a
                          href={order.invoiceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Invoice
                        </a>
                      )
                      : "Not Available"}
                  </td>
                  <td>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedOrderItems(order.orderItems);
                        setOpenItemsDialog(true);
                      }}
                    >
                      View Items ({order.orderItems.length})
                    </Button>
                  </td>
                  <td>
                    {order.orderStatus === "PROCESSING" ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        sx={{ minWidth: 140, textTransform: "none" }}
                        onClick={() => {
                          setConfirmAction({ type: "cancel", orderId: order.orderId });
                          setConfirmDialogOpen(true);
                        }}
                      >
                        CANCEL
                      </Button>
                    ) : order.orderStatus === "DELIVERED" &&
                      new Date() - new Date(order.orderDate) <= 30 * 24 * 60 * 60 * 1000 ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        sx={{ minWidth: 140, textTransform: "none" }}
                        onClick={() => {
                          setConfirmAction({ type: "refund-all", orderId: order.orderId });
                          setConfirmDialogOpen(true);
                        }}
                      >
                        REQUEST REFUND
                      </Button>
                    ) : (
                      <Button size="small" variant="outlined" disabled>
                        Not Available
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      )}

      <Dialog open={openItemsDialog} onClose={() => setOpenItemsDialog(false)}>
        <DialogTitle>Order Items</DialogTitle>
        <DialogContent dividers>
          {selectedOrderItems.map((item, idx) => {
            const parentOrder = orders.find(order => order.orderItems.some(i => i.orderItemId === item.orderItemId));
            const orderStatus = parentOrder?.orderStatus;
            const orderDate = parentOrder?.orderDate;
            const isRefundEligible =
              orderStatus === "DELIVERED" &&
              new Date() - new Date(orderDate) <= 30 * 24 * 60 * 60 * 1000;
            const isCancelable = orderStatus === "PROCESSING";

            return (
              <Grid key={idx} container spacing={2} alignItems="center" mb={2}>
                <Grid item xs={3}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.productName}
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">{item.productName}</Typography>
                  <Typography variant="body2">
                    Product ID: {item.productId}<br />
                    Price: ${item.priceAtPurchase.toFixed(2)}<br />
                    Quantity: {item.quantity}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Box display="flex" flexDirection="column" alignItems="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        minWidth: 130,
                        textTransform: "none",
                        mb: isRefundEligible ? 1 : 0,
                      }}
                      onClick={() => {
                        setSelectedProductId(item.productId);
                        setSelectedProductName(item.productName);
                        setOpenReviewDialog(true);
                      }}
                    >
                      Review
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)}>
        <DialogTitle>Review for {selectedProductName}</DialogTitle>
        <DialogContent>
          <Rating
            name="product-rating"
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Your comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitReview} disabled={rating === 0}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm {confirmAction?.type === 'cancel' ? 'Cancellation' : 'Refund'}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {confirmAction?.type === "cancel"
              ? "cancel this order?"
              : "refund the order?"}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>No</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              alert(`${confirmAction?.type === 'cancel' ? 'Order cancelled' : 'Refund requested'}`);
              handleConfirmAction();
              setConfirmDialogOpen(false);
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
