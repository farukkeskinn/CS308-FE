import React, { useState } from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query.trim());
  };

  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder="Search for product"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      sx={{
        backgroundColor: "white",
        borderRadius: "5px",
        width: { xs: "250px", sm: "350px", md: "500px", lg: "650px", xl: "800px" }, 
        maxWidth: "90%",
        "& .MuiOutlinedInput-root": {
          paddingRight: "8px",
          "& fieldset": { borderColor: "white" },
          "&:hover fieldset": { borderColor: "lightgray" },
          "&.Mui-focused fieldset": { borderColor: "white" },
        },
      }}
      InputProps={{
        style: { color: "black" },
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon 
              sx={{ color: "#1f1c66", cursor: "pointer" }} 
              onClick={handleSearch} 
            />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
