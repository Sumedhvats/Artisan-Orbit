import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import { categoryAPI } from '../../api';
import AdminLayout from './AdminLayout';
import classes from './AdminProducts.module.css'; // reuse same styles

const EMPTY = { name: '', slug: '', description: '' };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    categoryAPI.getAll().then(r => setCategories(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const autoSlug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (c) => {
    setEditing(c._id);
    setForm({ name: c.name, slug: c.slug, description: c.description || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || autoSlug(form.name) };
      if (editing) {
        await categoryAPI.update(editing, payload);
      } else {
        await categoryAPI.create(payload);
      }
      setShowForm(false);
      fetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      fetch();
    } catch (err) { alert(err.message); }
  };

  return (
    <AdminLayout title="Categories">
      <div className={classes.toolbar}>
        <span className={classes.count}>{categories.length} categories</span>
        <button className={classes.addBtn} onClick={openNew}><Plus size={18} /> Add Category</button>
      </div>

      {loading ? <p>Loading...</p> : categories.length === 0 ? (
        <div className={classes.emptyState}>
          <p>No categories yet. Create categories like "Shoes", "T-Shirts", "Jackets", "Pants".</p>
        </div>
      ) : (
        <div className={classes.table}>
          <div className={classes.tableHead} style={{ gridTemplateColumns: '2fr 1fr 80px' }}>
            <span>Name</span>
            <span>Slug</span>
            <span>Actions</span>
          </div>
          {categories.map(c => (
            <div key={c._id} className={classes.tableRow} style={{ gridTemplateColumns: '2fr 1fr 80px' }}>
              <span className={classes.prodName}>{c.name}</span>
              <span className={classes.catName}>{c.slug}</span>
              <span className={classes.actions}>
                <button onClick={() => openEdit(c)}><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(c._id)}><Trash2 size={16} /></button>
              </span>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className={classes.modalOverlay}>
          <div className={classes.modal} style={{ maxWidth: 500 }}>
            <div className={classes.modalHeader}>
              <h2>{editing ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className={classes.modalBody}>
              <div className={classes.field}>
                <label>Category Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: autoSlug(e.target.value) }))} placeholder="e.g. Sneakers" />
              </div>
              <div className={classes.field}>
                <label>Slug</label>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
              </div>
              <div className={classes.field}>
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
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

export default AdminCategories;
