const {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfileImage,
} = require("../../../backend/controllers/authController");
const { protect } = require("../../../backend/middleware/auth");
const upload = require("../../../backend/middleware/upload");

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "POST") {
      if (req.url === "/api/auth/register") {
        return await register(req, res);
      } else if (req.url === "/api/auth/login") {
        return await login(req, res);
      } else if (req.url === "/api/auth/upload-profile-image") {
        // Handle file upload
        const multer = upload.single("profileImage");
        multer(req, res, async (err) => {
          if (err) {
            return res
              .status(400)
              .json({ success: false, message: err.message });
          }
          return await uploadProfileImage(req, res);
        });
      }
    } else if (req.method === "GET") {
      if (req.url === "/api/auth/me") {
        return await protect(req, res, () => getMe(req, res));
      }
    } else if (req.method === "PUT") {
      if (req.url === "/api/auth/profile") {
        return await protect(req, res, () => updateProfile(req, res));
      }
    }

    res.status(404).json({ success: false, message: "Route not found" });
  } catch (error) {
    console.error("Auth API error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
