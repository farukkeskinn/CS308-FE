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
import Checkbox from "@mui/material/Checkbox";
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
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate]   = useState("2027-01-01");
  const [orders, setOrders] = useState([]);
  const [rawOrders, setRawOrders] = useState([]);      // used for profit calculation
  const [revenueData, setRevenueData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [publishedProducts, setPublishedProducts] = useState([]);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [selectedForDiscount, setSelectedForDiscount] = useState({});
  const [discountRate, setDiscountRate] = useState("");
  const [loading, setLoading] = useState(true);


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
        // 1) Order list’ini doğru kaydet
        const list = startDate && endDate
          ? res.data.invoices || []
          : Array.isArray(res.data)
            ? res.data
            : res.data.orders || [];
        setOrders(list);

        // 2) Revenue grafiği için data hazırla
        const rev = list
          .map(o => ({
            date: o.orderDate.split("T")[0],
            revenue: startDate && endDate
              ? o.totalAmount     // invoice endpoint’inde totalAmount
              : o.totalPrice      // normal orders endpoint’inde totalPrice
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

    const fetchPublished = async () => {
        try {
          const res = await axios.get("http://localhost:8080/api/products/published");
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
                    "http://localhost:8080/api/sales-managers/products/discount",
                    null,
                    { params: { productId: prod.productId, discountPercentage: pct } }
                  );
                  console.log("   <- response", res.data);
                } catch (e) {
                  console.error(`Discount error for ${prod.productId}:`, e);
                }
              }
            }
          
            // Uyguladıktan sonra listeyi yeniden get’le ki DB’den güncel fiyatları çekelim
            try {
              const fresh = await axios.get("http://localhost:8080/api/products/published");
              setPublishedProducts(fresh.data);
              console.log("Published products refreshed", fresh.data);
            } catch (e) {
              console.error("Failed to refresh published list:", e);
            }
          
            // Dialog’u kapat ve state’i temizle
            setShowDiscountDialog(false);
            setDiscountRate("");
            setSelectedForDiscount({});
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
        <Button variant="outlined" onClick={fetchPublished}>
          Apply Discount
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
          Kapat
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
              InputProps={{ inputProps: { min: 1, max: 100 } }}
            />
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
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
                      {p.discounted
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
 
    </Box>
  );
}