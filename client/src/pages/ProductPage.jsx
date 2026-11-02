import { ArrowLeft, ArrowRight, Check, ShieldCheck, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { priceLabel } from '../components/ProductCard.jsx';
import { api, getApiError } from '../features/api.js';
import { addToCart } from '../features/cart/cartSlice.js';

export default function ProductPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(error => setError(getApiError(error)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="product-detail-loading loading-state"><span className="loader" />On vous prépare la fiche produit...</div>;
  if (error || !product) return <section className="product-detail-error"><p>{error || 'Produit introuvable.'}</p><Link to="/" className="back-link"><ArrowLeft size={15} /> Retour à la boutique</Link></section>;

  return (
    <section className="product-detail">
      <Link to="/" className="back-link"><ArrowLeft size={15} /> Retour à la sélection</Link>
      <div className="product-detail-layout">
        <div className="product-detail-visual">
          {product.images?.[0]
            ? <img src={product.images[0]} alt={product.title} />
            : <div className="image-placeholder"><span>{product.brand.slice(0, 1)}</span><i>TECH / {product.category?.name || 'GEAR'}</i></div>}
          <span className="condition-tag">{product.condition === 'refurbished' ? 'Reconditionné' : 'Neuf'}</span>
        </div>
        <div className="product-detail-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> {product.brand} · {product.category?.name || 'ÉLECTRONIQUE'}</div>
          <h1>{product.title}</h1>
          <p className="product-detail-description">{product.description}</p>
          <div className="product-detail-price">{priceLabel(product.priceMinor)} <span>{product.stock > 0 ? 'Disponible' : 'Épuisé'}</span></div>
          <button className="primary-button detail-add" disabled={!product.stock} onClick={() => { dispatch(addToCart(product)); setAdded(true); }}>
            {added ? <>Ajouté au panier <Check size={16} /></> : <>Ajouter au panier <ArrowRight size={16} /></>}
          </button>
          <div className="product-promises"><div><Truck size={17} /><span><strong>Livraison rapide</strong><small>Partout au Maroc</small></span></div><div><ShieldCheck size={17} /><span><strong>Sélection vérifiée</strong><small>On choisit avec soin</small></span></div></div>
          {product.specifications && Object.keys(product.specifications).length > 0 && <div className="specifications"><div className="specification-heading">CE QU’IL FAUT SAVOIR <span>↗</span></div>{Object.entries(product.specifications).map(([key, value]) => <div className="specification-row" key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>}
          <Link className="detail-account-link" to="/compte">Une question avant de choisir ? Contactez-nous <ArrowRight size={13} /></Link>
        </div>
      </div>
    </section>
  );
}
