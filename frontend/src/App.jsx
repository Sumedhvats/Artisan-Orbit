import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import ArtisanalRequest from './pages/ArtisanalRequest';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/shop" element={<><Navbar /><Shop /></>} />
          <Route path="/product/:slug" element={<><Navbar /><ProductDetail /></>} />
          <Route path="/artisanal-request" element={<><Navbar /><ArtisanalRequest /></>} />

          {/* Admin routes (no public navbar) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
