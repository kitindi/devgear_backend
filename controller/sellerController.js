import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Seller from "../model/SellerModel.js";

export const registerSeller = async (req, res) => {
  const { name, email, password, phone_number, address, role } = req.body;
  console.log(name, email, password, phone_number, address, role);
  // check if user is registered

  try {
    const sellerExists = await Seller.findOne({ email });

    if (sellerExists) {
      return res.status(400).json({ message: "Seller already exists. Please sign in" });
    }

    // Validate the input fields

    if (!name || !email || !password || !phone_number || !address || !role) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    await Seller.create({
      name,
      email,
      password: hashPassword,
      phone_number,
      address,
      role: role || "seller",
    });

    return res.status(201).json({ message: "Seller registered successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Seller login

export const loginSeller = async (req, res) => {
  const { email, password } = req.body;
  const sellerPassword = password.trim();
  const sellerEmail = email.trim();
  // check of user is registered

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  const seller = await Seller.findOne({ email: sellerEmail });
  if (!seller) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  // Compare the provided password with the hashed password in the database
  const isPasswordValid = await bcrypt.compare(sellerPassword, seller.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // generate token
  const tokenValue = jwt.sign({ username: seller.name }, process.env.JWT_SECRET, {
    expiresIn: "3h",
  });
  // If credentials are valid
  res.json({ token: tokenValue });
};

// Seller logout

const sellerLogout = async (req, res) => {};
