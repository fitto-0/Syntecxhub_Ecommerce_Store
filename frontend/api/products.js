const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} = require('../../../backend/controllers/productController');
const { protect, authorize } = require('../../../backend/middleware/auth');
const upload = require('../../../backend/middleware/upload');

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
    const url = req.url.replace('/api/products', '');
    const id = url.split('/')[1];

    if (req.method === 'GET') {
      if (id) {
        req.params = { id };
        return await getProductById(req, res);
      } else {
        return await getProducts(req, res);
      }
    } else if (req.method === 'POST') {
      if (url.includes('/review')) {
        req.params = { id };
        return await protect(req, res, () => addReview(req, res));
      } else {
        // Handle file upload for product creation
        const multer = upload.array('images', 10);
        multer(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ success: false, message: err.message });
          }
          return await protect(req, res, () => authorize('admin')(req, res, () => createProduct(req, res)));
        });
      }
    } else if (req.method === 'PUT') {
      req.params = { id };
      // Handle file upload for product update
      const multer = upload.array('images', 10);
      multer(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
        return await protect(req, res, () => authorize('admin')(req, res, () => updateProduct(req, res)));
      });
    } else if (req.method === 'DELETE') {
      req.params = { id };
      return await protect(req, res, () => authorize('admin')(req, res, () => deleteProduct(req, res)));
    }

    res.status(404).json({ success: false, message: 'Route not found' });
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}