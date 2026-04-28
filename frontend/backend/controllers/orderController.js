const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Prepare order items - filter out deleted products
    const items = cart.items
      .filter((item) => item.productId !== null) // Skip deleted products
      .map((item) => ({
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid products in cart' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping for orders over $100
    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + shippingCost + tax;

    // Generate unique order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Set initial order status based on payment method
    let orderStatus = 'pending';
    let paymentStatus = 'pending';

    // For digital payments (credit/debit card, PayPal), set to processing
    if (['credit_card', 'debit_card', 'paypal'].includes(paymentMethod)) {
      orderStatus = 'processing';
      paymentStatus = 'pending'; // Would be 'completed' after actual payment processing
    }
    // For bank transfer, keep as pending until payment is confirmed
    else if (paymentMethod === 'bank_transfer') {
      orderStatus = 'pending';
      paymentStatus = 'pending';
    }

    const order = await Order.create({
      orderNumber,
      userId: req.user.id,
      items,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      paymentMethod,
      paymentStatus,
      orderStatus,
    });

    // Reduce product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    // Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrder = async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    order = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
