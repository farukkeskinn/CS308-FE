import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem("shoppingCart");
      if (!raw || raw === "undefined") return []; // 👈 burası kritik
      return JSON.parse(raw);
    } catch (err) {
      console.error("Sepet parse edilemedi:", err);
      return [];
    }
  });
  

  useEffect(() => {
    localStorage.setItem("shoppingCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const getCartTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const addToCart = async (product, quantity = 1) => {
    const jwtToken = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");
  
    if (!jwtToken || !customerId) {
      // 🌐 GUEST FLOW (localStorage + Context only)
      const updatedCart = [...cartItems];
      const index = updatedCart.findIndex((item) => item.productId === product.productId);
  
      if (index > -1) {
        updatedCart[index].quantity += quantity;
      } else {
        updatedCart.push({ ...product, quantity });
      }
  
      setCartItems(updatedCart);
    } else {
      // 🔐 LOGGED-IN FLOW (POST to API + Update Context)
      try {
        console.log("🟢 Posting to /add-item with:", {
          customerId,
          productId: product.productId,
          quantity,
        });
        const response = await fetch("http://localhost:8080/api/cart-management/add-item", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            customerId,
            productId: product.productId,
            quantity,
          }),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          if (result.message === "There is no enough stock") {
            alert("Stok yetersiz!");
          } else {
            // ✅ Optimistically update cartItems
            const updatedCart = [...cartItems];
            const index = updatedCart.findIndex((item) => item.productId === product.productId);
  
            if (index > -1) {
              updatedCart[index].quantity += quantity;
            } else {
              updatedCart.push({ ...product, quantity });
            }
  
            setCartItems(updatedCart);
          }
        } else {
          console.error("Sepet API hatası:", result.message);
        }
      } catch (err) {
        console.error("Sepete ekleme hatası:", err);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, getCartTotalQuantity, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
