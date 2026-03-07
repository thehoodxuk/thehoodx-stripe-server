import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { productController } from "../controllers/product.controller.js";

export const productsRouter = Router();

productsRouter.get("/", asyncHandler(productController.list));
productsRouter.get("/featured", asyncHandler(productController.featured));
productsRouter.get("/filters", asyncHandler(productController.filters));
productsRouter.get("/:id", asyncHandler(productController.getById));
