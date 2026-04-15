import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, X, Image as ImageIcon } from 'lucide-react';
import { productAPI, categoryAPI, uploadAPI } from '../../api';
import AdminLayout from './AdminLayout';
import classes from './AdminProducts.module.css';

const API_HOST = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  category: '',
  basePrice: '',
  discountedPrice: '',
  tags: '',
  isFeatured: false,
  isTrending: false,
  sizes: '',
  colorVariants: [{ name: '', hex: '#ffffff' }],
  customizationZones: [{ id: '', label: '', allowedTypes: [] }],
  customizationCost: '',
  images: [],
};

const ALLOWED_TYPES = ['color', 'text', 'number', 'photo', 'select'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = new
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const fetchProducts = () => {
    setLoading(true);
    productAPI.getAll({ limit: 100 })
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    categoryAPI.getAll().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product._id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      category: product.category?._id || product.category || '',
      basePrice: product.basePrice,
      discountedPrice: product.discountedPrice || '',
      tags: (product.tags || []).join(', '),
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
      sizes: (product.sizes || []).map(s => s.label).join(', '),
      colorVariants: product.colorVariants?.length ? product.colorVariants : [{ name: '', hex: '#ffffff' }],
      customizationZones: product.customizationZones?.length ? product.customizationZones : [{ id: '', label: '', allowedTypes: [] }],
      customizationCost: product.customizationCost || '',
      images: product.images || [],
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const res = await uploadAPI.productImages(files);
      setForm(prev => ({ ...prev, images: [...prev.images, ...res.urls] }));
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  // Color variants
  const addColorVariant = () => {
    setForm(prev => ({ ...prev, colorVariants: [...prev.colorVariants, { name: '', hex: '#ffffff' }] }));
  };
  const removeColorVariant = (idx) => {
    setForm(prev => ({ ...prev, colorVariants: prev.colorVariants.filter((_, i) => i !== idx) }));
  };
  const updateColorVariant = (idx, field, value) => {
    setForm(prev => {
      const cvs = [...prev.colorVariants];
      cvs[idx] = { ...cvs[idx], [field]: value };
      return { ...prev, colorVariants: cvs };
    });
  };

  // Customization zones
  const addZone = () => {
    setForm(prev => ({ ...prev, customizationZones: [...prev.customizationZones, { id: '', label: '', allowedTypes: [] }] }));
  };
  const removeZone = (idx) => {
    setForm(prev => ({ ...prev, customizationZones: prev.customizationZones.filter((_, i) => i !== idx) }));
  };
  const updateZone = (idx, field, value) => {
    setForm(prev => {
      const zones = [...prev.customizationZones];
      zones[idx] = { ...zones[idx], [field]: value };
      if (field === 'label' && !zones[idx].id) {
        zones[idx].id = value.toLowerCase().replace(/\s+/g, '-');
      }
      return { ...prev, customizationZones: zones };
    });
  };
  const toggleZoneType = (idx, type) => {
    setForm(prev => {
      const zones = [...prev.customizationZones];
      const types = zones[idx].allowedTypes || [];
      zones[idx] = {
        ...zones[idx],
        allowedTypes: types.includes(type) ? types.filter(t => t !== type) : [...types, type],
      };
      return { ...prev, customizationZones: zones };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const sizes = form.sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(label => ({ label, available: true }));
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const colorVariants = form.colorVariants.filter(cv => cv.name);
      const customizationZones = form.customizationZones.filter(z => z.label && z.allowedTypes.length);

      const payload = {
        name: form.name,
        slug: form.slug || autoSlug(form.name),
        description: form.description,
        category: form.category,
        basePrice: Number(form.basePrice),
        discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
        tags,
        isFeatured: form.isFeatured,
        isTrending: form.isTrending,
        sizes,
        colorVariants,
        customizationZones,
        customizationCost: form.customizationCost ? Number(form.customizationCost) : 0,
        images: form.images,
      };

      if (editing) {
        await productAPI.update(editing, payload);
      } else {
        await productAPI.create(payload);
      }

      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await productAPI.delete(id);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout title="Products">
      <div className={classes.toolbar}>
        <span className={classes.count}>{products.length} products</span>
        <button className={classes.addBtn} onClick={openNew}><Plus size={18} /> Add Product</button>
      </div>

      {loading ? <p>Loading...</p> : products.length === 0 ? (
        <div className={classes.emptyState}>
          <p>No products yet. Click "Add Product" to create your first one.</p>
        </div>
      ) : (
        <div className={classes.table}>
          <div className={classes.tableHead}>
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Actions</span>
          </div>
          {products.map(p => (
            <div key={p._id} className={classes.tableRow}>
              <span>
                <div className={classes.thumbWrap}>
                  {p.images?.[0] ? (
                    <img src={`${API_HOST}${p.images[0]}`} alt="" />
                  ) : (
                    <ImageIcon size={20} color="var(--clr-taupe)" />
                  )}
                </div>
              </span>
              <span className={classes.prodName}>{p.name}</span>
              <span className={classes.catName}>{p.category?.name || '—'}</span>
              <span>₹{p.basePrice}</span>
              <span className={classes.actions}>
                <button onClick={() => openEdit(p)} title="Edit"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(p._id)} title="Delete"><Trash2 size={16} /></button>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Product Form Modal ── */}
      {showForm && (
        <div className={classes.modalOverlay}>
          <div className={classes.modal}>
            <div className={classes.modalHeader}>
              <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <div className={classes.modalBody}>
              {/* Basic info */}
              <div className={classes.row2}>
                <div className={classes.field}>
                  <label>Product Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: autoSlug(e.target.value) }))} placeholder="Artisan Low 01" />
                </div>
                <div className={classes.field}>
                  <label>Slug</label>
                  <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="artisan-low-01" />
                </div>
              </div>

              <div className={classes.field}>
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="A premium customisable piece..." />
              </div>

              <div className={classes.row3}>
                <div className={classes.field}>
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className={classes.field}>
                  <label>Base Price (₹) *</label>
                  <input type="number" value={form.basePrice} onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))} placeholder="2499" />
                </div>
                <div className={classes.field}>
                  <label>Discounted Price (₹)</label>
                  <input type="number" value={form.discountedPrice} onChange={e => setForm(p => ({ ...p, discountedPrice: e.target.value }))} placeholder="1999" />
                </div>
              </div>

              <div className={classes.row2}>
                <div className={classes.field}>
                  <label>Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="trending, new, bridal" />
                </div>
                <div className={classes.field}>
                  <label>Sizes (comma separated)</label>
                  <input value={form.sizes} onChange={e => setForm(p => ({ ...p, sizes: e.target.value }))} placeholder="S, M, L, XL   or   UK6, UK7, UK8" />
                </div>
              </div>

              <div className={classes.row2}>
                <div className={classes.field}>
                  <label>Customisation Extra Cost (₹)</label>
                  <input type="number" value={form.customizationCost} onChange={e => setForm(p => ({ ...p, customizationCost: e.target.value }))} placeholder="200" />
                </div>
                <div className={classes.checkboxRow}>
                  <label><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} /> Featured</label>
                  <label><input type="checkbox" checked={form.isTrending} onChange={e => setForm(p => ({ ...p, isTrending: e.target.checked }))} /> Trending</label>
                </div>
              </div>

              {/* Images */}
              <div className={classes.sectionLabel}>Product Images</div>
              <div className={classes.imageList}>
                {form.images.map((img, i) => (
                  <div key={i} className={classes.imgThumb}>
                    <img src={`${API_HOST}${img}`} alt="" />
                    <button className={classes.imgRemove} onClick={() => removeImage(i)}><X size={14} /></button>
                  </div>
                ))}
                <button className={classes.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? '...' : <><Plus size={18} /> Add</>}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
              </div>

              {/* Color Variants */}
              <div className={classes.sectionLabel}>Colour Variants</div>
              {form.colorVariants.map((cv, i) => (
                <div key={i} className={classes.row3} style={{ marginBottom: '0.5rem' }}>
                  <div className={classes.field}>
                    <input value={cv.name} onChange={e => updateColorVariant(i, 'name', e.target.value)} placeholder="Colour name" />
                  </div>
                  <div className={classes.field}>
                    <input type="color" value={cv.hex} onChange={e => updateColorVariant(i, 'hex', e.target.value)} />
                  </div>
                  <button className={classes.removeRow} onClick={() => removeColorVariant(i)}><Trash2 size={14} /></button>
                </div>
              ))}
              <button className={classes.addRow} onClick={addColorVariant}><Plus size={14} /> Add Colour</button>

              {/* Customization Zones */}
              <div className={classes.sectionLabel}>Customisation Zones</div>
              {form.customizationZones.map((zone, i) => (
                <div key={i} className={classes.zoneCard}>
                  <div className={classes.row2}>
                    <div className={classes.field}>
                      <label>Zone Label</label>
                      <input value={zone.label} onChange={e => updateZone(i, 'label', e.target.value)} placeholder="e.g. Front, Back, Heel" />
                    </div>
                    <div className={classes.field}>
                      <label>Zone ID</label>
                      <input value={zone.id} onChange={e => updateZone(i, 'id', e.target.value)} placeholder="auto-generated" />
                    </div>
                  </div>
                  <div className={classes.typeToggles}>
                    {ALLOWED_TYPES.map(type => (
                      <label key={type} className={`${classes.typeToggle} ${zone.allowedTypes?.includes(type) ? classes.typeActive : ''}`}>
                        <input type="checkbox" checked={zone.allowedTypes?.includes(type)} onChange={() => toggleZoneType(i, type)} hidden />
                        {type}
                      </label>
                    ))}
                    <button className={classes.removeRow} onClick={() => removeZone(i)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              <button className={classes.addRow} onClick={addZone}><Plus size={14} /> Add Zone</button>
            </div>

            <div className={classes.modalFooter}>
              <button className={classes.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={classes.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
