import { ArrowUpRight, Plus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../features/cart/cartSlice.js';

const formatter = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 });

export function priceLabel(priceMinor) {
  return formatter.format(priceMinor / 100);
}

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const image = product.images?.[0];
  return (
    <article className="product-card" style={{ '--card-index': index }}>
      <div className="product-image">
        <Link className="product-image-link" to={`/produit/${product._id}`} aria-label={`Voir ${product.title}`}>
          {image
            ? <img src={image} alt={product.title} loading="lazy" />
            : <div className="image-placeholder"><span>{product.brand?.slice(0, 1)}</span><i>TECH / {product.category?.name || 'GEAR'}</i></div>}
        </Link>
        <span className="condition-tag">{product.condition === 'refurbished' ? 'Reconditionné' : 'Neuf'}</span>
        <button className="quick-add" onClick={() => dispatch(addToCart(product))} disabled={!product.stock} aria-label={`Ajouter ${product.title} au panier`}>
          <Plus size={19} />
        </button>
      </div>
      <div className="product-meta"><span>{product.brand}</span><span>{product.category?.name || 'Électronique'}</span></div>
      <h3><Link to={`/produit/${product._id}`}>{product.title}</Link></h3>
      <div className="product-bottom"><strong>{priceLabel(product.priceMinor)}</strong><span>{product.stock > 0 ? 'En stock' : 'Épuisé'} <ArrowUpRight size={13} /></span></div>
    </article>
  );
}
