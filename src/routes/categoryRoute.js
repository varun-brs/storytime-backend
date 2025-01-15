import express from "express";
import { getCategory } from "../controllers/categoryController.js";

const route = express.Router();

route.get("/", getCategory);

export default route;
