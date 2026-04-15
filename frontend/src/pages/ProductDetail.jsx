import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Type, Palette, Check, ChevronLeft, ChevronRight, X, Send, ArrowLeft } from 'lucide-react';
import { productAPI, uploadAPI, orderAPI } from '../api';
import classes from './ProductDetail.module.css';

const API_HOST = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getImageSrc = (img) => {
  if (!img) return '/products/tshirt-white-1.png';
  if (img.startsWith('/products') || img.startsWith('/hero')) return img;
  return `${API_HOST}${img}`;
};

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Customisation state
  const [activeTab, setActiveTab] = useState('zones');
  const [activeZone, setActiveZone] = useState(null);
  const [customColors, setCustomColors] = useState({});
  const [customTexts, setCustomTexts] = useState({});
  const [customPhotos, setCustomPhotos] = useState({});
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorVariant, setSelectedColorVariant] = useState('');

  // Order form
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: '', email: '', phone: '' });
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fileRef = useRef(null);

  const palette = ['#ffffff', '#faf8f4', '#e8dcc8', '#b8a68f', '#6b5341', '#1e1710', '#8a1c1c', '#1c3d5a', '#2e4a1e', '#c4956a', '#c24b2e', '#1a1a2e'];

  useEffect(() => {
    setLoading(true);
    productAPI.getBySlug(slug)
      .then((r) => {
        setProduct(r.data);
        if (r.data.customizationZones?.length) {
          setActiveZone(r.data.customizationZones[0].id);
        }
        if (r.data.sizes?.length) {
          const avail = r.data.sizes.find(s => s.available);
          if (avail) setSelectedSize(avail.label);
        }
        if (r.data.colorVariants?.length) {
          setSelectedColorVariant(r.data.colorVariants[0].name);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeZone) return;
    try {
      const res = await uploadAPI.customizationPhoto(file);
      setCustomPhotos(prev => ({
        ...prev,
        [activeZone]: { url: res.url, filename: res.filename }
      }));
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleSubmitOrder = async () => {
    if (!orderForm.name || !orderForm.email || !orderForm.phone) {
      alert('Please fill in all fields');
      return;
    }
    setSubmitting(true);

    const customizations = [];
    for (const zone of (product?.customizationZones || [])) {
      if (customColors[zone.id]) {
        customizations.push({ zoneId: zone.id, zoneLabel: zone.label, type: 'color', value: customColors[zone.id] });
      }
      if (customTexts[zone.id]) {
        customizations.push({ zoneId: zone.id, zoneLabel: zone.label, type: 'text', value: customTexts[zone.id] });
      }
      if (customPhotos[zone.id]) {
        customizations.push({ zoneId: zone.id, zoneLabel: zone.label, type: 'photo', value: customPhotos[zone.id].filename, photoUrl: customPhotos[zone.id].url });
      }
    }

    try {
      const res = await orderAPI.create({
        customer: {
          name: orderForm.name,
          email: orderForm.email,
          phone: orderForm.phone,
        },
        items: [{
          productId: product._id,
          size: selectedSize,
          colorVariant: selectedColorVariant,
          quantity: 1,
          customizations,
        }],
      });
      setOrderSuccess(res.data);
      setShowOrderForm(false);
    } catch (err) {
      alert('Order failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={classes.loaderWrap}><div className={classes.spinner} /></div>;
  }

  if (!product) {
    return (
      <div className={classes.notFound}>
        <h2>Product not found</h2>
        <Link to="/shop" className={classes.backLink}><ArrowLeft size={16} /> Back to Shop</Link>
      </div>
    );
  }

  const currentZone = product.customizationZones?.find(z => z.id === activeZone);
  const images = product.images?.length ? product.images : ['/products/tshirt-white-1.png'];

  return (
    <div className={classes.page}>
      {/* Order success overlay */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            className={classes.successOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={classes.successCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className={classes.successIcon}>
                <Check size={32} />
              </div>
              <h2>Order Placed!</h2>
              <p className={classes.successOrderNum}>Order #{orderSuccess.orderNumber}</p>
              <p className={classes.successMsg}>{orderSuccess.message}</p>
              <button className={classes.btnPrimary} onClick={() => { setOrderSuccess(null); window.location.href = '/shop'; }}>
                Back to Shop
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className={classes.breadcrumb}>
        <Link to="/shop">Shop</Link>
        <span className={classes.breadcrumbSep}>›</span>
        <span>{product.category?.name}</span>
        <span className={classes.breadcrumbSep}>›</span>
        <span className={classes.breadcrumbCurrent}>{product.name}</span>
      </div>

      <div className={classes.layout}>
        {/* LEFT: Product Images */}
        <div className={classes.imageCol}>
          <motion.div
            className={classes.mainImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img src={getImageSrc(images[activeImageIdx])} alt={product.name} />

            {activeZone && customPhotos[activeZone] && (
              <div className={classes.photoOverlay}>
                <img src={`${API_HOST}${customPhotos[activeZone].url}`} alt="Custom" />
              </div>
            )}

            {activeZone && customTexts[activeZone] && (
              <div className={classes.textOverlay} style={{ color: customColors[activeZone] || 'var(--clr-dark)' }}>
                {customTexts[activeZone]}
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  className={`${classes.imgNav} ${classes.imgNavLeft}`}
                  onClick={() => setActiveImageIdx(i => Math.max(0, i - 1))}
                  disabled={activeImageIdx === 0}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className={`${classes.imgNav} ${classes.imgNavRight}`}
                  onClick={() => setActiveImageIdx(i => Math.min(images.length - 1, i + 1))}
                  disabled={activeImageIdx === images.length - 1}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </motion.div>

          {images.length > 1 && (
            <div className={classes.thumbnails}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${classes.thumb} ${i === activeImageIdx ? classes.thumbActive : ''}`}
                  onClick={() => setActiveImageIdx(i)}
                >
                  <img src={getImageSrc(img)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Info + Customizer */}
        <motion.div
          className={classes.infoCol}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className={classes.category}>{product.category?.name}</span>
          <h1 className={classes.productName}>{product.name}</h1>
          <div className={classes.price}>
            {product.discountedPrice ? (
              <>
                <span className={classes.oldPrice}>₹{product.basePrice.toLocaleString()}</span>
                <span>₹{product.discountedPrice.toLocaleString()}</span>
              </>
            ) : (
              <>₹{product.basePrice.toLocaleString()}</>
            )}
            {product.customizationCost > 0 && (
              <span className={classes.customCost}>+₹{product.customizationCost.toLocaleString()} customisation</span>
            )}
          </div>

          {product.description && <p className={classes.desc}>{product.description}</p>}

          {/* Size selector */}
          {product.sizes?.length > 0 && (
            <div className={classes.section}>
              <label className={classes.label}>Size</label>
              <div className={classes.sizeGrid}>
                {product.sizes.map(s => (
                  <button
                    key={s.label}
                    disabled={!s.available}
                    className={`${classes.sizeBtn} ${selectedSize === s.label ? classes.sizeBtnActive : ''} ${!s.available ? classes.sizeBtnDisabled : ''}`}
                    onClick={() => setSelectedSize(s.label)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color variants */}
          {product.colorVariants?.length > 0 && (
            <div className={classes.section}>
              <label className={classes.label}>Colour: <strong>{selectedColorVariant}</strong></label>
              <div className={classes.variantRow}>
                {product.colorVariants.map(cv => (
                  <button
                    key={cv.name}
                    className={`${classes.variantSwatch} ${selectedColorVariant === cv.name ? classes.variantActive : ''}`}
                    style={{ backgroundColor: cv.hex }}
                    onClick={() => setSelectedColorVariant(cv.name)}
                    title={cv.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Customization panel */}
          {product.customizationZones?.length > 0 && (
            <div className={classes.customizerPanel}>
              <h3 className={classes.customizerTitle}>Customise Your Piece</h3>

              <div className={classes.tabs}>
                <button className={`${classes.tab} ${activeTab === 'zones' ? classes.tabActive : ''}`} onClick={() => setActiveTab('zones')}>Zones</button>
                <button className={`${classes.tab} ${activeTab === 'color' ? classes.tabActive : ''}`} onClick={() => setActiveTab('color')}><Palette size={14} /> Colour</button>
                <button className={`${classes.tab} ${activeTab === 'text' ? classes.tabActive : ''}`} onClick={() => setActiveTab('text')}><Type size={14} /> Text</button>
                <button className={`${classes.tab} ${activeTab === 'upload' ? classes.tabActive : ''}`} onClick={() => setActiveTab('upload')}><Upload size={14} /> Photo</button>
              </div>

              <div className={classes.tabContent}>
                <AnimatePresence mode="wait">
                  {activeTab === 'zones' && (
                    <motion.div key="z" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={classes.zoneList}>
                      {product.customizationZones.map(z => (
                        <button key={z.id} className={`${classes.zoneBtn} ${activeZone === z.id ? classes.zoneBtnActive : ''}`} onClick={() => { setActiveZone(z.id); setActiveTab('color'); }}>
                          <span>{z.label}</span>
                          <span className={classes.zoneTypes}>{z.allowedTypes?.join(' · ')}</span>
                          {activeZone === z.id && <Check size={16} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                  {activeTab === 'color' && currentZone?.allowedTypes?.includes('color') && (
                    <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className={classes.tabLabel}>Pick colour for <strong>{currentZone.label}</strong></p>
                      <div className={classes.colorGrid}>
                        {palette.map(c => (
                          <button key={c} className={`${classes.swatch} ${customColors[activeZone] === c ? classes.swatchActive : ''}`} style={{ backgroundColor: c }} onClick={() => setCustomColors(prev => ({ ...prev, [activeZone]: c }))} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'text' && currentZone?.allowedTypes?.some(t => t === 'text' || t === 'number') && (
                    <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className={classes.tabLabel}>Add text / number for <strong>{currentZone.label}</strong></p>
                      <input
                        className={classes.textInput}
                        maxLength={10}
                        placeholder="e.g. 23 or KING"
                        value={customTexts[activeZone] || ''}
                        onChange={e => setCustomTexts(prev => ({ ...prev, [activeZone]: e.target.value }))}
                      />
                    </motion.div>
                  )}
                  {activeTab === 'upload' && currentZone?.allowedTypes?.includes('photo') && (
                    <motion.div key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className={classes.tabLabel}>Upload image for <strong>{currentZone.label}</strong></p>
                      {customPhotos[activeZone] ? (
                        <div className={classes.uploadedPreview}>
                          <img src={`${API_HOST}${customPhotos[activeZone].url}`} alt="Uploaded" />
                          <button className={classes.removeUpload} onClick={() => setCustomPhotos(prev => { const n = { ...prev }; delete n[activeZone]; return n; })}><X size={16} /></button>
                        </div>
                      ) : (
                        <div className={classes.dropzone} onClick={() => fileRef.current?.click()}>
                          <Upload size={24} color="var(--clr-taupe)" />
                          <p>Tap to upload</p>
                          <span>PNG, JPG up to 5MB</span>
                          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                        </div>
                      )}
                    </motion.div>
                  )}
                  {activeTab !== 'zones' && currentZone && !currentZone.allowedTypes?.includes(activeTab === 'upload' ? 'photo' : activeTab) && (
                    <motion.div key="na" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={classes.notAllowed}>
                      <p>"{currentZone.label}" doesn't support this customisation type.</p>
                      <p>Allowed: {currentZone.allowedTypes?.join(', ')}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button className={classes.btnPrimary} onClick={() => setShowOrderForm(true)}>
            <Send size={18} /> Place Custom Order
          </button>
        </motion.div>
      </div>

      {/* Order form modal */}
      <AnimatePresence>
        {showOrderForm && (
          <motion.div className={classes.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={classes.modal} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
              <button className={classes.modalClose} onClick={() => setShowOrderForm(false)}><X size={20} /></button>
              <h2>Your Details</h2>
              <p className={classes.modalSub}>No payment needed — we'll reach out to confirm.</p>
              <div className={classes.formGroup}>
                <label>Full Name</label>
                <input value={orderForm.name} onChange={e => setOrderForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" />
              </div>
              <div className={classes.formGroup}>
                <label>Email</label>
                <input type="email" value={orderForm.email} onChange={e => setOrderForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@email.com" />
              </div>
              <div className={classes.formGroup}>
                <label>Phone</label>
                <input value={orderForm.phone} onChange={e => setOrderForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <button className={classes.btnPrimary} onClick={handleSubmitOrder} disabled={submitting}>
                {submitting ? 'Placing...' : 'Confirm Order'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
