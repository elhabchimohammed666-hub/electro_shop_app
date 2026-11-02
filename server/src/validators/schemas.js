import Joi from 'joi';

const address = Joi.object({
  recipient: Joi.string().trim().min(2).max(100).required(),
  line1: Joi.string().trim().min(3).max(200).required(),
  line2: Joi.string().trim().max(200).allow(''),
  city: Joi.string().trim().min(2).max(100).required(),
  postalCode: Joi.string().trim().max(20).allow(''),
  country: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().max(30).allow('')
});

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(8).max(72).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(72).required()
});

export const productSchema = Joi.object({
  title: Joi.string().trim().min(2).max(180).required(),
  description: Joi.string().trim().min(5).max(10000).required(),
  brand: Joi.string().trim().min(1).max(80).required(),
  category: Joi.string().hex().length(24).required(),
  condition: Joi.string().valid('new', 'refurbished').required(),
  priceMinor: Joi.number().integer().min(0).required(),
  currency: Joi.string().length(3).uppercase().default('MAD'),
  stock: Joi.number().integer().min(0).required(),
  specifications: Joi.object().pattern(
    Joi.string().max(40),
    Joi.string().max(200)
  ).default({}),
  images: Joi.array().items(Joi.string().uri({ scheme: ['http', 'https'] })).max(8).default([]),
  isActive: Joi.boolean().default(true)
});

export const orderSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    product: Joi.string().hex().length(24).required(),
    quantity: Joi.number().integer().min(1).max(20).required()
  })).min(1).max(30).required(),
  shippingAddress: address.required()
});

export const orderStatusSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'shipped', 'delivered', 'cancelled').required()
});

export const stockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required()
});

export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(48).default(12),
  q: Joi.string().trim().max(100).allow(''),
  category: Joi.string().hex().length(24),
  brand: Joi.string().trim().max(250).custom((value, helpers) => {
    const brands = value.split(',').map(brand => brand.trim());
    return brands.length <= 10 && brands.every(brand => brand.length > 0 && brand.length <= 80)
      ? value
      : helpers.error('any.invalid');
  }),
  minPrice: Joi.number().integer().min(0),
  maxPrice: Joi.number().integer().min(0),
  sort: Joi.string().valid('newest', 'price_asc', 'price_desc').default('newest')
}).custom((query, helpers) => {
  if (query.minPrice !== undefined && query.maxPrice !== undefined && query.maxPrice < query.minPrice) {
    return helpers.error('any.invalid');
  }
  return query;
});
