import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import classes from './Navbar.module.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (path) => location.pathname + location.search === path;

  return (
    <nav className={`${classes.navbar} ${scrolled ? classes.scrolled : ''}`}>
      <div className={classes.container}>
        {/* Mobile hamburger */}
        <button
          className={classes.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>

        <div className={`${classes.links} ${menuOpen ? classes.linksOpen : ''}`}>
          <Link
            to="/shop"
            className={`${classes.link} ${isActive('/shop') ? classes.activeLink : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            to="/shop?tag=trending"
            className={`${classes.link} ${isActive('/shop?tag=trending') ? classes.activeLink : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Trending
          </Link>
          <Link
            to="/shop?featured=true"
            className={`${classes.link} ${isActive('/shop?featured=true') ? classes.activeLink : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Featured
          </Link>
        </div>

        <Link to="/" className={classes.logo}>
          Artisan<span className={classes.logoAccent}>Orbit</span>
        </Link>

        <div className={classes.icons}>
          <button className={classes.iconBtn} aria-label="Search"><Search size={20} strokeWidth={1.5} /></button>
          <button className={classes.iconBtn} aria-label="Cart"><ShoppingBag size={20} strokeWidth={1.5} /></button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
