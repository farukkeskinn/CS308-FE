// src/pages/Checkout.js
import { useCartContext } from "../../context/CartContext"; // CartContext import
//import { useCartContext } from "../../context/CartContext"; // CartContext import

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
} from "@mui/material";

const steps = ["Shipping Address", "Payment Details", "Review Order"];

const countryCityMap = {
  US: ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
  TR: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"],
  DE: ["Berlin", "Hamburg", "Munich", "Cologne"],
  FR: ["Paris", "Lyon", "Marseille"],
};

const nameRegex = /^[A-Za-zÇÖÜĞŞİçöüğş\s]+$/;
const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

export default function Checkout() { 
  const { cartItems } = useCartContext();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    addressName:"",
    address: "",
    country: "",
    city: "",
    zipCode: "",
    phoneNumber: "",
  });
  const [paymentData, setPaymentData] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  
  const [formError, setFormError] = useState("");

  const handleNext = () => {
    if (activeStep === 0 && !validateShipping()) return;
    if (activeStep === 1 && !validatePayment()) return;
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setFormError("");
    setActiveStep((prev) => prev - 1);
  };

  const validateShipping = () => {
    const errors = [];
    if (!nameRegex.test(shippingData.firstName.trim())) {
      errors.push("First Name (letters only)");
    }
    if (!nameRegex.test(shippingData.lastName.trim())) {
      errors.push("Last Name (letters only)");
    }
    if (!shippingData.address.trim()) {
      errors.push("Address");
    }
    if (!shippingData.country) {
      errors.push("Country");
    }
    if (!shippingData.city) {
      errors.push("City");
    }
    if (!/^\d{5}$/.test(shippingData.zipCode)) {
      errors.push("ZIP Code (5 digits)");
    }
    if (shippingData.phoneNumber.replace(/\D/g, "").length !== 11) {
      errors.push("Phone Number (format: 0(5XX) XXX XX XX)");
    }

    if (errors.length > 0) {
      setFormError(createErrorMessage(errors));
      return false;
    }
    setFormError("");
    return true;
  };

  const validatePayment = () => {
    const errors = [];
    if (!nameRegex.test(paymentData.cardName.trim())) {
      errors.push("Name on Card (letters only)");
    }
    const digits = paymentData.cardNumber.replace(/\D/g, "");
    if (digits.length !== 16) {
      errors.push("Card Number (16 digits)");
    }
    if (!expiryRegex.test(paymentData.expiry.trim())) {
      errors.push("Expiry Date (MM/YY)");
    }
    if (!/^\d{3}$/.test(paymentData.cvv)) {
      errors.push("CVV (3 digits)");
    }
    if (!expiryRegex.test(paymentData.expiry.trim())) {
  errors.push("Expiry Date (MM/YY)");
} else {
  const [mm, yy] = paymentData.expiry.split("/").map(Number);
  if (yy < 25 || (yy === 25 && mm < 4)) {
    errors.push("Expiry Date must be after 04/25");
  }
}


if (!expiryRegex.test(paymentData.expiry.trim())) {
  errors.push("Expiry Date (MM/YY)");
} else {
  const [mm, yy] = paymentData.expiry.split("/").map(Number);
  if (yy < 25 || (yy === 25 && mm < 4)) {
    errors.push("Expiry Date must be after 04/25");
  }
}

  
    if (errors.length > 0) {
      setFormError(createErrorMessage(errors));
      return false;
    }
    setFormError("");
    return true;
  };

  const createErrorMessage = (fields) => {
    if (fields.length === 1) {
      return `Please fill in the required field: ${fields[0]}`;
    }
    return `Please fill in the required fields: ${fields.join(", ")}`;
  };

  const handleSubmit = async () => {
    const paymentPayload = {
      cardNumber: paymentData.cardNumber.replace(/\s/g, ""),
      cardHolderName: paymentData.cardName,
      expiryDate: paymentData.expiry,
      cvv: paymentData.cvv,
    };
  
    try {
      const token = localStorage.getItem("jwtToken"); // ✅ doğru key
  
      const response = await fetch("http://localhost:8080/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // 🔐 token doğru şekilde eklendi
        },
        body: JSON.stringify(paymentPayload),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Checkout error:", errorText);
        alert("Checkout failed: " + errorText);
        return;
      }
  
      const result = await response.json();
      console.log("Checkout successful:", result);
  
      // ✅ Sipariş başarıyla tamamlandıysa yönlendir
      navigate("/thank-you");
  
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("An error occurred during checkout.");
    }
  };
  
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      setShippingData((prev) => ({
        ...prev,
        phoneNumber: formatPhoneNumber(value),
      }));
    } else {
      setShippingData((prev) => ({ ...prev, [name]: value }));
      if (name === "country") {
        setShippingData((prev) => ({ ...prev, city: "" }));
      }
    }
  };

  const formatPhoneNumber = (input) => {
    const digits = input.replace(/\D/g, "").slice(0, 11);
    if (!digits.startsWith("05")) return digits;
    let formatted = "0(";
    formatted += digits.slice(1, 4);
    if (digits.length >= 4) formatted += ") ";
    if (digits.length >= 7) {
      formatted += digits.slice(4, 7) + " ";
      formatted += digits.slice(7, 9) + " ";
      formatted += digits.slice(9, 11);
    } else if (digits.length >= 4) {
      formatted += digits.slice(4);
    }
    return formatted.trim();
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      setPaymentData((prev) => ({
        ...prev,
        cardNumber: formatCardNumber(value),
      }));
      return;
    }

    if (name === "cvv") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 3);
      setPaymentData((prev) => ({ ...prev, cvv: onlyDigits }));
      return;
    }

    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const groups = [];
    for (let i = 0; i < digits.length; i += 4) {
      groups.push(digits.substring(i, i + 4));
    }
    return groups.join(" ");
  };

  const generateExpiryOptions = () => {
    const now = new Date();
    const options = [];
    let year = 2025;
    let month = 4;
    for (let i = 0; i < 60; i++) {
      if (month > 12) {
        month = 1;
        year++;
      }
      const mm = month.toString().padStart(2, "0");
      const yy = year.toString().slice(2);
      options.push({ label: `${mm}/${yy}`, value: `${mm}/${yy}` });
      month++;
    }
    return options;
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderShippingForm();
      case 1:
        return renderPaymentForm();
      case 2:
        return renderReviewOrder();
      default:
        return <div>Unknown step</div>;
    }
  };

  const renderShippingForm = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            label="First Name"
            name="firstName"
            value={shippingData.firstName}
            onChange={handleShippingChange}
            fullWidth
            inputProps={{
              pattern: "[A-Za-zÇÖÜĞŞİçöüğş\\s]+",
              onInput: (e) => {
                e.target.value = e.target.value.replace(/[^A-Za-zÇÖÜĞŞİçöüğş\s]/g, "");
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            label="Last Name"
            name="lastName"
            value={shippingData.lastName}
            onChange={handleShippingChange}
            fullWidth
            inputProps={{
              pattern: "[A-Za-zÇÖÜĞŞİçöüğş\\s]+",
              onInput: (e) => {
                e.target.value = e.target.value.replace(/[^A-Za-zÇÖÜĞŞİçöüğş\s]/g, "");
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            label="Address Name"
            name="addressName"
            value={shippingData.addressName}
            onChange={handleShippingChange}
            fullWidth
            inputProps={{
              pattern: "[A-Za-zÇÖÜĞŞİçöüğş\\s]+",
              onInput: (e) => {
                e.target.value = e.target.value.replace(/[^A-Za-zÇÖÜĞŞİçöüğş\s]/g, "");
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            label="Address"
            name="address"
            value={shippingData.address}
            onChange={handleShippingChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Country</InputLabel>
            <Select
              name="country"
              value={shippingData.country}
              label="Country"
              onChange={handleShippingChange}
            >
              {Object.keys(countryCityMap).map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>City</InputLabel>
            <Select
              name="city"
              value={shippingData.city}
              label="City"
              onChange={handleShippingChange}
              disabled={!shippingData.country}
            >
              {shippingData.country &&
                countryCityMap[shippingData.country].map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            label="ZIP Code"
            name="zipCode"
            value={shippingData.zipCode}
            onChange={handleShippingChange}
            fullWidth
            inputProps={{ inputMode: "numeric", pattern: "\\d{5}", maxLength: 5 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            label="Phone Number"
            name="phoneNumber"
            value={shippingData.phoneNumber}
            onChange={handleShippingChange}
            fullWidth
            placeholder="0(5XX) XXX XX XX"
            inputProps={{
              inputMode: "numeric",
              maxLength: 17,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  
const formatExpiryInput = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) {
      return digits;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };
  
  const renderPaymentForm = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            label="Name on Card"
            name="cardName"
            value={paymentData.cardName}
            onChange={handlePaymentChange}
            fullWidth
            inputProps={{
              pattern: "[A-Za-zÇÖÜĞŞİçöüğş\\s]+",
              onInput: (e) => {
                e.target.value = e.target.value.replace(/[^A-Za-zÇÖÜĞŞİçöüğş\s]/g, "");
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            label="Card Number"
            name="cardNumber"
            value={paymentData.cardNumber}
            onChange={handlePaymentChange}
            fullWidth
            placeholder="1234 5678 9012 3456"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
         <TextField
            required
            label="Expiry Date (MM/YY)"
            name="expiry"
            value={paymentData.expiry}
            onChange={handlePaymentChange}
            fullWidth
            placeholder="MM/YY"
            inputProps={{
            maxLength: 5,
            onInput: (e) => {
            e.target.value = formatExpiryInput(e.target.value);
            },
                }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            label="CVV"
            name="cvv"
            value={paymentData.cvv}
            onChange={handlePaymentChange}
            fullWidth
            placeholder="3 digits"
          />
        </Grid>
      </Grid>
  
      {/* 💳 Virtual Card Görseli */}
      <Box
        sx={{
          mt: 4,
          background: "linear-gradient(135deg, #696969 0%, #b0c4de 100%)",
          color: "#fff",
          p: 4,
          borderRadius: 3,
          width:"100%",
          maxWidth: 420,
          margin: "24px auto 0",
          minHeight: 220,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" mb={2}>
          Virtual Card
        </Typography>
        <Box>
          <Typography sx={{ mb: 1 }}>
            <strong>Cardholder:</strong> {paymentData.cardName || "----"}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Card Number:</strong>{" "}
            {paymentData.cardNumber || "XXXX XXXX XXXX XXXX"}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Expiry:</strong> {paymentData.expiry || "--/--"}
          </Typography>
          <Typography>
            <strong>CVV:</strong> {paymentData.cvv ? "***" : "---"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
  

  const renderReviewOrder = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Review Your Order
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Shipping Address
        </Typography>
        <Typography>
          {shippingData.firstName} {shippingData.lastName}
        </Typography>
        <Typography>
          {shippingData.address}, {shippingData.city}, {shippingData.country},{" "}
          {shippingData.zipCode}
        </Typography>
        <Typography>Phone: {shippingData.phoneNumber}</Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Payment Details
        </Typography>
        <Typography>Cardholder: {paymentData.cardName}</Typography>
        <Typography>
          Card Number:{" "}
          {paymentData.cardNumber
            ? `**** **** **** ${paymentData.cardNumber.slice(-4)}`
            : "----"}
        </Typography>
        <Typography>Expiry: {paymentData.expiry || "--/--"}</Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Cart Items
        </Typography>
        {cartItems.map((item, index) => (
          <Box
            key={index}
            sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
          >
            <Typography>
              {item.name} x {item.quantity}
            </Typography>
            <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
          </Box>
        ))}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Typography variant="h6">
            Total: $
            {cartItems
              .reduce((acc, item) => acc + item.price * item.quantity, 0)
              .toFixed(2)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );

  const renderOrderSummary = () => (
  <Paper
    sx={{
      p: 3,
      boxShadow: 3,
      borderRadius: 3,
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    }}
    elevation={3}
  >
    <Typography variant="h5" mb={3} textAlign="center" fontWeight="bold">
      Order Summary
    </Typography>
    {cartItems.map((item, index) => (
      <Box
        key={index}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          p: 1,
          borderBottom: "1px solid #ccc",
        }}
      >
        <Typography>{item.name} x {item.quantity}</Typography>
        <Typography fontWeight="bold">
          ${(item.price * item.quantity).toFixed(2)}
        </Typography>
      </Box>
    ))}
    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
      <Typography variant="h6" fontWeight="bold">
        Total:
      </Typography>
      <Typography variant="h6" fontWeight="bold">
        $
        {cartItems
          .reduce((acc, item) => acc + item.price * item.quantity, 0)
          .toFixed(2)}
      </Typography>
    </Box>
  </Paper>
);


  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", my: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {formError && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {formError}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          {getStepContent(activeStep)}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="contained"
              color="inherit"
            >
              Back
            </Button>
            <Button variant="contained" onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Place Order" : "Next"}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          {renderOrderSummary()}
        </Grid>
      </Grid>
    </Box>
  );
}