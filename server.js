import express from "express";
import bcrypt from "bcryptjs";
import path from "path";
import jwt from "jsonwebtoken";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/dbconnect.js";
import { User, Product, Category } from "./config/model.js";
import { upload } from "./config/multer.js";
import { fileURLToPath } from "url";
import sellerRouter from "./router/sellerRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// create express instance

await connectDB();
const app = express();
const PORT = 4000;

// server middleware

// CORS Configuration
const allowedOrigins = ["http://localhost:5173"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/product_images", express.static(path.join(__dirname, "public/product_images")));

// user authentication api end points

// POST - create customer
app.post("/api/auth/user-register", async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "User already exisits. Please sign in" });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    await User.create({
      name: name,
      email: email,
      password: hashPassword,
    });

    return res.status(201).json("");
  } catch (err) {
    return res.status(400).json({ message: "User already exisits. Please sign in" });
  }
});

// POST - login customer
app.post("/api/auth/user-login", async (req, res) => {
  const { email, password } = req.body;
  const userPassword = password.trim();
  const userEmail = email.trim();

  // check of user / Customer get registered

  const user = await User.findOne({ email: userEmail });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Compare the provided password with the hashed password in the database
  const isPasswordValid = await bcrypt.compare(userPassword, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // generate token
  const tokenValue = jwt.sign({ name: user.name, role: "" }, process.env.JWT_SECRET);
  // If credentials are valid
  res.json({ token: tokenValue });
});

/* SELLER API ENDPOINTS */

app.use("/api/seller", sellerRouter);

// PRODUCT CATEGORY API ENDPOINTS
// POST - create product category
app.post("/api/category", async (req, res) => {
  const { name, description } = req.body;
  try {
    const newCategory = new Category({
      name,
      description,
    });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// GET - get all product categories
app.get("/api/category", async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Edit product category
app.post("/api/category/:id", async (req, res) => {
  const { name, description } = req.body;
  const categoryId = req.params.id;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name, description }, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Delete product category
app.delete("/api/category/:id", async (req, res) => {
  const categoryId = req.params.id;

  try {
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Products api end points

// create new product with image upload

app.post("/api/product", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "File upload error", error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file selected" });
    }

    try {
      const newProduct = new Product({
        product_name: req.body.product_name,
        description: req.body.description,
        category: req.body.category,
        inStock: req.body.inStock, // Ensure categories is an array of ObjectId references
        price: parseFloat(req.body.price), // Ensure price is a number
        image: `/product_images/${req.file.filename}`,
        sale: req.body.sale === "true", // Convert to boolean if needed
        discount: parseFloat(req.body.discount), // Ensure discount is a number
      });

      const savedProduct = await newProduct.save();
      return res.status(201).json(savedProduct);
    } catch (error) {
      console.error("Product creation error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  });
});

// Get All the products
app.get("/api/product", async (req, res) => {
  try {
    const products = await Product.find({});

    // Ensure correct image URLs
    const updatedProducts = products.map((product) => ({
      ...product._doc,
      price: parseFloat(product.price.toString()),
      image: `http://localhost:4000${product.image}`,
    }));

    res.json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT} at http://localhost:${PORT}`);
});
