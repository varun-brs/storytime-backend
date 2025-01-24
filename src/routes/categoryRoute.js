import express from "express";
import { getCategory } from "../controllers/categoryController.js";
import { checkToken } from "../middleware/authMiddleware.js";

const route = express.Router();

route.get("/", checkToken, getCategory);

export default route;
