import { useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Navbar from '../components/Navbar.jsx';
import StorePage from '../pages/StorePage.jsx';
import AccountPage from '../pages/AccountPage.jsx';
import CartPage from '../pages/CartPage.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import ProductPage from '../pages/ProductPage.jsx';
import { checkSession } from '../features/auth/authSlice.js';

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(checkSession()); }, [dispatch]);

  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<StorePage />} />
          <Route path="/compte" element={<AccountPage />} />
          <Route path="/panier" element={<CartPage />} />
          <Route path="/produit/:id" element={<ProductPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<StorePage />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <Link to="/">e<span>.</span> electroelhabchi</Link>
        <span>La technologie, choisie avec soin.</span>
        <span>© {new Date().getFullYear()} Electro Elhabchi</span>
      </footer>
    </div>
  );
}
