import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { categoryController } from "../controllers/category.controller.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(categoryController.list));
categoriesRouter.get(
  "/:idOrSlug",
  asyncHandler(categoryController.getByIdOrSlug),
);
categoriesRouter.get(
  "/:idOrSlug/products",
  asyncHandler(categoryController.getProducts),
);
