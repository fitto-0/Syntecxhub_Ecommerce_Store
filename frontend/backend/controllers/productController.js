const Product = require("../models/Product");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let products;

    if (sort === "price_asc") {
      products = Product.find(query).sort({ price: 1 });
    } else if (sort === "price_desc") {
      products = Product.find(query).sort({ price: -1 });
    } else if (sort === "newest") {
      products = Product.find(query).sort({ createdAt: -1 });
    } else if (sort === "rating") {
      products = Product.find(query).sort({ rating: -1 });
    } else if (sort === "random") {
      products = Product.aggregate([
        { $match: query },
        { $sample: { size: 100 } },
      ]);
    } else {
      // Default to random for diverse display
      products = Product.aggregate([
        { $match: query },
        { $sample: { size: 100 } },
      ]);
    }

    const data = await products;

    res.status(200).json({
      success: true,
      count: data.length,
      products: data,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.userId",
      "firstName lastName",
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, discountedPrice, category, stock } =
      req.body;

    console.log("===== CREATE PRODUCT REQUEST =====");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("Files length:", req.files ? req.files.length : "undefined");
    console.log("Files array:", Array.isArray(req.files));

    // Create images array from uploaded files
    let images = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      images = req.files.map((file) => {
        console.log("Processing file:", file.filename);
        return {
          url: `/uploads/${file.filename}`,
          alt: name || "Product image",
        };
      });
      console.log("Images array created:", images);
    } else {
      console.log("No files found - returning error");
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one image is required",
          filesReceived: req.files,
        });
    }

    // Create product with all data
    const productData = {
      name,
      description,
      price: parseFloat(price),
      discountedPrice: discountedPrice
        ? parseFloat(discountedPrice)
        : parseFloat(price),
      category,
      stock: parseInt(stock) || 0,
      images,
    };

    const product = await Product.create(productData);

    console.log("Product saved to database:", product);
    console.log("Saved images:", product.images);
    console.log("===== END CREATE PRODUCT =====");

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, discountedPrice, category, stock } =
      req.body;

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    console.log("Updating product:", req.params.id);
    console.log("Files received:", req.files);

    // Handle image updates - only new images, no existing images
    let images = [];

    // Add newly uploaded files
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        alt: name || "Product image",
      }));
      console.log("New images created:", images);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    // Create update data
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      discountedPrice: discountedPrice
        ? parseFloat(discountedPrice)
        : parseFloat(price),
      category,
      stock: parseInt(stock) || 0,
      images,
    };

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    console.log("Product updated with images:", product.images);

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add review to product
// @route   POST /api/products/:id/review
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (!comment || comment.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Comment is required" });
    }

    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const review = {
      userId: req.user.id,
      rating: Number(rating),
      comment: comment.trim(),
    };

    product.reviews.push(review);

    // Update product rating
    const avgRating =
      product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length;
    product.rating = avgRating;
    product.numberOfReviews = product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      product,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
