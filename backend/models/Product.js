const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  basePrice: { type: Number, required: true },
  discountedPrice: { type: Number },
  images: [String],               // main product images
  tags: [String],                 // e.g. ['trending', 'new', 'bridal']
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },

  // Available sizes for this product
  sizes: [{
    label: String,   // e.g. "S", "M", "L", "UK6", "UK7"
    available: { type: Boolean, default: true }
  }],

  // Available base color variants
  colorVariants: [{
    name: String,
    hex: String,
    image: String
  }],

  // Customization zones specific to this product
  // (overrides or extends category-level options)
  customizationZones: [{
    id: String,       // unique zone id e.g. "left-side", "tongue", "chest"
    label: String,    // display name
    image: String,    // preview image of this zone
    allowedTypes: [{ type: String, enum: ['color', 'text', 'number', 'photo', 'select'] }]
  }],

  // Extra cost for customization (added on top of base price)
  customizationCost: { type: Number, default: 0 },

  stock: { type: Number, default: 999 },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);