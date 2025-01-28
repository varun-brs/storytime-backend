import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  if (!categories.length) {
    return res.status(404).json({
      success: false,
      message: "No categories found",
    });
  }

  res.status(200).json({
    success: true,
    data: categories,
  });
});

export { getCategories };
