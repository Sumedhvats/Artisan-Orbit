import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Scissors, Truck } from 'lucide-react';
import { productAPI } from '../api';
import classes from './Home.module.css';

const API_HOST = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    productAPI.getFeatured().then(r => setFeatured(r.data)).catch(() => {});
  }, []);

  const categories = [
    { img: '/products/tshirt-white-1.png', label: 'T-Shirts', desc: 'Premium blanks, your canvas', link: '/shop?category=' },
    { img: '/products/jeans-black-1.png', label: 'Jeans & Trousers', desc: 'Tailored to perfection', link: '/shop?category=' },
    { img: '/products/jacket-aviator-1.png', label: 'Jackets', desc: 'Outerwear, your story', link: '/shop?category=' },
    { img: '/hero-shoe.png', label: 'Sneakers', desc: 'Walk in your art', link: '/shop?category=' },
  ];

  return (
    <div className={classes.page}>
      {/* ── Hero ── */}
      <section className={classes.hero}>
        <div className={classes.heroContent}>
          <motion.div
            className={classes.heroText}
            initial="hidden"
            animate="visible"
          >
            <motion.span className={classes.heroLabel} variants={fadeUp} custom={0}>
              Bespoke Studio
            </motion.span>

            <motion.h1 className={classes.headline} variants={fadeUp} custom={1}>
              Your Vision,<br />
              <span className={classes.headlineItalic}>Our Craft.</span>
            </motion.h1>

            <motion.p className={classes.subHeadline} variants={fadeUp} custom={2}>
              Every piece at Artisan Orbit is made to order. Choose your garment. 
              Configure every detail. We bring your vision to life with meticulous craftsmanship.
            </motion.p>

            <motion.div className={classes.ctaRow} variants={fadeUp} custom={3}>
              <Link to="/shop" className={classes.ctaPrimary}>
                <span>Explore Collection</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/shop?featured=true" className={classes.ctaSecondary}>
                Featured Pieces
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className={classes.heroImageWrap}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <img
              src="/products/tshirt-white-1.png"
              alt="Bespoke oversized tee"
              className={classes.heroImage}
            />
            <div className={classes.heroImageGrain} />

            <motion.div
              className={classes.floatingBadge}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <span className={classes.badgeTitle}>Made to Order</span>
              <span className={classes.badgeDivider} />
              <span className={classes.badgeSub}>Fully Customisable</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <section className={classes.marqueeSection}>
        <div className={classes.marqueeTrack}>
          {[...Array(2)].map((_, i) => (
            <span key={i} className={classes.marqueeContent}>
              Custom T-Shirts&nbsp; ◆ &nbsp;Bespoke Denim&nbsp; ◆ &nbsp;Hand-Painted Jackets&nbsp; ◆ &nbsp;Embroidered Patches&nbsp; ◆ &nbsp;Custom Sneakers&nbsp; ◆ &nbsp;Portrait Prints&nbsp; ◆ &nbsp;
            </span>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className={classes.categoriesSection}>
        <motion.div
          className={classes.sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span className={classes.sectionLabel} variants={fadeUp} custom={0}>Collections</motion.span>
          <motion.h2 className={classes.sectionTitle} variants={fadeUp} custom={1}>
            Choose Your<br /><em>Canvas</em>
          </motion.h2>
        </motion.div>

        <div className={classes.catGrid}>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              custom={i}
            >
              <Link to="/shop" className={classes.catCard}>
                <div className={classes.catImageWrap}>
                  <img src={cat.img} alt={cat.label} />
                  <div className={classes.catOverlay}>
                    <span className={classes.catOverlayText}>View Collection <ArrowRight size={14} /></span>
                  </div>
                </div>
                <div className={classes.catInfo}>
                  <h3 className={classes.catLabel}>{cat.label}</h3>
                  <p className={classes.catDesc}>{cat.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className={classes.featuredSection}>
          <motion.div
            className={classes.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.span className={classes.sectionLabel} variants={fadeUp} custom={0}>Curated</motion.span>
            <motion.h2 className={classes.sectionTitle} variants={fadeUp} custom={1}>
              Featured<br /><em>Pieces</em>
            </motion.h2>
          </motion.div>

          <div className={classes.featuredGrid}>
            {featured.slice(0, 4).map((product, i) => (
              <motion.div
                key={product._id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                custom={i}
                className={i === 0 ? classes.featuredLarge : ''}
              >
                <Link to={`/product/${product.slug}`} className={classes.featuredCard}>
                  <div className={classes.featuredImg}>
                    <img
                      src={
                        product.images?.[0]
                          ? product.images[0].startsWith('/products') || product.images[0].startsWith('/hero')
                            ? product.images[0]
                            : `${API_HOST}${product.images[0]}`
                          : '/products/tshirt-white-1.png'
                      }
                      alt={product.name}
                    />
                    <div className={classes.featuredOverlay}>
                      <span>View Details</span>
                    </div>
                  </div>
                  <div className={classes.featuredInfo}>
                    <span className={classes.featuredCat}>{product.category?.name}</span>
                    <h3>{product.name}</h3>
                    <div className={classes.featuredPriceRow}>
                      {product.discountedPrice ? (
                        <>
                          <span className={classes.featuredOldPrice}>₹{product.basePrice.toLocaleString()}</span>
                          <span className={classes.featuredPrice}>₹{product.discountedPrice.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className={classes.featuredPrice}>₹{product.basePrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            className={classes.featuredCta}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <Link to="/shop?featured=true" className={classes.ctaSecondary}>
              View All Featured <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>
      )}

      {/* ── The Craft ── */}
      <section className={classes.craftSection}>
        <motion.div
          className={classes.sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span className={classes.sectionLabel} variants={fadeUp} custom={0}>Process</motion.span>
          <motion.h2 className={classes.sectionTitle} variants={fadeUp} custom={1}>
            The<br /><em>Craft</em>
          </motion.h2>
        </motion.div>

        <div className={classes.craftGrid}>
          {[
            {
              icon: <Sparkles size={28} />,
              step: '01',
              title: 'Choose & Configure',
              desc: 'Pick your garment. Select colours, add text, upload artwork — every zone is yours to customise.',
            },
            {
              icon: <Scissors size={28} />,
              step: '02',
              title: 'Handcrafted',
              desc: 'Our artisans bring your design to life. Hand-painted, embroidered, or precision-printed.',
            },
            {
              icon: <Truck size={28} />,
              step: '03',
              title: 'Delivered',
              desc: 'Quality-checked and shipped to your door. Every piece is a one-of-a-kind original.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              className={classes.craftCard}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              custom={i}
            >
              <span className={classes.craftStep}>{item.step}</span>
              <div className={classes.craftIcon}>{item.icon}</div>
              <h3 className={classes.craftTitle}>{item.title}</h3>
              <p className={classes.craftDesc}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Atelier Promise ── */}
      <section className={classes.promiseSection}>
        <motion.div
          className={classes.promiseInner}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 className={classes.promiseTitle} variants={fadeUp} custom={0}>
            Not mass-produced.<br />
            <em>Mass-personalised.</em>
          </motion.h2>
          <motion.p className={classes.promiseText} variants={fadeUp} custom={1}>
            At Artisan Orbit, we don't believe in one-size-fits-all. Every stitch, every print, every patch
            is placed with intention — your intention. This is clothing that tells your story.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link to="/shop" className={classes.ctaPrimary}>
              <span>Start Creating</span>
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className={classes.footer}>
        <div className={classes.footerInner}>
          <div className={classes.footerTop}>
            <div className={classes.footerBrand}>
              <span className={classes.footerLogo}>Artisan<em>Orbit</em></span>
              <p className={classes.footerTagline}>Bespoke apparel, crafted by you.</p>
            </div>

            <div className={classes.footerNav}>
              <div className={classes.footerCol}>
                <h4>Shop</h4>
                <Link to="/shop">All Pieces</Link>
                <Link to="/shop?featured=true">Featured</Link>
                <Link to="/shop?tag=trending">Trending</Link>
              </div>
              <div className={classes.footerCol}>
                <h4>Company</h4>
                <Link to="/">About</Link>
                <Link to="/">Contact</Link>
                <Link to="/admin/login">Admin</Link>
              </div>
            </div>
          </div>

          <div className={classes.footerBottom}>
            <span>© 2026 Artisan Orbit. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
