// src/api/WishlistApi.js
import axios from "axios";

/* ------------------------------------------------------------------
   Ortak ayarlar
   ------------------------------------------------------------------ */
const BASE = `${process.env.REACT_APP_API_BASE_URL}/api/wishlist`;        // tekil path
const authHeader = () => {
  const token = localStorage.getItem("jwtToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ------------------------------------------------------------------
   1)  Kullanıcının favori listesi
       GET /api/wishlist/by-customer/{customerId}
   ------------------------------------------------------------------ */
export async function getWishlist() {
  const customerId = localStorage.getItem("customerId");
  if (!customerId) throw new Error("customerId not found in localStorage");

  const { data } = await axios.get(
    `${BASE}/by-customer/${customerId}`,
    { headers: authHeader() }
  );
  // data = { wishlistId, wishlistStatus, wishlistItems:[ { wishlistItemId, product:{...} } ] }
  return data;
}

/* ------------------------------------------------------------------
   2)  Ürün ekle
       POST /api/wishlist/add-item-to-wishlist
       Body: { customerId, productId }
   ------------------------------------------------------------------ */
export async function addToWishlist(productId) {
  const customerId = localStorage.getItem("customerId");
  if (!customerId) throw new Error("customerId not found in localStorage");

  const payload = { customerId, productId };

  const { data } = await axios.post(
    `${BASE}/add-item-to-wishlist`,
    payload,
    { headers: { ...authHeader(), "Content-Type": "application/json" } }
  );
  return data;         // backend Wishlist objesini döndürüyor
}

/* ------------------------------------------------------------------
   3)  Ürün çıkar
       DELETE /api/wishlist/remove-item-from-wishlist/{itemId}
       itemId = wishlistItemId
   ------------------------------------------------------------------ */
export async function removeFromWishlist(itemId) {
  await axios.delete(
    `${BASE}/remove-item/${itemId}`,
    { headers: authHeader() }
  );
}

/* ------------------------------------------------------------------
   4)  (Opsiyonel) Tek ürün detayı – kartlardaki refresh vb. için
       GET /api/products/{productId}
   ------------------------------------------------------------------ */
export async function fetchProduct(productId) {
  const { data } = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}`
  );
  return data;
}
