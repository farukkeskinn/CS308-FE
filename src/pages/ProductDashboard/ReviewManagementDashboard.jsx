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
  Button
} from '@mui/material';

export default function ReviewManagementDashboard() {
  const [reviews, setReviews] = useState([]);
  const [names,   setNames]   = useState({});    // productId → product name
  const [loading, setLoading] = useState(true);

  // 1) Load all pending reviews
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/reviews', { params: { status: 'pending' }})
      .then(res => setReviews(res.data))
      .catch(err => {
        console.error(
          '❌ Failed to load reviews:',
          err.config.method.toUpperCase(),
          err.config.url
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // 2) Once reviews arrive, fetch each unique product name
  useEffect(() => {
    const ids = [...new Set(reviews.map(r => r.productId))];
    if (!ids.length) return;

    Promise.all(
      ids.map(id =>
        axios
          .get(`http://localhost:8080/api/product-managers/products/${id}/name`)
          .then(r => [ id, r.data.name ])
          .catch(err => {
            console.error(
              `❌ Failed to load name for product ${id}:`,
              err.config.method.toUpperCase(),
              err.config.url
            );
            return [ id, 'Unknown' ];
          })
      )
    ).then(pairs => setNames(Object.fromEntries(pairs)));
  }, [reviews]);

  // 3) Approve or reject a review
  const handleApproval = (reviewId, status) => {
    const verb = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${verb} this review?`)) return;

    axios
      .patch(
        `http://localhost:8080/api/reviews/${reviewId}/approval`,
        null,
        { params: { status }}
      )
      .then(() => {
        // Remove the just‑handled review from state
        setReviews(reviews.filter(r => r.reviewId !== reviewId));
      })
      .catch(err => {
        console.error(
          `❌ Failed to ${verb} review ${reviewId}:`,
          err.config.method.toUpperCase(),
          err.config.url
        );
      });
  };

  // Loading spinner
  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  // No pending reviews
  if (!reviews.length) {
    return (
      <Box p={4} textAlign="center">
        <Typography>No pending reviews.</Typography>
      </Box>
    );
  }

  // Main table
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Review Management
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Review ID</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Comment</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {reviews.map(r => (
            <TableRow key={r.reviewId}>
              <TableCell>{r.reviewId}</TableCell>
              <TableCell>
                {names[r.productId] || 'Loading…'}
              </TableCell>
              <TableCell>{r.rating}</TableCell>
              <TableCell>{r.comment}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => handleApproval(r.reviewId, 'approved')}
                  sx={{ mr: 1 }}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleApproval(r.reviewId, 'rejected')}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
