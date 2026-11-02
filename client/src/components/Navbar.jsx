import { ArrowUpRight, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const count = useSelector(state => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  function search(event) {
    event.preventDefault();
    navigate(`/?q=${encodeURIComponent(query)}`);
  }

  return (
    <>
      <div className="announcement">
        <Sparkles size={13} /> Livraison offerte <span className="announcement-dot">·</span> L’expertise tech, près de chez vous
      </div>
      <header className="site-header">
        <Link to="/" className="brand" aria-label="Electro Elhabchi, accueil">
          <span className="brand-mark">e<span>.</span></span>
          <span className="brand-name">electro<span>elhabchi</span></span>
        </Link>
        <form className="search-box" onSubmit={search}>
          <Search size={17} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Un modèle, une marque, une envie..." aria-label="Rechercher un produit" />
          <kbd>↵</kbd>
        </form>
        <nav className="header-actions">
          <Link className="account-link" to={user ? '/compte' : '/compte'}>
            <span className="action-overline">{user ? 'Bienvenue' : 'Votre espace'}</span>
            <span className="action-label">{user ? user.name.split(' ')[0] : 'Mon compte'} <ArrowUpRight size={13} /></span>
          </Link>
          {user?.role === 'admin' && <Link className="admin-shortcut" to="/admin">Admin</Link>}
          <Link className="cart-button" to="/panier" aria-label={`Panier, ${count} articles`}>
            <ShoppingBag size={19} /><span className="cart-count">{count}</span>
          </Link>
        </nav>
      </header>
    </>
  );
}
