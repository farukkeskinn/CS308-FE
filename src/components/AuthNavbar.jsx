import { Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

const AuthNavbar = () => {
  const navStyle = {
    backgroundColor: "#1f1c66",
    padding: "0.5rem 1.5rem",
    height: "72px",
    display: "flex",
    alignItems: "center",
  };

  const linkStyle = {
    fontWeight: "bold",
    fontSize: "1.75rem",
    color: "white",
    textDecoration: "none",
    transition: "transform 0.3s ease-in-out",
  };

  const sloganStyle = {
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 400,
    textAlign: "center",
    whiteSpace: "nowrap",
  };

  const handleMouseEnter = (e) => {
    e.target.style.transform = "scale(1.2)";
  };

  const handleMouseLeave = (e) => {
    e.target.style.transform = "scale(1)";
  };

  return (
    <nav style={navStyle}>
      <Box
        className="container"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ width: "200px", display: "flex", alignItems: "center" }}>
          <Link
            to="/"
            style={linkStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            NEPTUNE
          </Link>
        </Box>

        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <Typography sx={sloganStyle}>
            Navigate the New Wave of Technology with <strong>NEPTUNE</strong> – All the tech you love, from brands you trust.
          </Typography>
        </Box>

        <Box sx={{ width: "200px" }} />
      </Box>
    </nav>
  );
};

export default AuthNavbar;