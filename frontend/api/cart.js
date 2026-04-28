const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../../../backend/controllers/cartController');
const { protect } = require('../../../backend/middleware/auth');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const url = req.url.replace('/api/cart', '');

    if (req.method === 'GET') {
      return await protect(req, res, () => getCart(req, res));
    } else if (req.method === 'POST') {
      if (url === '/add') {
        return await protect(req, res, () => addToCart(req, res));
      }
    } else if (req.method === 'PUT') {
      if (url.startsWith('/item/')) {
        const itemId = url.split('/item/')[1];
        req.params = { itemId };
        return await protect(req, res, () => updateCartItem(req, res));
      }
    } else if (req.method === 'DELETE') {
      if (url.startsWith('/item/')) {
        const itemId = url.split('/item/')[1];
        req.params = { itemId };
        return await protect(req, res, () => removeFromCart(req, res));
      } else {
        return await protect(req, res, () => clearCart(req, res));
      }
    }

    res.status(404).json({ success: false, message: 'Route not found' });
  } catch (error) {
    console.error('Cart API error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}