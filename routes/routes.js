const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authController = require("../controllers/authController");
const { verifyUser } = require("../middleware/auth");
const {
  updateProfile,
  getProfile,
} = require("../controllers/profileController");
const {
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/blogController");
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, and PNG images are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

router.post("/signup", upload.single("profileImage"), authController.signup);
router.post("/login", authController.login);

router.post("/comments", verifyUser, addComment);
router.get("/comments/:blogId", getComments);
router.delete("/comments/:commentId", verifyUser, deleteComment);

router.post("/blogs", verifyUser, upload.single("image"), createBlog);
router.get("/blogs", getBlogs);
router.get("/blogs/:id", getBlogById);
router.put("/blogs/:id", verifyUser, upload.single("image"), updateBlog);
router.delete("/blogs/:id", verifyUser, upload.single("image"), deleteBlog);

router.put(
  "/profile",
  verifyUser,
  upload.single("profileImage"),
  updateProfile
);
router.get("/profile", verifyUser, getProfile);

module.exports = router;
