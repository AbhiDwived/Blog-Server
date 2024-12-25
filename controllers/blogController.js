const Blog = require("../models/Blog");
const Comment = require("../models/Comment");

exports.addComment = async (req, res) => {
  const { blogId, content, parentComment } = req.body;

  if (!content || !blogId) {
    return res
      .status(400)
      .json({ success: false, message: "Content and blog ID are required." });
  }

  try {
    const comment = new Comment({
      blog: blogId,
      user: req.user.id,
      content,
      parentComment: parentComment || null,
    });

    await comment.save();

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add comment. Please try again.",
    });
  }
};

exports.getComments = async (req, res) => {
  const { blogId } = req.params;

  try {
    const comments = await Comment.find({ blog: blogId })
      .populate("user", "name") 
      .populate("parentComment")
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve comments. Please try again.",
    });
  }
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted.",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete comment. Please try again.",
    });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const user = req.user.id;

    const { title, description } = req.body;
    const image = req.file ? req.file.filename : null; 

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const newBlog = new Blog({
      title,
      description,
      image,
      user, 
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({
      success: true,
      blog: savedBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(400).json({
      success: false,
      error: "Failed to create blog. Please try again.",
    });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit parameters.",
      });
    }

    const blogs = await Blog.find()
      .populate("user", "name")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    const totalBlogs = await Blog.countDocuments();

    const formattedBlogs = blogs.map((blog) => ({
      id: blog._id,
      title: blog.title,
      image: blog.image ? `http://localhost:5000/uploads/${blog.image}` : null,
      description: blog.description,
      author: blog.user ? blog.user.name : "Unknown",
    }));

    res.status(200).json({
      success: true,
      totalBlogs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalBlogs / limit),
      blogs: formattedBlogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(400).json({
      success: false,
      error: "Failed to fetch blogs. Please try again.",
    });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("user", "name");
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    res.status(200).json({
      success: true,
      blog: {
        id: blog._id,
        title: blog.title,
        image: blog.image
          ? `http://localhost:5000/uploads/${blog.image}`
          : null,
        description: blog.description,
        author: blog.user ? blog.user.name : "Unknown",
      },
    });
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res.status(400).json({
      success: false,
      error: "Failed to fetch blog. Please try again.",
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.filename : null;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (image) updateData.image = image;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } 
    );

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    res.status(200).json({
      success: true,
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(400).json({
      success: false,
      error: "Failed to update blog. Please try again.",
    });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(400).json({
      success: false,
      error: "Failed to delete blog. Please try again.",
    });
  }
};
