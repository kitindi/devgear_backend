import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const ProductSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    image: {
      type: String,
    },
    sale: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
    },
  },
  { timestamps: true }
);

// product categories

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Category = mongoose.model.Category || mongoose.model("Category", CategorySchema);

const Product = mongoose.model.Product || mongoose.model("Product", ProductSchema);
const User = mongoose.model.User || mongoose.model("User", UserSchema);

export { Product, User, Category };
