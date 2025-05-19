import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper
} from '@mui/material';

export default function ReviewManagementDashboard() {
  const [reviews, setReviews] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/reviews`, { params: { status: 'pending' } })
      .then(res => setReviews(res.data))
      .catch(err => {
        console.error('❌ Failed to load reviews:', err.config?.method?.toUpperCase(), err.config?.url);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ids = [...new Set(reviews.map(r => r.productId))];
    if (!ids.length) return;

    Promise.all(
      ids.map(id =>
        axios
          .get(`${process.env.REACT_APP_API_BASE_URL}/api/product-managers/products/${id}/name`)
          .then(r => [id, r.data.name])
          .catch(err => {
            console.error(`❌ Failed to load name for product ${id}:`, err.config?.method?.toUpperCase(), err.config?.url);
            return [id, 'Unknown'];
          })
      )
    ).then(pairs => setNames(Object.fromEntries(pairs)));
  }, [reviews]);

  const handleApproval = (reviewId, status) => {
    const verb = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${verb} this review?`)) return;

    axios
      .patch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/${reviewId}/approval`, null, { params: { status } })
      .then(() => {
        setReviews(reviews.filter(r => r.reviewId !== reviewId));
      })
      .catch(err => {
        console.error(`❌ Failed to ${verb} review ${reviewId}:`, err.config?.method?.toUpperCase(), err.config?.url);
      });
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center" sx={{ backgroundColor: "#000", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!reviews.length) {
    return (
      <Box p={4} textAlign="center" sx={{ backgroundColor: "#000", minHeight: "100vh" }}>
        <Typography sx={{ color: "#fff" }}>No pending reviews.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4} sx={{ backgroundColor: "#000", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom sx={{ color: "#fff" }}>
        Review Management
      </Typography>

      <Paper sx={{ backgroundColor: "#111", color: "#fff" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Review ID", "Product", "Rating", "Comment", "Actions"].map(header => (
                <TableCell key={header} sx={{ color: "#fff", fontWeight: "bold" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {reviews.map(r => (
              <TableRow key={r.reviewId} sx={{ '&:hover': { backgroundColor: "#1a1a1a" } }}>
                <TableCell sx={{ color: "#fff" }}>{r.reviewId}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{names[r.productId] || 'Loading…'}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{r.rating}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{r.comment}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleApproval(r.reviewId, 'approved')}
                    sx={{ mr: 1, color: "#0f0", borderColor: "#0f0" }}
                    variant="outlined"
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleApproval(r.reviewId, 'rejected')}
                    variant="outlined"
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
