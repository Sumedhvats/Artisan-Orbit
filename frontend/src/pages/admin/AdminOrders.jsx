import React, { useState, useEffect } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { orderAPI } from '../../api';
import AdminLayout from './AdminLayout';
import classes from './AdminDashboard.module.css'; // reuse dashboard table styles

const STATUSES = ['pending', 'confirmed', 'in-production', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    orderAPI.getAll({ limit: 100 })
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrders, []);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      fetchOrders();
      if (selected?._id === orderId) {
        setSelected(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id, num) => {
    if (!window.confirm(`Are you sure you want to delete order ${num}?`)) return;
    try {
      await orderAPI.delete(id);
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const viewOrder = async (id) => {
    try {
      const res = await orderAPI.getById(id);
      setSelected(res.data);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout title="Orders">
      {loading ? <p>Loading...</p> : orders.length === 0 ? (
        <p className={classes.empty}>No orders yet.</p>
      ) : (
        <div className={classes.table}>
          <div className={classes.tableHeader}>
            <span>Order #</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Total</span>
            <span style={{ width: '80px' }}>Actions</span>
          </div>
          {orders.map(o => (
            <div key={o._id} className={classes.tableRow} style={{ gridTemplateColumns: '1fr 1.5fr 1fr 0.8fr 80px' }}>
              <span className={classes.mono}>{o.orderNumber}</span>
              <span>{o.customer?.name}<br /><small style={{ color: 'var(--clr-taupe)' }}>{o.customer?.email}</small></span>
              <span>
                <select
                  value={o.status}
                  onChange={e => updateStatus(o._id, e.target.value)}
                  disabled={updatingStatus}
                  style={{ padding: '0.3rem', fontSize: '0.8rem', border: '1px solid var(--clr-sand)', background: 'transparent' }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </span>
              <span>₹{o.total}</span>
              <span style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => viewOrder(o._id)} style={{ color: 'var(--clr-mocha)' }}><Eye size={16} /></button>
                <button onClick={() => handleDelete(o._id, o.orderNumber)} style={{ color: '#cc0000' }}><Trash2 size={16} /></button>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(42,32,22,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'var(--clr-white)', maxWidth: 600, width: '100%',
            maxHeight: '80vh', overflow: 'auto', padding: '2rem', position: 'relative'
          }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--clr-mocha)' }}>✕</button>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Order {selected.orderNumber}</h2>
            <p style={{ color: 'var(--clr-taupe)', marginBottom: '1.5rem' }}>Status: {selected.status}</p>

            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--clr-mocha)' }}>Customer</h4>
            <p>{selected.customer?.name} · {selected.customer?.email} · {selected.customer?.phone}</p>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--clr-mocha)' }}>Items</h4>
            {selected.items?.map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--clr-sand)', padding: '0.75rem 0' }}>
                <strong>{item.productName}</strong> — Size: {item.size || 'N/A'} — Qty: {item.quantity}
                {item.customizations?.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {item.customizations.map((c, j) => (
                      <div key={j} style={{ fontSize: '0.85rem', color: 'var(--clr-mocha)' }}>
                        <em>{c.zoneLabel}</em>: [{c.type}] {c.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: '1rem', textAlign: 'right', fontWeight: 600, fontSize: '1.1rem' }}>Total: ₹{selected.total}</div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
