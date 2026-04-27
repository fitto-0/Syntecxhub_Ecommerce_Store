import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { productService } from '../services/api';
import { useCart } from '../hooks/useCart';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';
import './styles/ProductDetailPage.css';

// Utility function to convert relative paths to absolute URLs
const getImageUrl = (url) => {
  if (!url) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%23f5f5f5" width="500" height="500"/%3E%3C/svg%3E';
  if (url.startsWith('data:')) return url;
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        setProduct(response.data.product);
        // Set the first image as the main image
        if (response.data.product.images && response.data.product.images.length > 0) {
          setMainImage(response.data.product.images[0]);
        }
        // Set reviews if available
        if (response.data.product.reviews) {
          setReviews(response.data.product.reviews);
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
      setSuccess(`${product.name} added to cart!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await productService.addReview(product._id, reviewData);
      // Refresh product data to get updated reviews
      const response = await productService.getProductById(id);
      setProduct(response.data.product);
      if (response.data.product.reviews) {
        setReviews(response.data.product.reviews);
      }
      setSuccess('Review submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to submit review');
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="error-container"><p>{error}</p></div>;
  if (!product) return <div className="error-container"><p>Product not found</p></div>;

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/products" className="back-link">← Back to Products</Link>

        <div className="product-detail-wrapper">
          <div className="product-images">
            <div className="main-image">
              <img
                src={getImageUrl(mainImage?.url)}
                alt={product.name}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnails">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(img.url)}
                    alt={`${product.name} ${idx}`}
                    className={`thumbnail ${mainImage?.url === img.url ? 'active' : ''}`}
                    onClick={() => setMainImage(img)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-details">
            

            <div className="rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  size={18}
                  fill={i < Math.round(product.rating) ? '#C9A24D' : 'none'}
                  color={i < Math.round(product.rating) ? '#C9A24D' : '#cbd5e1'}
                />
              ))}
              <span className="review-count">({product.numberOfReviews} reviews)</span>
            </div>

            <div className="price-section">
              {product.discountedPrice ? (
                <>
                  <span className="current-price">${product.discountedPrice.toFixed(2)}</span>
                  <span className="original-price">${product.price.toFixed(2)}</span>
                  <span className="discount-label">
                    Save {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="current-price">${product.price.toFixed(2)}</span>
              )}
            </div>

            <p className="description">{product.description}</p>

            <div className="product-meta">
              <div className="meta-item">
                <span className="label">Stock:</span>
                <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" min="1" max={product.stock} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
              >
                <FiShoppingCart size={20} />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <ReviewForm productId={product._id} onReviewAdded={handleReviewSubmit} />
          <ReviewsList reviews={reviews} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
