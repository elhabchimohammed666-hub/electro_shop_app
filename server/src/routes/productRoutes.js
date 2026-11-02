import { Router } from 'express';
import {
  createProduct, deleteProduct, getProduct, listProducts, updateProduct, updateProductStock
} from '../controllers/productController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productQuerySchema, productSchema, stockSchema } from '../validators/schemas.js';

const router = Router();
router.get('/', validate(productQuerySchema, 'query'), asyncHandler(listProducts));
router.get('/:id', asyncHandler(getProduct));
router.post('/', authenticate, authorize('admin'), validate(productSchema), asyncHandler(createProduct));
router.patch('/:id', authenticate, authorize('admin'), validate(productSchema), asyncHandler(updateProduct));
router.patch('/:id/stock', authenticate, authorize('admin'), validate(stockSchema), asyncHandler(updateProductStock));
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(deleteProduct));

export default router;
