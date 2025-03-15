import express from "express";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { connectDB } from "./config/dbconnect.js";
import User from "./config/model.js";

// create express instance

await connectDB();
const app = express();
const PORT = 4000;

// server middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// user authentication api end points

// POST - create user
app.post("/api/auth/user-register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const user = await User.create({ email, password: hashPassword });

    res.json({ user: user });
  } catch (error) {
    console.log(error.message);
  }
});

// POST - login user
app.post("/api/auth/user-login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  res.send(`User logged in`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT} at http://localhost:${PORT}`);
});
