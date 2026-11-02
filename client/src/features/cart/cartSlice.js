import { createSlice } from '@reduxjs/toolkit';

function readCart() {
  try {
    return JSON.parse(localStorage.getItem('electro-cart') || '[]');
  } catch {
    return [];
  }
}

function persist(items) {
  localStorage.setItem('electro-cart', JSON.stringify(items));
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: readCart() },
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const existing = state.items.find(item => item._id === product._id);
      if (existing) existing.quantity = Math.min(existing.quantity + 1, product.stock);
      else if (product.stock > 0) state.items.push({ ...product, quantity: 1 });
      persist(state.items);
    },
    setQuantity(state, action) {
      const item = state.items.find(entry => entry._id === action.payload.id);
      if (item) item.quantity = Math.min(Math.max(1, action.payload.quantity), item.stock);
      persist(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(item => item._id !== action.payload);
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.items);
    }
  }
});

export const { addToCart, setQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
