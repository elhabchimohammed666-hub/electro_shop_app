import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { priceLabel } from '../components/ProductCard.jsx';
import { api, getApiError } from '../features/api.js';
import { clearCart, removeFromCart, setQuantity } from '../features/cart/cartSlice.js';

export default function CartPage() {
  const items = useSelector(state => state.cart.items);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ recipient: '', line1: '', city: '', postalCode: '', country: 'Maroc', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const total = items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);

  async function checkout(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/orders', {
        items: items.map(item => ({ product: item._id, quantity: item.quantity })),
        shippingAddress: address
      });
      dispatch(clearCart());
      navigate('/compte');
    } catch (checkoutError) {
      setError(getApiError(checkoutError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="cart-page">
      <Link to="/" className="back-link"><ArrowLeft size={15} /> Continuer mes découvertes</Link>
      <div className="cart-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> VOTRE SÉLECTION</div><h1>Le panier, <em>bien pensé.</em></h1></div><span>{items.length} article{items.length !== 1 ? 's' : ''}</span></div>
      {!items.length ? <div className="empty-cart"><ShoppingBag size={27} /><h2>Il est un peu trop léger, ce panier.</h2><p>Quelques belles découvertes vous attendent.</p><Link to="/" className="primary-button">Explorer la sélection <ArrowRight size={16} /></Link></div> :
        <div className="cart-layout"><div className="cart-items">{items.map(item => <article className="cart-item" key={item._id}><div className="cart-item-image">{item.images?.[0] ? <img src={item.images[0]} alt="" /> : <span>{item.brand?.slice(0, 1)}</span>}</div><div className="cart-item-info"><span>{item.brand} · {item.category?.name || 'Électronique'}</span><h3>{item.title}</h3><strong>{priceLabel(item.priceMinor)}</strong><div className="quantity-control"><button aria-label="Diminuer" onClick={() => item.quantity === 1 ? dispatch(removeFromCart(item._id)) : dispatch(setQuantity({ id: item._id, quantity: item.quantity - 1 }))}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label="Augmenter" onClick={() => dispatch(setQuantity({ id: item._id, quantity: item.quantity + 1 }))}><Plus size={13} /></button></div></div><button className="remove-item" aria-label="Supprimer l’article" onClick={() => dispatch(removeFromCart(item._id))}><Trash2 size={16} /></button></article>)}</div>
          <aside className="checkout-card"><div className="checkout-title">ON FINALISE ? <span>↗</span></div><div className="checkout-total"><span>Sous-total</span><strong>{priceLabel(total)}</strong></div><div className="checkout-shipping"><span>Livraison</span><span>Calculée à la commande</span></div><div className="checkout-separator" /><div className="checkout-total grand-total"><span>Total estimé</span><strong>{priceLabel(total)}</strong></div>
            {!user ? <div className="login-prompt"><p>Connectez-vous pour confirmer votre panier.</p><Link to="/compte" className="primary-button">Se connecter <ArrowRight size={16} /></Link></div> :
              <form className="checkout-form" onSubmit={checkout}><h3>Où vous livrer ?</h3><label>Nom du destinataire<input required minLength="2" value={address.recipient} onChange={event => setAddress({ ...address, recipient: event.target.value })} /></label><label>Adresse<input required minLength="3" value={address.line1} onChange={event => setAddress({ ...address, line1: event.target.value })} /></label><div className="checkout-form-row"><label>Ville<input required value={address.city} onChange={event => setAddress({ ...address, city: event.target.value })} /></label><label>Code postal<input value={address.postalCode} onChange={event => setAddress({ ...address, postalCode: event.target.value })} /></label></div><label>Téléphone<input type="tel" value={address.phone} onChange={event => setAddress({ ...address, phone: event.target.value })} /></label><p className="payment-note">Paiement à la livraison · Aucun frais caché</p>{error && <div className="notice error-notice">{error}</div>}<button className="primary-button" disabled={submitting}>{submitting ? 'Confirmation...' : 'Confirmer ma commande'} <ArrowRight size={16} /></button></form>}
            <p className="secure-note">✓ Prix vérifié au moment de la commande</p>
          </aside>
        </div>}
    </section>
  );
}
