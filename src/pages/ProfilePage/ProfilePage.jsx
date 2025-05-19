import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";



export default function ProfilePage() {
  const [customer, setCustomer] = useState(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    const customerId = localStorage.getItem("customerId");
    const jwtToken = localStorage.getItem("jwtToken");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      } else {
        console.error("Failed to fetch profile.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const customerId = localStorage.getItem("customerId");

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/customers/${customerId}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setOpenPasswordDialog(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        alert("Password updated successfully!");
      } else if (response.status === 401) {
        setError("Current password is incorrect.");
      } else {
        setError("Failed to update password.");
      }
    } catch (err) {
      setError("An error occurred.");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const jwtToken = localStorage.getItem("jwtToken");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        await fetchProfile();
      } else {
        console.error("Failed to delete address.");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!customer) return <p>Loading profile...</p>;

  const addressList = (() => {
    const uniqueAddresses = [];
    const seen = new Set();

    customer.orders?.forEach(order => {
      const addr = order.shippingAddress;
      const key = `${addr?.addressName}-${addr?.addressLine}`;
      if (addr && !seen.has(key)) {
        uniqueAddresses.push(addr);
        seen.add(key);
      }
    });

    return uniqueAddresses;
  })();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      <Box sx={{ flexGrow: 1, py: 5, px: { xs: 2, md: 10 } }}>
        <Typography variant="h3" fontWeight="bold" align="center" mb={6} color="#1f1c66">
          Welcome, {customer.firstName}!
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#f0f4ff",
              p: 4,
              borderRadius: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: 3,
              minWidth: 200,
              height: "100%",
            }}
          >
            <Avatar
              src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
              alt="Profile"
              sx={{ width: 160, height: 160 }}
            />
            <Typography
              variant="body2"
              sx={{ mt: 2, color: "gray", fontStyle: "italic", textAlign: "center" }}
            >
              Tax ID: {customer.customerId}
            </Typography>
          </Box>

          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 4,
              p: 4,
              boxShadow: 3,
              maxWidth: 500,
              width: "100%",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#1f1c66">
              Full Name
            </Typography>
            <Typography mb={2}>
              {customer.firstName} {customer.lastName}
            </Typography>

            <Divider />

            <Typography variant="h6" fontWeight="bold" mt={2} color="#1f1c66">
              Email
            </Typography>
            <Typography mb={2}>{customer.email}</Typography>

            <Divider />

            <Typography variant="h6" fontWeight="bold" mt={2} color="#1f1c66">
              Password
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontFamily: "monospace", letterSpacing: 2 }}>********</Typography>
              <IconButton
                onClick={() => setOpenPasswordDialog(true)}
                sx={{ color: "red", fontWeight: "bold" }}
              >
                Change Password
              </IconButton>
            </Box>

            <Divider />

            <Typography variant="h6" fontWeight="bold" mt={2} color="#1f1c66">
              Addresses
            </Typography>

            {addressList.length === 0 && (
              <Typography sx={{ mt: 2, fontStyle: "italic", color: "gray" }}>
                No address available.
              </Typography>
            )}

            {addressList.map((address, index) => (
              <Box
                key={index}
                sx={{
                  mt: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  backgroundColor: "#f9f9f9",
                  position: "relative",
                }}
              >
                <Typography fontWeight="bold">Address {index + 1}</Typography>
                <Typography>{address.addressName}</Typography>
                <Typography sx={{ fontSize: "0.9rem", opacity: 0.8 }}>
                  {address.addressLine}
                </Typography>

                <IconButton
                  size="small"
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  onClick={() => handleDeleteAddress(address.addressId)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
          {error && (
            <Typography sx={{ color: "red", fontSize: "0.9rem" }}>{error}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained" color="success">
            Confirm Password
          </Button>
        </DialogActions>
      </Dialog>

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
