import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { productAPI, categoryAPI } from '../api';
import classes from './Shop.module.css';

const API_HOST = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const getImageSrc = (img) => {
  if (!img) return '/products/tshirt-white-1.png';
  if (img.startsWith('/products') || img.startsWith('/hero')) return img;
  return `${API_HOST}${img}`;
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || '';
  const activeTag = searchParams.get('tag') || '';
  const featured = searchParams.get('featured') || '';

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (activeTag) params.tag = activeTag;
    if (featured) params.featured = featured;

    productAPI.getAll(params)
      .then((r) => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, activeTag, featured]);

  const pageTitle = activeTag
    ? `#${activeTag}`
    : featured
      ? 'Featured'
      : activeCategory
        ? categories.find(c => c._id === activeCategory)?.name || 'Collection'
        : 'All Pieces';

  return (
    <div className={classes.page}>
      {/* Header */}
      <header className={classes.header}>
        <motion.span
          className={classes.headerLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Collection
        </motion.span>
        <motion.h1
          className={classes.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {pageTitle}
        </motion.h1>
        <motion.p
          className={classes.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Bespoke customisation on every item · {products.length} piece{products.length !== 1 ? 's' : ''}
        </motion.p>
      </header>

      {/* Category filters */}
      <motion.div
        className={classes.filters}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Link
          to="/shop"
          className={`${classes.filterBtn} ${!activeCategory && !activeTag && !featured ? classes.filterActive : ''}`}
        >
          All
        </Link>
        {categories.map(cat => (
          <Link
            key={cat._id}
            to={`/shop?category=${cat._id}`}
            className={`${classes.filterBtn} ${activeCategory === cat._id ? classes.filterActive : ''}`}
          >
            {cat.name}
          </Link>
        ))}
        <Link
          to="/shop?tag=trending"
          className={`${classes.filterBtn} ${activeTag === 'trending' ? classes.filterActive : ''}`}
        >
          Trending
        </Link>
        <Link
          to="/shop?featured=true"
          className={`${classes.filterBtn} ${featured === 'true' ? classes.filterActive : ''}`}
        >
          Featured
        </Link>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className={classes.loader}>
          <div className={classes.spinner} />
        </div>
      ) : products.length === 0 ? (
        <div className={classes.empty}>
          <h3>No pieces found</h3>
          <p>Try a different filter or check back soon.</p>
          <Link to="/shop" className={classes.emptyLink}>View All Pieces <ArrowRight size={14} /></Link>
        </div>
      ) : (
        <div className={classes.grid}>
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i}
            >
              <Link to={`/product/${product.slug}`} className={classes.card}>
                <div className={classes.cardImage}>
                  <img
                    src={getImageSrc(product.images?.[0])}
                    alt={product.name}
                  />
                  <div className={classes.cardOverlay}>
                    <span className={classes.cardOverlayBtn}>
                      Customise <ArrowRight size={14} />
                    </span>
                  </div>
                  {product.isTrending && <span className={classes.badge}>Trending</span>}
                  {product.isFeatured && !product.isTrending && <span className={`${classes.badge} ${classes.badgeFeatured}`}>Featured</span>}
                </div>
                <div className={classes.cardInfo}>
                  <span className={classes.cardCategory}>{product.category?.name || 'Uncategorised'}</span>
                  <h3 className={classes.cardName}>{product.name}</h3>
                  <div className={classes.cardPrice}>
                    {product.discountedPrice ? (
                      <>
                        <span className={classes.oldPrice}>₹{product.basePrice.toLocaleString()}</span>
                        <span>₹{product.discountedPrice.toLocaleString()}</span>
                      </>
                    ) : (
                      <span>₹{product.basePrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
