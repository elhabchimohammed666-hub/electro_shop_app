import { ArrowRight, LogOut, Package, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { api, getApiError } from '../features/api.js';
import { checkSession, signedOut, signIn, signUp } from '../features/auth/authSlice.js';
import { priceLabel } from '../components/ProductCard.jsx';
import { orderStatusLabel } from '../features/orderStatus.js';

export default function AccountPage() {
  const dispatch = useDispatch();
  const { user, status, error: authError } = useSelector(state => state.auth);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) api.get('/orders/me').then(({ data }) => setOrders(data.orders)).catch(error => setError(getApiError(error)));
  }, [user]);

  async function submit(event) {
    event.preventDefault();
    const result = await dispatch(mode === 'login' ? signIn({ email: form.email, password: form.password }) : signUp(form));
    if (result.meta.requestStatus === 'fulfilled') setError('');
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
      dispatch(signedOut());
      dispatch(checkSession());
      setOrders([]);
    } catch (logoutError) {
      setError(getApiError(logoutError));
    }
  }

  if (status === 'loading' && !user) return <div className="account-page loading-state"><span className="loader" />Chargement de votre espace...</div>;
  if (!user) return (
    <section className="account-page">
      <div className="eyebrow"><span className="eyebrow-line" /> VOTRE ESPACE</div>
      <div className="account-card"><div className="account-card-icon"><UserRound size={20} /></div>
        <h1>{mode === 'login' ? 'Heureux de vous revoir.' : 'Bienvenue chez vous.'}</h1>
        <p>{mode === 'login' ? 'Connectez-vous pour retrouver vos commandes et votre sélection.' : 'Quelques secondes pour rejoindre la communauté.'}</p>
        <form onSubmit={submit} className="account-form">
          {mode === 'register' && <label>Votre nom<input required minLength="2" autoComplete="name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>}
          <label>Adresse e-mail<input required type="email" autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
          <label>Mot de passe<input required minLength="8" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></label>
          {(authError || error) && <div className="notice error-notice">{authError || error}</div>}
          <button className="primary-button" disabled={status === 'loading'}>{status === 'loading' ? 'Un instant...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'} <ArrowRight size={16} /></button>
        </form>
        <button className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà membre ? Connectez-vous'}</button>
      </div>
    </section>
  );

  return (
    <section className="account-page dashboard-page">
      <div className="account-welcome"><div><div className="eyebrow"><span className="eyebrow-line" /> VOTRE ESPACE</div><h1>Bonjour, <em>{user.name.split(' ')[0]}.</em></h1><p>Votre espace, vos commandes, tout simplement.</p></div><button className="secondary-button" onClick={logout}><LogOut size={15} /> Déconnexion</button></div>
      {user.role === 'admin' && <Link className="admin-dashboard-link" to="/admin"><Package size={18} /> Accéder au tableau de bord administrateur <ArrowRight size={16} /></Link>}
      {error && <div className="notice error-notice">{error}</div>}
      <div className="order-heading"><h2>Vos commandes</h2><span>{orders.length} commande{orders.length !== 1 ? 's' : ''}</span></div>
      {orders.length ? <div className="orders-list">{orders.map(order => <article className="order-card" key={order._id}><div><span className="order-number">COMMANDE DU {new Date(order.createdAt).toLocaleDateString('fr-FR')}</span><h3>{order.items.length} article{order.items.length !== 1 ? 's' : ''}</h3><p>{order.items.map(item => `${item.title} × ${item.quantity}`).join(' · ')}</p></div><div className="order-card-side"><strong>{priceLabel(order.totalMinor)}</strong><span className={`status-pill status-${order.status}`}>{orderStatusLabel(order.status)}</span></div></article>)}</div>
        : <div className="empty-orders"><Package size={23} /><h3>Votre prochaine bonne trouvaille commence ici.</h3><p>Vos commandes apparaîtront dans cet espace.</p><Link to="/">Découvrir la sélection <ArrowRight size={14} /></Link></div>}
    </section>
  );
}
