import { ArrowDown, ArrowRight, ArrowUpRight, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { api, getApiError } from '../features/api.js';

export default function StorePage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [maxPrice, setMaxPrice] = useState('');
  const selectedCategory = params.get('category') || '';
  const query = params.get('q') || '';

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/products', { params: {
      page, limit: 12, q: query || undefined, category: selectedCategory || undefined,
      brand: brands.length ? brands.join(',') : undefined,
      maxPrice: maxPrice ? Math.round(Number(maxPrice) * 100) : undefined, sort
    } }).then(({ data }) => {
      setProducts(data.items);
      setPages(data.pages);
    }).catch(error => setError(getApiError(error)))
      .finally(() => setLoading(false));
  }, [page, query, selectedCategory, brands, maxPrice, sort]);

  useEffect(() => { setPage(1); }, [query, selectedCategory, brands, maxPrice, sort]);

  function toggleBrand(brand) {
    setBrands(current => current.includes(brand) ? current.filter(item => item !== brand) : [...current, brand]);
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> LE BON CHOIX, TOUT SIMPLEMENT</div>
          <h1>La tech qui<br />vous <em>ressemble.</em></h1>
          <p>Les bons produits, les bons conseils, et toujours une longueur d’avance. Trouvez votre prochain coup de cœur.</p>
          <a className="hero-cta" href="#catalogue">Explorer la collection <ArrowRight size={16} /></a>
          <div className="hero-note"><span className="avatar-stack"><i>E</i><i>+</i><i>✓</i></span> <span>Déjà adopté par <strong>2 400+</strong> passionnés</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-glow" />
          <div className="hero-device">
            <div className="device-camera"><i /><i /><i /></div>
            <div className="device-screen"><span>09:41</span><div className="screen-orb" /><small>DESIGNED FOR<br />WHAT'S NEXT</small></div>
          </div>
          <div className="hero-float float-label"><span className="float-dot" /> SÉLECTION EXPERTE <ArrowUpRight size={14} /></div>
          <div className="hero-float float-price"><span>À partir de</span><strong>699 <small>MAD</small></strong><i>Des essentiels qui durent</i></div>
          <div className="hero-index">01 <span>/</span> 04</div>
          <div className="hero-side-caption">TECHNOLOGIE <span>•</span> SÉLECTION <span>•</span> CONFIANCE</div>
        </div>
        <div className="hero-bottom"><span>01 — LA COLLECTION</span><span>SCROLL POUR EXPLORER <ArrowDown size={13} /></span></div>
      </section>

      <section className="benefits" aria-label="Nos engagements">
        <div><span className="benefit-icon"><Truck size={18} /></span><span><strong>Livraison rapide</strong><small>Partout au Maroc</small></span></div>
        <div><span className="benefit-icon"><ShieldCheck size={18} /></span><span><strong>Qualité vérifiée</strong><small>Chaque produit contrôlé</small></span></div>
        <div><span className="benefit-icon"><RefreshCw size={17} /></span><span><strong>14 jours pour changer d’avis</strong><small>Votre tranquillité d’abord</small></span></div>
        <span className="benefit-side">CONÇU POUR MIEUX CHOISIR <span>↗</span></span>
      </section>

      <section className="catalogue section-wrap" id="catalogue">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-line" /> LA BOUTIQUE</div><h2>Les bons outils.<br /><em>Les bonnes idées.</em></h2></div>
          <p>On a fait le tri pour vous. Des produits qu’on aime, choisis pour leur fiabilité autant que pour leur performance.</p>
        </div>
        <div className="catalogue-layout">
          <aside className="filters">
            <div className="filter-title">AFFINER LA SÉLECTION <span>↗</span></div>
            <div className="filter-group"><h4>Catégories</h4>
              <button className={`filter-option ${!selectedCategory ? 'active' : ''}`} onClick={() => { setParams(query ? { q: query } : {}); setPage(1); }}><span className="filter-radio" />Tout voir<span className="filter-arrow">↗</span></button>
              {categories.map(category => <button key={category._id} className={`filter-option ${selectedCategory === category._id ? 'active' : ''}`} onClick={() => { setParams({ ...(query ? { q: query } : {}), category: category._id }); setPage(1); }}><span className="filter-radio" />{category.name}<span className="filter-arrow">↗</span></button>)}
            </div>
            <div className="filter-group"><h4>Budget maximum</h4><label className="price-input"><span>MAD</span><input type="number" min="0" placeholder="Sans limite" value={maxPrice} onChange={event => setMaxPrice(event.target.value)} /></label></div>
            {products.length > 0 && <div className="filter-group"><h4>Marques</h4>{[...new Set(products.map(product => product.brand))].map(brand => <label className="brand-option" key={brand}><input type="checkbox" checked={brands.includes(brand)} onChange={() => toggleBrand(brand)} />{brand}</label>)}</div>}
            <div className="filter-foot">UNE QUESTION ? <a href="mailto:contact@electroelhabchi.ma">On est là pour vous ↗</a></div>
          </aside>
          <div className="product-area">
            <div className="product-toolbar"><span>{query ? <>Résultats pour <strong>« {query} »</strong></> : <>La sélection <strong>qui fait la différence</strong></>}</span><label>Trier par <select value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Nouveautés</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option></select></label></div>
            {error && <div className="notice error-notice">{error}</div>}
            {loading ? <div className="loading-state"><span className="loader" />On déniche les pépites...</div>
              : products.length ? <div className="product-grid">{products.map((product, index) => <ProductCard key={product._id} product={product} index={index} />)}</div>
                : <div className="empty-state"><span>⌕</span><h3>Rien par ici, pour l’instant.</h3><p>Essayez un autre mot-clé ou changez vos filtres.</p></div>}
            {pages > 1 && <div className="pagination"><button disabled={page === 1} onClick={() => setPage(current => current - 1)}>← Précédent</button><span>0{page} <i>/</i> {String(pages).padStart(2, '0')}</span><button disabled={page === pages} onClick={() => setPage(current => current + 1)}>Suivant <ArrowRight size={14} /></button></div>}
            {!loading && products.length > 0 && <div className="catalogue-end">VOUS ÊTES À JOUR <span>✳</span> <span>LA SÉLECTION CONTINUE D’ÉVOLUER</span></div>}
          </div>
        </div>
      </section>
      <section className="closing-banner"><div><span className="eyebrow"><span className="eyebrow-line" /> ON EST LÀ POUR VOUS</span><h2>Un doute ?<br /><em>On en parle.</em></h2></div><a href="mailto:contact@electroelhabchi.ma">Écrivez-nous <ArrowUpRight size={16} /></a><span className="closing-stamp">E.<br /><small>TECH<br />WITH CARE</small></span></section>
    </>
  );
}
