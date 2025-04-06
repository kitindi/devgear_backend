import express from "express";
import { registerSeller, loginSeller } from "../controller/sellerController.js";

const sellerRouter = express.Router();

// POST - create seller
sellerRouter.post("/register", registerSeller);
// POST - login seller
sellerRouter.post("/login", loginSeller);

export default sellerRouter;
