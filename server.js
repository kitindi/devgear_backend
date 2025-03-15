import express from "express";
import bcrypt from "bcryptjs";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/dbconnect.js";
import User from "./config/model.js";

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
// user authentication api end points

// POST - create user
app.post("/api/auth/user-register", async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "User already exisits. Please sign in" });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const user = await User.create({
      name: name,
      email: email,
      password: hashPassword,
    });

    return res.status(201).json("");
  } catch (err) {
    return res.status(400).json({ message: "User already exisits. Please sign in" });
  }
});

// POST - login user
app.post("/api/auth/user-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).exec();

    if (!user | !bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: "Not authorized" });
    } else {
      return res.json({ name: user.name });
    }
  } catch (err) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT} at http://localhost:${PORT}`);
});
