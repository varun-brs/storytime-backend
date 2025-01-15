import Category from "../models/categoryModel.js";

const getCategory = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).send(categories);
  } catch (error) {
    return next(error);
  }
};

export { getCategory };
