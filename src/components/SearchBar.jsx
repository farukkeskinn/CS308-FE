import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar() {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isOnSearchPage = location.pathname === "/search";
    if (!isOnSearchPage) {
      setSearchInput("");
    }
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim() !== "") {
      navigate(`/search?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        width: "100%",
        maxWidth: 700,
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <TextField
        fullWidth
        placeholder="Search products..."
        variant="outlined"
        size="small"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}