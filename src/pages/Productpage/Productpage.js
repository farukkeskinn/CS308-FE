import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;
  
    axios.get(`http://localhost:8080/api/products/${productId}/details`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);

        const categoryId = response.data.category?.categoryId || response.data.category?.parentCategory?.categoryId;

        return axios.get(`http://localhost:8080/api/products/by-category/${categoryId}`);
      })
      .then((categoryResponse) => {
        if (categoryResponse.data.content && Array.isArray(categoryResponse.data.content)) {
          const filteredProducts = categoryResponse.data.content.filter(p => p.productId !== String(productId));
          setRecommendedProducts(filteredProducts);
        }
      })
      .catch((error) => {
        setError("Product not found.");
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return <h2 className="text-center mt-5">Loading product details...</h2>;
  }

  if (!product) {
    return <h2 className="text-center mt-5">Product not found.</h2>;
  }

  // Calculate Rating Breakdown
  const totalReviews = product.reviews ? product.reviews.length : 0;
  const averageRating = totalReviews > 0
    ? (product.reviews.reduce((sum, c) => sum + c.rating, 0) / totalReviews).toFixed(1)
    : "No Rating Yet";

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: product.reviews.filter((c) => c.rating === star).length,
  }));

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar />

      {/* Product Details */}
      <div className="container mt-5">
        <h2 className="fw-bold">{product.name}</h2>

        {/* Rating & Review Count */}
        <div className="d-flex align-items-center gap-3 mt-2">
          <span className="fw-bold">⭐ {averageRating}</span>
          <span>({totalReviews > 0 ? `${totalReviews} reviews` : "No Reviews Yet"})</span>
        </div>

        <div className="row mt-4">
          {/* Left: Product Image */}
          <div className="col-md-5 text-center">
            <img src={product.imageUrl} alt={product.name} className="img-fluid rounded shadow-lg" />
          </div>

          {/* Right: Product Information */}
          <div className="col-md-7">
            {/* Description Box */}
            <div className="p-3 rounded" style={{ backgroundColor: "#1f1c66", color: "white" }}>
              <p className="lead">{product.description}</p>
            </div>

            {/* Technical Details */}
            <table className="table table-bordered mt-3 shadow-sm">
              <tbody>
                <tr><th>Model</th><td>{product.model}</td></tr>
                <tr><th>Serial Number</th><td>{product.serialNumber}</td></tr>
                <tr><th>Stock</th><td>{product.quantity} Available</td></tr>
                <tr><th>Warranty</th><td>{product.warrantyStatus} Years</td></tr>
                <tr><th>Distributor</th><td>{product.distributor}</td></tr>
              </tbody>
            </table>

            {/* Price */}
            <h3 className="fw-bold text-primary mt-3">${product.price.toFixed(2)}</h3>

            {/* Cart & Favorite Buttons */}
            <div className="d-flex gap-3 mt-3">
              <button className="btn btn-primary">🛒 Add to Cart</button>
              <button 
                className={`btn ${isFavorited ? "btn-success" : "btn-outline-danger"}`} 
                onClick={() => setIsFavorited(!isFavorited)}
              >
                {isFavorited ? "✅ Added to Favorites" : "❤️ Add to Favorites"}
              </button>
            </div>
          </div>
        </div>

        {/* ⭐ Rating Breakdown (Kutucuk İçinde) */}

<div className="mt-5 border rounded shadow-sm p-3 bg-white w-50">
  <h6 className="fw-bold" style={{ fontSize: "14px" }}>⭐ Rating Breakdown</h6>
  <div className="progress-container">
    {ratingBreakdown.map((entry) => (
      <div key={entry.stars} className="d-flex align-items-center gap-2 mb-1">
        <span className="fw-bold" style={{ fontSize: "20px" }}>{entry.stars} ⭐</span>
        <div className="progress flex-grow-1" style={{ height: "5px" }}>  {/* Çizgiler uzatıldı */}
          <div
            className="progress-bar bg-warning"
            role="progressbar"
            style={{ width: `${(entry.count / totalReviews) * 100}%` }}
          ></div>
        </div>
        <span style={{ fontSize: "12px" }}>{entry.count}</span>
      </div>
    ))}
  </div>
</div>




        {/* Reviews Section (Inside Shadowed Box) */}
        <div className="mt-5 p-3 rounded shadow" style={{ backgroundColor: "#f8f9fa" }}>
          <h4 className="fw-bold">Customer Reviews</h4>
          {totalReviews > 0 ? (
            <ul className="list-group">
              {product.reviews.map((review, index) => (
                <li key={index} className="list-group-item shadow-sm p-3 mb-2 rounded" style={{ backgroundColor: "#fff" }}>
                  <span className="fw-bold">{"⭐".repeat(review.rating)}</span>
                  <p className="mb-0">{review.comment || "No Comment"}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No Comments Yet.</p>
          )}
        </div>

        {/* Recommended Products Section */}
        <div className="mt-5">
          <h4 className="fw-bold">Recommended Products</h4>
          <div className="row">
            {recommendedProducts.length > 0 ? (
              recommendedProducts.map((rec) => (
                <div key={rec.productId} className="col-md-4">
                  <Link to={`/product/${rec.productId}`} className="text-decoration-none text-dark">
                    <div className="card shadow">
                      <img src={rec.image_url} className="card-img-top" alt={rec.name} />
                      <div className="card-body text-center">
                        <h5 className="card-title">{rec.name}</h5>
                        <p className="card-text">${rec.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-muted">No recommended products found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
