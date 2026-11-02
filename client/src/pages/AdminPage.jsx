import { ArrowRight, ClipboardList, Package, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { priceLabel } from '../components/ProductCard.jsx';
import { api, getApiError } from '../features/api.js';
import { orderStatusLabel } from '../features/orderStatus.js';

const emptyProduct = {
  title: '', description: '', brand: '', category: '', condition: 'new',
  priceMinor: '', stock: '', images: [], specifications: {}
};

export default function AdminPage() {
  const user = useSelector(state => state.auth.user);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockDrafts, setStockDrafts] = useState({});
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const [productResponse, orderResponse, categoryResponse] = await Promise.all([
        api.get('/products', { params: { limit: 48 } }),
        api.get('/orders'),
        api.get('/categories')
      ]);
      setProducts(productResponse.data.items);
      setOrders(orderResponse.data.orders);
      setCategories(categoryResponse.data.categories);
      setForm(current => ({ ...current, category: current.category || categoryResponse.data.categories[0]?._id || '' }));
    } catch (loadError) {
      setError(getApiError(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (user?.role === 'admin') refresh(); }, [user]);

  async function addProduct(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      await api.post('/products', {
        ...form,
        priceMinor: Math.round(Number(form.priceMinor) * 100),
        stock: Number(form.stock)
      });
      setForm({ ...emptyProduct, category: categories[0]?._id || '' });
      setNotice('Produit ajouté au catalogue.');
      await refresh();
    } catch (saveError) {
      setError(getApiError(saveError));
    }
  }

  async function changeStatus(order, status) {
    setError('');
    try {
      await api.patch(`/orders/${order._id}/status`, { status });
      await refresh();
    } catch (updateError) {
      setError(getApiError(updateError));
    }
  }

  async function changeStock(product) {
    const stock = Number(stockDrafts[product._id] ?? product.stock);
    setError('');
    setNotice('');
    try {
      await api.patch(`/products/${product._id}/stock`, { stock });
      setNotice(`Stock de « ${product.title} » mis à jour.`);
      await refresh();
    } catch (updateError) {
      setError(getApiError(updateError));
    }
  }

  if (!user) return <section className="account-page"><div className="empty-orders"><h2>Accès réservé à l’équipe.</h2><Link to="/compte">Se connecter <ArrowRight size={14} /></Link></div></section>;
  if (user.role !== 'admin') return <section className="account-page"><div className="empty-orders"><h2>Cette page est réservée à l’équipe.</h2><Link to="/">Retour à la boutique <ArrowRight size={14} /></Link></div></section>;

  return (
    <section className="admin-page">
      <div className="admin-header"><div><div className="eyebrow"><span className="eyebrow-line" /> VOTRE ESPACE ADMINISTRATEUR</div><h1>Les coulisses, <em>bien tenues.</em></h1><p>Gérez votre catalogue et gardez un œil sur les commandes.</p></div><button className="secondary-button" onClick={refresh} disabled={loading}><RefreshCw size={15} /> Actualiser</button></div>
      {(error || notice) && <div className={`notice ${error ? 'error-notice' : ''}`}>{error || notice}</div>}
      <div className="admin-stats"><div><span>RÉFÉRENCES ACTIVES</span><strong>{products.length}</strong><Package size={18} /></div><div><span>COMMANDES À SUIVRE</span><strong>{orders.filter(order => !['delivered', 'cancelled'].includes(order.status)).length}</strong><ClipboardList size={18} /></div><div><span>CATÉGORIES</span><strong>{categories.length}</strong><span className="stat-arrow">↗</span></div></div>
      <div className="admin-layout">
        <section className="admin-panel"><div className="admin-panel-heading"><div><span>01 / CATALOGUE</span><h2>Vos produits <i>{products.length}</i></h2></div><Plus size={18} /></div>
          {loading ? <div className="loading-state"><span className="loader" />Chargement...</div> : <div className="admin-product-list">{products.map(product => <article key={product._id}><div className="admin-product-thumb">{product.images?.[0] ? <img src={product.images[0]} alt="" /> : product.brand?.slice(0, 1)}</div><div className="admin-product-copy"><strong>{product.title}</strong><span>{product.brand} · {product.stock} en stock</span></div><strong>{priceLabel(product.priceMinor)}</strong><label className="stock-edit" aria-label={`Modifier le stock de ${product.title}`}><input type="number" min="0" value={stockDrafts[product._id] ?? product.stock} onChange={event => setStockDrafts({ ...stockDrafts, [product._id]: event.target.value })} /><button onClick={() => changeStock(product)}>OK</button></label><span className={`inventory-dot ${product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : ''}`} title={`${product.stock} unités`} /></article>)}</div>}
          <form className="admin-create-form" onSubmit={addProduct}><h3>Ajouter au catalogue <Plus size={16} /></h3><label>Nom du produit<input required minLength="2" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label><div className="admin-form-row"><label>Marque<input required value={form.brand} onChange={event => setForm({ ...form, brand: event.target.value })} /></label><label>Catégorie<select required value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}><option value="">Choisir...</option>{categories.map(category => <option value={category._id} key={category._id}>{category.name}</option>)}</select></label></div><label>Description<textarea required minLength="5" rows="3" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label><div className="admin-form-row"><label>Prix en MAD<input required type="number" min="0" step="0.01" value={form.priceMinor} onChange={event => setForm({ ...form, priceMinor: event.target.value })} /></label><label>Stock<input required type="number" min="0" value={form.stock} onChange={event => setForm({ ...form, stock: event.target.value })} /></label></div><div className="admin-form-row"><label>État<select value={form.condition} onChange={event => setForm({ ...form, condition: event.target.value })}><option value="new">Neuf</option><option value="refurbished">Reconditionné</option></select></label><label>URL image<input type="url" value={form.images[0] || ''} onChange={event => setForm({ ...form, images: event.target.value ? [event.target.value] : [] })} /></label></div><button className="primary-button">Publier le produit <ArrowRight size={15} /></button></form>
        </section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><span>02 / COMMANDES</span><h2>Ça bouge <i>{orders.length}</i></h2></div><ClipboardList size={18} /></div>
          {loading ? <div className="loading-state"><span className="loader" />Chargement...</div> : !orders.length ? <div className="admin-empty">Aucune commande pour le moment.</div> : <div className="admin-order-list">{orders.map(order => <article key={order._id}><div className="admin-order-top"><span className="order-number">{new Date(order.createdAt).toLocaleDateString('fr-FR')} · {order.user?.name}</span><span className={`status-pill status-${order.status}`}>{orderStatusLabel(order.status)}</span></div><div className="admin-order-summary"><strong>{priceLabel(order.totalMinor)}</strong><span>{order.items.length} article{order.items.length !== 1 ? 's' : ''} · paiement à la livraison</span></div><div className="admin-order-items">{order.items.map(item => `${item.title} ×${item.quantity}`).join(' · ')}</div><div className="admin-order-actions">{order.status === 'pending' && <button onClick={() => changeStatus(order, 'confirmed')}>Confirmer ↗</button>}{order.status === 'confirmed' && <button onClick={() => changeStatus(order, 'shipped')}>Marquer expédiée ↗</button>}{order.status === 'shipped' && <button onClick={() => changeStatus(order, 'delivered')}>Marquer livrée ↗</button>}{['pending', 'confirmed'].includes(order.status) && <button className="cancel-order" onClick={() => changeStatus(order, 'cancelled')}>Annuler</button>}</div></article>)}</div>}
        </section>
      </div>
    </section>
  );
}
