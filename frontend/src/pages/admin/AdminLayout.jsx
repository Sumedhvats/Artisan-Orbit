import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Tag, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import classes from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
];

const AdminLayout = ({ children, title }) => {
  const { admin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, loading, navigate]);

  if (loading) {
    return <div className={classes.loaderWrap}><div className={classes.spinner}></div></div>;
  }

  if (!admin) return null;

  return (
    <div className={classes.shell}>
      {/* Sidebar */}
      <aside className={`${classes.sidebar} ${sidebarOpen ? classes.sidebarOpen : ''}`}>
        <div className={classes.sidebarHeader}>
          <Link to="/" className={classes.logo}>A<span>O</span></Link>
          <button className={classes.closeSidebar} onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className={classes.nav}>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`${classes.navLink} ${location.pathname === item.to ? classes.navLinkActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <button className={classes.logoutBtn} onClick={() => { logout(); navigate('/admin/login'); }}>
          <LogOut size={18} /> Log Out
        </button>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className={classes.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className={classes.main}>
        <header className={classes.topBar}>
          <button className={classes.menuBtn} onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <h1 className={classes.pageTitle}>{title}</h1>
          <span className={classes.adminName}>{admin.username}</span>
        </header>
        <div className={classes.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
