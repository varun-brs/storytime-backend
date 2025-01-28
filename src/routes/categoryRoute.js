import express from "express";
import { getCategories } from "../controllers/categoryController.js";
import { checkToken } from "../middleware/authMiddleware.js";

const route = express.Router();

route.get("/", checkToken, getCategories);

export default route;
