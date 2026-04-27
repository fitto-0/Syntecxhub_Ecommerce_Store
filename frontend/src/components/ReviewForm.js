import React, { useState } from "react";
import { FiStar } from "react-icons/fi";
import { productService } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import "./styles/ReviewForm.css";

const ReviewForm = ({ productId, onReviewAdded }) => {
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log("ReviewForm auth status:", { isAuthenticated, user });

  if (!isAuthenticated) {
    return (
      <div className="review-form">
        <h3>Write a Review</h3>
        <div className="auth-required">
          <p>
            Please <a href="/login">log in</a> to write a review.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    if (!isAuthenticated) {
      setError("You must be logged in to submit a review");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Submitting review:", {
        productId,
        rating: Number(rating),
        comment: comment.trim(),
      });

      const response = await productService.addReview(productId, {
        rating: Number(rating),
        comment: comment.trim(),
      });

      console.log("Review submitted successfully:", response);

      // Reset form
      setRating(0);
      setComment("");
      onReviewAdded();
    } catch (err) {
      console.error("Review submission error:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error headers:", err.response?.headers);
      setError(err.response?.data?.message || "Failed to add review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form">
      <h3>Write a Review</h3>

      <form onSubmit={handleSubmit}>
        <div className="rating-input">
          <label>Rating:</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                size={24}
                className={`star ${star <= (hoverRating || rating) ? "active" : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
          <span className="rating-text">
            {rating > 0 && `${rating} star${rating !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="comment-input">
          <label htmlFor="comment">Comment:</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={4}
            maxLength={500}
          />
          <div className="char-count">{comment.length}/500</div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-review-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
