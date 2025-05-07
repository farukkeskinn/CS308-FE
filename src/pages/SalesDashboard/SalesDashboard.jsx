import React, { useState, useEffect } from "react";
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
  Stack,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from "@mui/material";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

export default function SalesDashboard() {
  const [orders, setOrders] = useState([]);
  const [rawOrders, setRawOrders] = useState([]);      // used for profit calculation
  const [revenueData, setRevenueData] = useState([]);
  const [profitData, setProfitData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [unpublishedProducts, setUnpublishedProducts] = useState([]);
  const [showUnpublishedDialog, setShowUnpublishedDialog] = useState(false);
  const [priceInputs, setPriceInputs] = useState({});

  // 1) On mount, fetch all orders (with orderItems) for profit calculations
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/sales-managers/orders")
      .then(res => setRawOrders(res.data))
      .catch(err => {
        console.error("Raw orders fetch error:", err);
        setRawOrders([]);
      });
  }, []);

  // 2) Whenever date range changes, fetch invoices/orders for table and revenue
  useEffect(() => {
    setLoading(true);
    const url =
      startDate && endDate
        ? "http://localhost:8080/api/sales-managers/invoices/dates"
        : "http://localhost:8080/api/sales-managers/orders";
    const params =
      startDate && endDate
        ? {
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString()
          }
        : {};

    axios
      .get(url, { params })
      .then(res => {
        let list;
        if (startDate && endDate) {
          list = res.data.invoices || [];
        } else {
          list = Array.isArray(res.data) ? res.data : res.data.orders || [];
        }
        setOrders(list);

        // revenueData
        const rev = list
          .map(o => ({
            date: o.orderDate.split("T")[0],
            revenue: o.totalPrice
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setRevenueData(rev);
      })
      .catch(err => {
        console.error("Invoice/orders fetch error:", err);
        setOrders([]);
        setRevenueData([]);
      })
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  // 3) Calculate profitData whenever rawOrders or date range changes
  useEffect(() => {
    let ordersToCompute = rawOrders;
  
    // Eğer tarih aralığı girildiyse, o aralığa göre filtrele
    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      to.setHours(23, 59, 59);
      ordersToCompute = rawOrders.filter(order => {
        const d = new Date(order.orderDate);
        return d >= from && d <= to;
      });
    }
  
    // Profit hesaplama
    const prof = ordersToCompute
      .map(order => {
        const costSum = order.orderItems.reduce(
          (sum, item) => sum + item.product.cost * item.quantity,
          0
        );
        return {
          date: order.orderDate.split("T")[0],
          profit: order.totalPrice - costSum
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  
    setProfitData(prof);
  }, [rawOrders, startDate, endDate]);

  const fetchUnpublished = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/sales-managers/products/unpublished"
      );
      setUnpublishedProducts(res.data);
      setShowUnpublishedDialog(true);
    } catch (e) {
      console.error("Unpublished fetch error:", e);
    }
  };

  const handleSetPrice = async productId => {
    const price = parseFloat(priceInputs[productId]);
    if (!price || price <= 0) {
      alert("Geçerli bir fiyat girin.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8080/api/sales-managers/products/set-price",
        null,
        { params: { productId, price, publishProduct: true } }
      );
      setUnpublishedProducts(prev =>
        prev.filter(p => p.productId !== productId)
      );
      setPriceInputs(prev => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    } catch (e) {
      console.error("Set-price error:", e);
      alert("Fiyat kaydedilemedi.");
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Sales Manager Panel
      </Typography>

      <Typography variant="h6" mt={4}>
        Invoices
      </Typography>

      <Stack direction="row" spacing={2} mt={2} mb={2}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={fetchUnpublished}>
          Unpublished Products
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : orders.length === 0 ? (
        <Typography>No orders found for the selected date range.</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.orderId}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>
                      {new Date(order.orderDate).toLocaleString("tr-TR")}
                    </TableCell>
                    <TableCell>{order.orderStatus}</TableCell>
                    <TableCell align="right">
                      ${order.totalPrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container spacing={4} mt={4}>
            <Grid item xs={6}>
              <Typography variant="h6" mb={1}>
                Revenue Chart
              </Typography>
              <Paper sx={{ height: 300, p: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={val => `$${val.toFixed(2)}`} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1976d2"
                      dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" mb={1}>
                Profit Chart
              </Typography>
              <Paper sx={{ height: 300, p: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={val => `$${val.toFixed(2)}`} />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#388e3c"
                      dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      <Dialog
        open={showUnpublishedDialog}
        onClose={() => setShowUnpublishedDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Unpublished Products</DialogTitle>
        <DialogContent>
          {unpublishedProducts.length === 0 ? (
            <Typography>No unpublished products.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>New Price ($)</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unpublishedProducts.map(prod => (
                    <TableRow key={prod.productId}>
                      <TableCell>{prod.productId}</TableCell>
                      <TableCell>{prod.name}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={priceInputs[prod.productId] || ""}
                          onChange={e =>
                            setPriceInputs({
                              priceInputs,
                              [prod.productId]: e.target.value
                            })
                          }
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleSetPrice(prod.productId)}
                        >
                          Set Price
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUnpublishedDialog(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
