import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  unitPriceMinor: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  imageUrl: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  shippingAddress: {
    recipient: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    postalCode: String,
    country: { type: String, required: true },
    phone: String
  },
  subtotalMinor: { type: Number, required: true, min: 0 },
  shippingMinor: { type: Number, required: true, min: 0, default: 0 },
  totalMinor: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['cash_on_delivery'], default: 'cash_on_delivery' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
