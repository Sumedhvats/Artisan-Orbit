import React, { useState, useEffect } from 'react';
import { Eye, Brush, Trash2 } from 'lucide-react';
import { artisanalAPI } from '../../api';
import AdminLayout from './AdminLayout';
import classes from './AdminDashboard.module.css'; 

const API_HOST = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUSES = ['pending', 'confirmed', 'in-production', 'shipped', 'delivered', 'cancelled'];

const AdminArtisanalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    artisanalAPI.getAll()
      .then(r => setRequests(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchRequests, []);

  const updateStatus = async (requestId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await artisanalAPI.updateStatus(requestId, { status: newStatus });
      fetchRequests();
      if (selected?._id === requestId) {
        setSelected(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id, type, name) => {
    if (!window.confirm(`Are you sure you want to delete the ${type} request from ${name}?`)) return;
    try {
      await artisanalAPI.delete(id);
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout title="Artisanal Requests">
      {loading ? <p>Loading...</p> : requests.length === 0 ? (
        <p className={classes.empty}>No requests yet.</p>
      ) : (
        <div className={classes.table}>
          <div className={classes.tableHeader} style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 80px' }}>
            <span>Type</span>
            <span>Customer</span>
            <span>WhatsApp</span>
            <span>Date</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {requests.map(req => (
            <div key={req._id} className={classes.tableRow} style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 80px' }}>
              <span className={classes.mono}>{req.productType}</span>
              <span>{req.name}<br /><small style={{ color: 'var(--clr-taupe)' }}>{req.email}</small></span>
              <span>{req.whatsapp}</span>
              <span>{new Date(req.createdAt).toLocaleDateString()}</span>
              <span>
                <select
                  value={req.status || 'pending'}
                  onChange={e => updateStatus(req._id, e.target.value)}
                  disabled={updatingStatus}
                  style={{ padding: '0.3rem', fontSize: '0.8rem', border: '1px solid var(--clr-sand)', background: 'transparent' }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </span>
              <span style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setSelected(req)} style={{ color: 'var(--clr-mocha)' }}><Eye size={16} /></button>
                <button onClick={() => handleDelete(req._id, req.productType, req.name)} style={{ color: '#cc0000' }}><Trash2 size={16} /></button>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(42,32,22,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'var(--clr-white)', maxWidth: 600, width: '100%',
            maxHeight: '80vh', overflow: 'auto', padding: '2rem', position: 'relative',
            borderRadius: '1rem'
          }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--clr-mocha)' }}>✕</button>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{selected.productType} Request</h2>
            <p style={{ color: 'var(--clr-taupe)', marginBottom: '1.5rem', textTransform: 'capitalize' }}>Status: {selected.status}</p>
            
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--clr-mocha)' }}>Customer Details</h4>
            <p>{selected.name} · {selected.email} · {selected.whatsapp}</p>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--clr-mocha)' }}>Description</h4>
            <div style={{ background: 'var(--clr-cream)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
              {selected.description}
            </div>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--clr-mocha)' }}>Uploaded Image</h4>
            {selected.productImage && (
              <img 
                src={`${API_HOST}${selected.productImage}`} 
                alt="Product" 
                style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '0.5rem', border: '1px solid var(--clr-sand)' }} 
              />
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminArtisanalRequests;
