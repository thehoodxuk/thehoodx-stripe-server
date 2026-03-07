import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { orderController } from "../controllers/order.controller.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// User routes
router.get("/", asyncHandler(orderController.getMyOrders));
router.get(
  "/session/:sessionId",
  asyncHandler(orderController.getOrderBySession),
);
router.get("/:id", asyncHandler(orderController.getOrder));

// Admin routes (add admin middleware check in controller or create separate admin middleware)
router.get("/admin/all", asyncHandler(orderController.getAllOrders));
router.patch("/:id/status", asyncHandler(orderController.updateOrderStatus));

export default router;
