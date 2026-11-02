import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export async function createOrder(req, res) {
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const mergedItems = new Map();
      for (const item of req.body.items) {
        mergedItems.set(item.product, (mergedItems.get(item.product) || 0) + item.quantity);
      }

      const items = [];
      let subtotalMinor = 0;
      let currency = null;
      for (const [productId, quantity] of mergedItems) {
        const product = await Product.findOneAndUpdate(
          { _id: productId, isActive: true, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session }
        );
        if (!product) {
          const error = new Error('Un produit est indisponible ou en quantité insuffisante.');
          error.status = 409;
          throw error;
        }
        subtotalMinor += product.priceMinor * quantity;
        if (currency && currency !== product.currency) {
          const error = new Error('Les produits doivent utiliser la même devise.');
          error.status = 409;
          throw error;
        }
        currency = product.currency;
        items.push({
          product: product._id,
          title: product.title,
          unitPriceMinor: product.priceMinor,
          quantity,
          imageUrl: product.images[0]
        });
      }

      [order] = await Order.create([{
        user: req.user._id,
        items,
        shippingAddress: req.body.shippingAddress,
        subtotalMinor,
        shippingMinor: 0,
        totalMinor: subtotalMinor,
        currency: currency || 'MAD',
        paymentMethod: 'cash_on_delivery'
      }], { session });
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json({ order });
}

export async function listMyOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
}

export async function listAllOrders(req, res) {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
  res.json({ orders });
}

export async function updateOrderStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Commande introuvable.' });
  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
  };
  const nextStatus = req.body.status;
  if (!allowedTransitions[order.status].includes(nextStatus)) {
    return res.status(409).json({ message: 'Transition de statut impossible.' });
  }
  if (nextStatus === 'cancelled') {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const item of order.items) {
          await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
        }
        order.status = nextStatus;
        await order.save({ session });
      });
    } finally {
      await session.endSession();
    }
  } else {
    order.status = nextStatus;
    await order.save();
  }
  res.json({ order });
}
