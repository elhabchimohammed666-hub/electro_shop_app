import Product from '../models/Product.js';

export async function listProducts(req, res) {
  const query = req.validatedQuery || req.query;
  const page = query.page || 1;
  const limit = query.limit || 12;
  const filter = { isActive: true };
  if (query.category) filter.category = query.category;
  if (query.brand) {
    const brands = query.brand.split(',').map(brand => new RegExp(`^${escapeRegex(brand.trim())}$`, 'i'));
    filter.brand = brands.length > 1 ? { $in: brands } : brands[0];
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.priceMinor = {};
    if (query.minPrice !== undefined) filter.priceMinor.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.priceMinor.$lte = query.maxPrice;
  }
  if (query.q) filter.$text = { $search: query.q };
  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { priceMinor: 1 },
    price_desc: { priceMinor: -1 }
  };
  const sort = sortOptions[query.sort] || sortOptions.newest;
  const [items, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)
  ]);
  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getProduct(req, res) {
  const product = await Product.findOne({ _id: req.params.id, isActive: true })
    .populate('category', 'name slug');
  if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
  res.json({ product });
}

export async function createProduct(req, res) {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
}

export async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
  res.json({ product });
}

export async function deleteProduct(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id, { isActive: false }, { new: true }
  );
  if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
  res.json({ message: 'Produit retiré du catalogue.' });
}

export async function updateProductStock(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id, { stock: req.body.stock }, { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
  res.json({ product });
}
