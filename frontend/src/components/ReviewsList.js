import React from 'react';
import { FiStar } from 'react-icons/fi';
import './styles/ReviewsList.css';

const ReviewsList = ({ reviews }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="reviews-list">
        <h3>Customer Reviews</h3>
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-list">
      <h3>Customer Reviews ({reviews.length})</h3>

      <div className="reviews-container">
        {reviews.map((review, index) => (
          <div key={index} className="review-item">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-name">
                  {review.userId?.firstName && review.userId?.lastName
                    ? `${review.userId.firstName} ${review.userId.lastName}`
                    : 'Anonymous User'
                  }
                </div>
                <div className="review-date">
                  {formatDate(review.createdAt)}
                </div>
              </div>

              <div className="review-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    fill={i < review.rating ? '#c9a24d' : 'none'}
                    color={i < review.rating ? '#c9a24d' : '#e5e7eb'}
                  />
                ))}
              </div>
            </div>

            <div className="review-content">
              <p>{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;