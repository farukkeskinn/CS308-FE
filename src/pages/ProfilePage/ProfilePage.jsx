import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ProfilePage() {
  const [customer, setCustomer] = useState(null);

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

  const addresses = customer.addresses || [];

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
              Addresses
            </Typography>

            {addresses.length === 0 && (
              <Typography sx={{ mt: 2, fontStyle: "italic", color: "gray" }}>
                No address available.
              </Typography>
            )}

            {[0, 1, 2].map((index) => {
              const address = addresses[index];
              if (!address) return null;

              return (
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
              );
            })}
          </Box>
        </Box>
      </Box>

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
