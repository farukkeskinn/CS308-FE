import React, { useState, useEffect } from "react";
import { CssBaseline } from "@mui/material";

import { createTheme, ThemeProvider } from "@mui/material/styles";
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
import { green, pink, blue, yellow } from '@mui/material/colors';
import Checkbox from "@mui/material/Checkbox";
import {
  ResponsiveContainer,
  LineChart,
  Legend,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";


const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#212020",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#aaaaaa",
    },
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e",
        },
      },
    },
  },
});
export default function SalesDashboard() {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2027-01-01");
  const [orders, setOrders] = useState([]);
  const [rawOrders, setRawOrders] = useState([]);      // used for profit calculation
  const [revenueData, setRevenueData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [publishedProducts, setPublishedProducts] = useState([]);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [selectedForDiscount, setSelectedForDiscount] = useState({});
  const [discountRate, setDiscountRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [unpublishedProducts, setUnpublishedProducts] = useState([]);
  const [showUnpublishedDialog, setShowUnpublishedDialog] = useState(false);
  const [priceInputs, setPriceInputs] = useState({});

  // 1) On mount, fetch all orders (with orderItems) for profit calculations
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/sales-managers/orders`)
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
        ? `${process.env.REACT_APP_API_BASE_URL}/api/sales-managers/invoices/dates`
        : `${process.env.REACT_APP_API_BASE_URL}/api/sales-managers/orders`;

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
        const list = startDate && endDate
          ? res.data.invoices || []
          : Array.isArray(res.data)
            ? res.data
            : res.data.orders || [];
        setOrders(list);


        const rev = list
          .map(o => ({
            date: o.orderDate.split("T")[0],
            revenue: startDate && endDate
              ? o.totalAmount
              : o.totalPrice
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

  useEffect(() => {
    let ordersToCompute = rawOrders;

    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      to.setHours(23, 59, 59);
      ordersToCompute = rawOrders.filter(order => {
        const d = new Date(order.orderDate);
        return d >= from && d <= to;
      });
    }


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
        `${process.env.REACT_APP_API_BASE_URL}/api/sales-managers/products/unpublished`
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
        `${process.env.REACT_APP_API_BASE_URL}/api/sales-managers/products/set-price`,
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

  const fetchPublished = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/published`);
      setPublishedProducts(res.data);
      setShowDiscountDialog(true);
    } catch (e) {
      console.error("Published fetch error:", e);
    }
  };

  const toggleSelect = (id) => {
    setSelectedForDiscount(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const applyDiscount = async () => {
    const pct = parseInt(discountRate, 10);
    if (isNaN(pct) || pct < 1 || pct > 100) {
      return alert("Lütfen 1–100 arasında bir yüzde girin.");
    }

    console.log(">> Applying discount %", pct, "to", selectedForDiscount);
    for (let prod of publishedProducts) {
      if (selectedForDiscount[prod.productId]) {
        try {
          console.log(" - Sending for", prod.productId);
          const res = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/sales-managers/products/discount`,
            null,
            { params: { productId: prod.productId, discountPercentage: pct } }
          );
          console.log("   <- response", res.data);
        } catch (e) {
          console.error(`Discount error for ${prod.productId}:`, e);
        }
      }
    }


    try {
      const fresh = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/published`);
      setPublishedProducts(fresh.data);
      console.log("Published products refreshed", fresh.data);
    } catch (e) {
      console.error("Failed to refresh published list:", e);
    }


    setShowDiscountDialog(false);
    setDiscountRate("");
    setSelectedForDiscount({});
  };
  const fetchPendingRefunds = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/sales-managers/refunds/pending`
      );
      setPendingRefunds(res.data);
      setShowRefundDialog(true);
    } catch (e) {
      console.error("Pending refunds fetch failed:", e);
    }
  };

  const handleProcessRefund = async (refundId, decision) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/sales-managers/refunds/${refundId}/process`,
        null,
        { params: { decision } }
      );
      // listeden çıkar
      setPendingRefunds(prev => prev.filter(r => r.refundId !== refundId));
    } catch (e) {
      console.error(`Refund ${decision} failed for ${refundId}:`, e);
      alert("İşlem başarısız.");
    }
  };



  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
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
            sx={{
              input: { color: "#fff" },
              boxShadow: 2,
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#ffffff',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#ffffff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffffff',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#cccccc',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#ffffff',
              },
            }}
          />

          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              input: { color: "#fff" },
              boxShadow: 2,
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#ffffff',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#ffffff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffffff',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#cccccc',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#ffffff',
              },
            }}
          />
          <Button
            variant="contained"
            sx={{ backgroundColor: pink[500], '&:hover': { backgroundColor: pink[700] } }}
            onClick={fetchUnpublished}>
            Unpublished Products
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: 'green', '&:hover': { backgroundColor: 'darkgreen' } }}
            onClick={fetchPublished}>
            Apply Discount
          </Button>
          <Button variant="contained"
            sx={{
              backgroundColor: yellow[500],
              '&:hover': { backgroundColor: yellow[700] }
            }}
            onClick={fetchPendingRefunds}>
            Refund Requests
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
                    <TableCell>Invoice</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.orderId}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>
                        {order.invoiceUrl
                          ? <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                          : "—"
                        }
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
                      {/* 1) Gradient tanımı */}
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1976d2" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      {/* 2) Daha belirgin grid */}
                      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />

                      {/* 3) Özelleştirilmiş eksenler */}
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#555', fontSize: 12, angle: -45, textAnchor: 'end' }}
                        height={60}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fill: '#555', fontSize: 12 }}
                        width={60}
                      />

                      {/* 4) Legend */}
                      <Legend verticalAlign="top" height={36} />

                      {/* 5) Tooltip */}
                      <Tooltip formatter={val => `$${val.toFixed(2)}`} />

                      {/* 6) Dolgu alanı */}
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="none"
                        fill="url(#colorRev)"
                        isAnimationActive={true}
                        animationDuration={2000}
                      />

                      {/* 7) Vurgulu çizgi */}
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#1976d2"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#1976d2', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                        isAnimationActive={true}
                        animationDuration={1500}
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
                      <defs>
                        <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#388e3c" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#388e3c" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                      <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 12, angle: -45, textAnchor: 'end' }} height={60} interval={0} />
                      <YAxis tick={{ fill: '#555', fontSize: 12 }} width={60} />
                      <Legend verticalAlign="top" height={36} />
                      <Tooltip formatter={val => `$${val.toFixed(2)}`} />
                      <Area type="monotone" dataKey="profit" stroke="none" fill="url(#colorProf)" isAnimationActive animationDuration={2000} />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#388e3c"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#388e3c', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                        isAnimationActive
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        {/* Unpublished Products Dialog */}
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
                                ...priceInputs,
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
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Apply Discount Dialog */}
        <Dialog
          open={showDiscountDialog}
          onClose={() => setShowDiscountDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Apply Discount to Published Products</DialogTitle>
          <DialogContent>
            <Box mb={2}>
              <TextField
                label="Discount %"
                type="number"
                value={discountRate}
                onChange={e => setDiscountRate(e.target.value)}
                InputProps={{
                  inputProps: { min: 1, max: 100 },
                }}
                sx={{
                  width: 220,
                  boxShadow: 3,
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: green[500],
                    },
                    '&:hover fieldset': {
                      borderColor: green[700],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: green[700],
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: green[500],
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: green[700],
                  },
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'center',
                    fontSize: '1.1rem',
                  },
                }}
              />
            </Box>
            <TableContainer component={Paper}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Product ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Original Price ($)</TableCell>
                    <TableCell align="right">Discounted Price ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {publishedProducts.map(p => (
                    <TableRow key={p.productId}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={!!selectedForDiscount[p.productId]}
                          onChange={() => toggleSelect(p.productId)}
                        />
                      </TableCell>
                      <TableCell>{p.productId}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      {/* Orijinal fiyat her zaman price */}
                      <TableCell align="right">{p.price.toFixed(2)}</TableCell>
                      {/* İndirime tabi ise discountedPrice, değilse — */}
                      <TableCell align="right">
                        {p.discounted && p.discountedPrice != null
                          ? p.discountedPrice.toFixed(2)
                          : '—'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDiscountDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={applyDiscount}>
              Apply
            </Button>
          </DialogActions>
        </Dialog>
        {/* Refund Management Dialog */}
        <Dialog
          open={showRefundDialog}
          onClose={() => setShowRefundDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Refund Management</DialogTitle>
          <DialogContent>
            {pendingRefunds.length === 0 ? (
              <Typography>No pending refunds.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Refund ID</TableCell>
                      <TableCell align="right">Refund Amount (₺)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRefunds.map(r => (
                      <TableRow key={r.refundId}>
                        <TableCell>{r.refundId}</TableCell>
                        <TableCell align="right">
                          ${(r.refundAmount ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{r.refundStatus}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleProcessRefund(r.refundId, "APPROVE")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleProcessRefund(r.refundId, "REJECT")}
                          >
                            Reject
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
            <Button onClick={() => setShowRefundDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>


      </Box>
    </ThemeProvider>
  );
}