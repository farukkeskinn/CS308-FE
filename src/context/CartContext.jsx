import { createContext, useContext, useState, useEffect } from "react";
import React from "react";

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

  const clearCart = () => {
    setCartItems([]);                  
    localStorage.setItem("shoppingCart", "[]");
  };

  const getCartTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

    const updateContextCart = (newCart) => {
      setCartItems(newCart);
      localStorage.setItem("shoppingCart", JSON.stringify(newCart));
    };
  
    // 🔁 Move fetchUserCart here:
    const fetchUserCart = async (customerId, jwtToken) => {
      try {
        const response = await fetch(`http://localhost:8080/api/cart-management/cart-by-customer/${customerId}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
  
        if (!response.ok) {
          console.error("Cart fetch failed with status:", response.status);
          return;
        }
  
        const result = await response.json();
  
        if (result.shoppingCartItems && Array.isArray(result.shoppingCartItems)) {
          const formattedCart = result.shoppingCartItems.map(item => {
            const formattedItem = {
              productId: item.product.productId,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              shoppingCartItemId: item.shoppingCartItemId, // fix: use snake_case key from backend
            };
            return formattedItem;
          });
          
          
          setCartItems(formattedCart);
          localStorage.setItem("shoppingCart", JSON.stringify(formattedCart));
        } else {
          console.warn("Beklenen shoppingCartItems yok:", result);
        }
      } catch (error) {
        console.error("fetchUserCart hatası:", error);
      }
    };
  

    const addToCart = async (product, quantity = 1) => {
      const jwtToken = localStorage.getItem("jwtToken");
      const customerId = localStorage.getItem("customerId");
    
      if (!jwtToken || !customerId) {
        const updatedCart = [...cartItems];
        const index = updatedCart.findIndex((item) => item.productId === product.productId);
    
        if (index > -1) {
          updatedCart[index].quantity += quantity;
        } else {
          updatedCart.push({ ...product, quantity });
        }
    
        setCartItems(updatedCart);
      } else {
        try {
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
              await fetchUserCart(customerId, jwtToken); // ✅ Refresh cart from DB
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
    <CartContext.Provider value={{ cartItems, setCartItems, getCartTotalQuantity, addToCart, fetchUserCart, updateContextCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
