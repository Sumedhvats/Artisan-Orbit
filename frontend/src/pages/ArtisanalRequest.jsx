import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { uploadAPI, artisanalAPI } from '../api';
import classes from './ArtisanalRequest.module.css';

const API_HOST = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ArtisanalRequest = () => {
  const [form, setForm] = useState({
    productType: 'T-shirt',
    name: '',
    email: '',
    whatsapp: '',
    description: ''
  });
  
  const [file, setFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    
    // Auto-upload the photo to get URL
    try {
      setUploading(true);
      setError('');
      const res = await uploadAPI.customizationPhoto(selected);
      if (res.success) {
        setPhotoUrl(res.url);
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoUrl) {
      setError('Please upload an image of your product.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const payload = { ...form, productImage: photoUrl };
      const res = await artisanalAPI.create(payload);
      
      if (res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className={classes.main}>
        <motion.div 
          className={classes.successCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle size={64} color="var(--clr-accent)" strokeWidth={1} />
          <h2>Request Received</h2>
          <p>Our artisan will connect with you soon for your customization.</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className={classes.main}>
      <header className={classes.hero}>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Design On Your Own Canvas
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Send us your product, and our artisans will transform it into a unique, personalized piece.
        </motion.p>
      </header>

      <motion.section 
        className={classes.formSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <form className={classes.card} onSubmit={handleSubmit}>
          {error && <div className={classes.error}>{error}</div>}

          <div className={classes.field}>
            <label>Choose Product Type</label>
            <select name="productType" value={form.productType} onChange={handleChange} required>
              <option value="T-shirt">T-shirt</option>
              <option value="Jacket">Jacket</option>
              <option value="Sneakers">Sneakers</option>
              <option value="Helmet">Helmet</option>
              <option value="Electronic Device">Electronic Device</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={classes.field}>
            <label>Upload Product Image</label>
            <div className={classes.uploadArea}>
              <input type="file" accept="image/*" onChange={handleFileChange} id="fileInput" />
              <label htmlFor="fileInput" className={classes.uploadLabel}>
                {uploading ? (
                  <span>Uploading...</span>
                ) : photoUrl ? (
                  <img src={`${API_HOST}${photoUrl}`} alt="Preview" className={classes.previewImg} />
                ) : (
                  <>
                    <UploadCloud size={32} color="var(--clr-taupe)" />
                    <span>Drag & drop OR click to upload file</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className={classes.fieldGroup}>
            <div className={classes.field}>
              <label>Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" />
            </div>
            <div className={classes.field}>
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>
          </div>

          <div className={classes.field}>
            <label>WhatsApp Number</label>
            <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="+1 234 567 8900" />
          </div>

          <div className={classes.field}>
            <label>Customization Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              required 
              rows={4}
              placeholder="Describe your design idea (colors, text, artwork, etc.)"
            />
          </div>

          <button type="submit" className={classes.submitBtn} disabled={submitting || uploading}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </motion.section>
    </main>
  );
};

export default ArtisanalRequest;
