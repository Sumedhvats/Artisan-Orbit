const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: String,
  image: String,
  // What can be customized for products in this category
  customizationOptions: [{
    key: { type: String, required: true },       // e.g. "color", "text", "photo", "number"
    label: { type: String, required: true },      // e.g. "Base Color", "Jersey Number"
    type: {
      type: String,
      enum: ['color', 'text', 'number', 'photo', 'select', 'toggle'],
      required: true
    },
    required: { type: Boolean, default: false },
    placeholder: String,
    options: [String],                            // for 'select' type
    maxLength: Number,                            // for 'text'/'number'
    description: String
  }],
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);