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
  const [reviewsVisible, setReviewsVisible] = useState(false);

  useEffect(() => {
    if (!productId) return;

    axios.get(`http://localhost:8080/api/products/${productId}/details`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
        return axios.get(`http://localhost:8080/api/products/${productId}/recommended`);
      })
      .then((recommendedResponse) => {
        if (recommendedResponse.data.content && Array.isArray(recommendedResponse.data.content)) {
          setRecommendedProducts(recommendedResponse.data.content);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return <h2 className="text-center mt-5">Loading product details...</h2>;
  }

  if (!product) {
    return <h2 className="text-center mt-5">Product not found.</h2>;
  }

  const totalReviews = product.reviews ? product.reviews.length : 0;
  const averageRating = totalReviews > 0
    ? (product.reviews.reduce((sum, c) => sum + c.rating, 0) / totalReviews).toFixed(1)
    : "No Rating Yet";

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <div className="container mt-5">
        <h2 className="fw-bold">{product.name}</h2>

        {/* Rating & Review Count */}
        <div className="d-flex align-items-center gap-3 mt-2">
          <span className="fw-bold">⭐ {averageRating}</span>
          <span>({totalReviews > 0 ? `${totalReviews} reviews` : "No Reviews Yet"})</span>
        </div>

        <div className="row mt-4">
          <div className="col-md-5 text-center">
            <img src={product.imageUrl} alt={product.name} className="img-fluid rounded shadow-lg" />
          </div>

          <div className="col-md-7">
            {/* Description Box */}
            <div className="p-3 rounded" style={{ backgroundColor: "#1f1c66", color: "white" }}>
              <p className="mb-0" style={{ fontSize: "15px", fontWeight: "400", letterSpacing: "0.5px", lineHeight: "2.6" }}>
                {product.description}
              </p>
            </div>


            <table className="table table-bordered mt-3 shadow-sm">
              <tbody>
                <tr><th>Model</th><td>{product.model}</td></tr>
                <tr><th>Serial Number</th><td>{product.serialNumber}</td></tr>
                <tr><th>Stock</th><td>{product.quantity} Available</td></tr>
                <tr><th>Warranty</th><td>{product.warrantyStatus} Years</td></tr>
                <tr><th>Distributor</th><td>{product.distributor}</td></tr>
              </tbody>
            </table>

            <h3 className="fw-bold text-primary mt-3">${product.price.toFixed(2)}</h3>

            {/* Cart & Favorite Buttons */}
            <div className="d-flex gap-3 mt-3">
              <button className="btn btn-primary shadow-lg" style={{ backgroundColor: "#1f1c66", borderColor: "#1f1c66" }}>
                🛒 Add to Cart
              </button>
              <button 
                className={`btn ${isFavorited ? "btn-success" : "btn-outline-danger"} shadow-lg`} 
                onClick={() => setIsFavorited(!isFavorited)}
              >
                {isFavorited ? "✅ Added to Favorites" : "❤️ Add to Favorites"}
              </button>
            </div>

          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-5 p-3 border rounded shadow-sm bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="fw-bold">Product Reviews</h4>
            <button 
              className="btn shadow-lg" 
              onClick={() => setReviewsVisible(!reviewsVisible)}
              style={{ backgroundColor: "#1f1c66", color: "white", borderColor: "#1f1c66" }}
            >
              {reviewsVisible ? "−" : "+"}
            </button>
          </div>


          {reviewsVisible && (
            <div className="mt-3">
              <div className="border rounded p-3 bg-light">
                <h6 className="fw-bold">⭐ Rating Breakdown</h6>
                <div className="progress-container">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = product.reviews.filter((c) => c.rating === star).length;
                    return (
                      <div key={star} className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold">{star} ⭐</span>
                        <div className="progress flex-grow-1" style={{ height: "5px" }}>
                          <div className="progress-bar bg-warning" role="progressbar"
                            style={{ width: `${(count / totalReviews) * 100}%` }}></div>
                        </div>
                        <span>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 p-3 rounded border bg-light" style={{ maxHeight: "200px", overflowY: "auto" }}>
                <h6 className="fw-bold">Customer Reviews</h6>
                {totalReviews > 0 ? (
                  <ul className="list-group">
                    {product.reviews.map((review, index) => (
                      <li key={index} className="list-group-item p-2">
                        <span className="fw-bold">{"⭐".repeat(review.rating)}</span> - {review.comment || "No Comment"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No Comments Yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recommended Products Section (Mavi Kutunun İçinde) */}
        <div className="mt-5 p-4 rounded shadow-lg" style={{ backgroundColor: "#1f1c66", color: "white" }}>
          <h4 className="fw-bold text-center mb-3">Recommended Products</h4>
          <div className="row">
            {recommendedProducts.length > 0 ? (
              recommendedProducts.map((rec) => (
                <div key={rec.productId} className="col-md-4">
                  <Link to={`/product/${rec.productId}`} className="text-decoration-none text-white">
                    <div className="card bg-light shadow-sm">
                      <img src={rec.image_url} className="card-img-top" alt={rec.name} style={{ maxWidth: "120px", margin: "auto", padding: "10px" }} />
                      <div className="card-body text-center">
                        <h6 className="card-title text-dark">{rec.name}</h6>
                        <p className="card-text text-primary">${rec.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-center">No recommended products found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-4 p-3 bg-dark text-white">
        <p className="mb-0">© 2025 Neptune. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
