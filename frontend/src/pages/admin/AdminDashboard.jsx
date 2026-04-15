import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import AdminLayout from './AdminLayout';
import classes from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <p>Loading...</p>
      ) : !data ? (
        <p>Could not load dashboard. Is the backend running?</p>
      ) : (
        <>
          <div className={classes.statsGrid}>
            <div className={classes.statCard}>
              <span className={classes.statValue}>{data.stats.totalProducts}</span>
              <span className={classes.statLabel}>Products</span>
            </div>
            <div className={classes.statCard}>
              <span className={classes.statValue}>{data.stats.totalCategories}</span>
              <span className={classes.statLabel}>Categories</span>
            </div>
            <div className={classes.statCard}>
              <span className={classes.statValue}>{data.stats.totalOrders}</span>
              <span className={classes.statLabel}>Total Orders</span>
            </div>
            <div className={classes.statCard}>
              <span className={classes.statValue}>{data.stats.pendingOrders}</span>
              <span className={classes.statLabel}>Pending Orders</span>
            </div>
            <div className={classes.statCard}>
              <span className={classes.statValue}>{data.stats.totalArtisanalRequests || 0}</span>
              <span className={classes.statLabel}>Total Requests</span>
            </div>
            <div className={classes.statCard}>
              <span className={classes.statValue}>{data.stats.pendingArtisanalRequests || 0}</span>
              <span className={classes.statLabel}>Pending Requests</span>
            </div>
          </div>

          <h3 className={classes.sectionTitle}>Recent Orders</h3>
          {data.recentOrders?.length > 0 ? (
            <div className={classes.table}>
              <div className={classes.tableHeader}>
                <span>Order #</span>
                <span>Customer</span>
                <span>Status</span>
                <span>Total</span>
              </div>
              {data.recentOrders.map(order => (
                <div key={order._id} className={classes.tableRow}>
                  <span className={classes.mono}>{order.orderNumber}</span>
                  <span>{order.customer?.name}</span>
                  <span className={classes.statusBadge} data-status={order.status}>{order.status}</span>
                  <span>₹{order.total}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={classes.empty}>No orders yet.</p>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
