const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrder,
  getAllOrders,
} = require("../../../backend/controllers/orderController");
const { protect, authorize } = require("../../../backend/middleware/auth");

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const url = req.url.replace("/api/orders", "");
    const id = url.split("/")[1];

    if (req.method === "GET") {
      if (url === "/admin/all") {
        return await protect(req, res, () =>
          authorize("admin")(req, res, () => getAllOrders(req, res)),
        );
      } else if (id) {
        req.params = { id };
        return await protect(req, res, () => getOrderById(req, res));
      } else {
        return await protect(req, res, () => getUserOrders(req, res));
      }
    } else if (req.method === "POST") {
      return await protect(req, res, () => createOrder(req, res));
    } else if (req.method === "PUT") {
      req.params = { id };
      return await protect(req, res, () =>
        authorize("admin")(req, res, () => updateOrder(req, res)),
      );
    }

    res.status(404).json({ success: false, message: "Route not found" });
  } catch (error) {
    console.error("Orders API error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
