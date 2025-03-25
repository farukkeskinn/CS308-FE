import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Container, Row, Col, Image } from 'react-bootstrap';
import { useCartContext } from '../../context/CartContext';

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const { setCartItems: updateContextCart } = useCartContext();
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    setCartItems(storedCart);
  }, []);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
  const hasOutOfStockItem = cartItems.some(item => item.stock === 0);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const updateQuantity = (index, newQuantity) => {
    const updatedCart = [...cartItems];
    if (newQuantity === 0) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = newQuantity;
    }
    setCartItems(updatedCart);
    localStorage.setItem('shoppingCart', JSON.stringify(updatedCart));
    updateContextCart(updatedCart);
  };

  const removeItemFromCart = (index) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
    localStorage.setItem('shoppingCart', JSON.stringify(updatedCart));
    updateContextCart(updatedCart);
  };

  const emptyCart = () => {
    setCartItems([]);
    localStorage.removeItem('shoppingCart');
    updateContextCart([]);
  };

  const handleCheckout = () => {
    if (!localStorage.getItem('jwtToken')) {
      setErrorMessage('⚠️ Please login to proceed to checkout.');
      return;
    }
    if (hasOutOfStockItem) {
      setErrorMessage('⚠️ Please remove out-of-stock items to proceed.');
      return;
    }
    navigate('/checkout');
  };
  

  return (
    <Container className="my-5">
      <Row>
        {/* 🛒 Cart Items */}
        <Col md={8}>
          <h3 className="mb-4">Shopping Cart</h3>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map((item, idx) => (
              <Card key={item.productId} className="mb-3 p-3 d-flex flex-row align-items-center shadow-sm">
                {/* ✅ Image and Name clickable */}
                <Link to={`/product/${item.productId}`} className="text-decoration-none">
                  <Image src={item.image_url} rounded style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                </Link>

                <div className="flex-grow-1 ms-4">
                  <Link to={`/product/${item.productId}`} className="text-decoration-none text-dark">
                    <h5>{item.name}</h5>
                  </Link>
                  <p>{item.description}</p>
                  {item.stock === 0 ? (
                    <p className="text-danger fw-bold">Out of Stock</p>
                  ) : (
                    <p className="text-muted">In Stock: {item.stock}</p>
                  )}
                </div>

                <div className="text-end">
                  <h4 className="text-primary">${(item.price * item.quantity).toFixed(2)}</h4>

                  {/* ✅ Quantity Controls */}
                  <div className="d-flex align-items-center justify-content-end my-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      disabled={item.quantity === 1}
                    >-</Button>
                    <span className="mx-3 fw-bold">{item.quantity}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                    >+</Button>
                  </div>

                  {/* ✅ Remove Button */}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeItemFromCart(idx)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))
          )}
        </Col>

        {/* ✅ Right Sidebar */}
        <Col md={4}>
          <Card className="p-4 shadow">
            <h4>Total: ${totalPrice}</h4>

            {/* ✅ Error Message Alert */}
            {errorMessage && (
              <div className="alert alert-danger text-center fw-bold" role="alert">
                {errorMessage}
              </div>
            )}

            {/* ✅ Checkout Button with Handler */}
            <Button
              variant="primary"
              className="w-100 my-2"
              onClick={handleCheckout}
            >
              Go To Checkout
            </Button>

            <Button variant="outline-secondary" className="w-100" as={Link} to="/">
              Continue Shopping
            </Button>

            <Button
              variant="danger"
              className="w-100 mt-3"
              onClick={emptyCart}
            >
              🗑 Empty Cart
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
