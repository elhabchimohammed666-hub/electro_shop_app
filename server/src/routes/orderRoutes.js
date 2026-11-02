import { Router } from 'express';
import {
  createOrder, listAllOrders, listMyOrders, updateOrderStatus
} from '../controllers/orderController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { orderSchema, orderStatusSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate);
router.post('/', validate(orderSchema), asyncHandler(createOrder));
router.get('/me', authorize('client', 'admin'), asyncHandler(listMyOrders));
router.get('/', authorize('admin'), asyncHandler(listAllOrders));
router.patch('/:id/status', authorize('admin'), validate(orderStatusSchema), asyncHandler(updateOrderStatus));

export default router;
