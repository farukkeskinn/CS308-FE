// src/context/WishlistContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as api from "../api/WishlistApi";

/* ------------------------------------------------------------
   Context + custom hook
   ------------------------------------------------------------ */
const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

/* ------------------------------------------------------------
   Provider
   ------------------------------------------------------------ */
export function WishlistProvider({ children }) {
  /** items = [
   *   {
   *     wishlistItemId: "...",
   *     product: { productId, name, price, ... }
   *   }, ...
   * ]
   */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------  listeyi backend’den çek  ------------ */
  const loadWishlist = useCallback(async () => {
    try {
      const raw = await api.getWishlist();

      // Eğer API doğrudan dizi döndürürse kullan; aksi hâlde
      // { wishlistItems : [...] } objesinden çıkar.
      const list = Array.isArray(raw) ? raw : raw?.wishlistItems ?? [];

      setItems(list);
    } catch (err) {
      console.error("Wishlist fetch failed:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  /* ------------  yardımcılar  ------------ */
  const existsInWishlist = (productId) =>
    items.some((it) => it.product?.productId === productId);

  const addProduct = async (productId) => {
    try {
      await api.addToWishlist(productId); // body { customerId, productId }
      await loadWishlist();               // taze liste
    } catch (err) {
      console.error("addProduct failed:", err);
    }
  };

  const removeProduct = async (wishlistItemId) => {
    try {
      await api.removeFromWishlist(wishlistItemId);
      setItems((prev) =>
        prev.filter((it) => it.wishlistItemId !== wishlistItemId)
      );
    } catch (err) {
      console.error("removeProduct failed:", err);
    }
  };

  const toggleWishlist = async (product) => {
    const { productId } = product;
    if (existsInWishlist(productId)) {
      const found = items.find(
        (it) => it.product?.productId === productId
      );
      if (found) await removeProduct(found.wishlistItemId);
    } else {
      await addProduct(productId);
    }
  };

  /* ------------  context değeri  ------------ */
  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        existsInWishlist,
        addProduct,
        removeProduct,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
