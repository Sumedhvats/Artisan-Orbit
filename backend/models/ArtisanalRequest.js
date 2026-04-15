const mongoose = require('mongoose');

const artisanalRequestSchema = new mongoose.Schema({
  productType: {
    type: String,
    required: true,
    enum: ['T-shirt', 'Jacket', 'Sneakers', 'Helmet', 'Electronic Device', 'Other']
  },
  productImage: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  whatsapp: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-production', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('ArtisanalRequest', artisanalRequestSchema);
