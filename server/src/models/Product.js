import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true, maxlength: 10000 },
  brand: { type: String, required: true, trim: true, maxlength: 80, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  condition: { type: String, enum: ['new', 'refurbished'], required: true },
  priceMinor: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'MAD', uppercase: true, minlength: 3, maxlength: 3 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  specifications: { type: Map, of: String, default: {} },
  images: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, priceMinor: 1 });

export default mongoose.model('Product', productSchema);
