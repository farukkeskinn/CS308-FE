import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Container, Row, Col, Image } from 'react-bootstrap';

export default function ShoppingCart({ isLoggedIn }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    setCartItems(storedCart);
  }, []);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  const updateQuantity = (index, newQuantity) => {
    const updatedCart = [...cartItems];
    if (newQuantity === 0) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = newQuantity;
    }
    setCartItems(updatedCart);
    localStorage.setItem('shoppingCart', JSON.stringify(updatedCart));
  };

  const removeItemFromCart = (index) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
    localStorage.setItem('shoppingCart', JSON.stringify(updatedCart));
  };

  const emptyCart = () => {
    setCartItems([]);
    localStorage.removeItem('shoppingCart');
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
                <Image src={item.image_url} rounded style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                <div className="flex-grow-1 ms-4">
                  <h5>{item.name}</h5>
                  <p>{item.description}</p>

                  {/* Quantity Controls */}
                  <div className="d-flex align-items-center mb-2">
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

                <div className="text-end">
                  <h4 className="text-primary">${(item.price * item.quantity).toFixed(2)}</h4>
                </div>
              </Card>
            ))
          )}
        </Col>

        {/* ✅ Right Sidebar */}
        <Col md={4}>
          <Card className="p-4 shadow">
            <h4>Total: ${totalPrice}</h4>

            <Button
              variant="primary"
              className="w-100 my-2"
              disabled={!isLoggedIn}
              as={Link}
              to={isLoggedIn ? '/checkout' : '#'}
            >
              Go To Checkout
            </Button>

            <Button variant="outline-secondary" className="w-100" as={Link} to="/">
              Continue Shopping
            </Button>

            {/* ✅ Empty Cart Button */}
            <Button
              variant="danger"
              className="w-100 mt-3"
              onClick={emptyCart}
            >
              🗑 Empty Cart
            </Button>

            {!isLoggedIn && (
              <small className="text-danger mt-2 d-block">
                Login to proceed to checkout.
              </small>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
