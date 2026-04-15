const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const customizationSchema = new mongoose.Schema({
  zoneId: String,
  zoneLabel: String,
  type: { type: String, enum: ['color', 'text', 'number', 'photo', 'select'] },
  value: String,       // hex for color, text/number value, or filename for photo
  photoUrl: String     // resolved URL if type is photo
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  productImage: String,
  size: String,
  colorVariant: String,
  quantity: { type: Number, default: 1 },
  basePrice: Number,
  customizationCost: Number,
  totalPrice: Number,
  customizations: [customizationSchema]
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    default: () => 'CK-' + uuidv4().split('-')[0].toUpperCase()
  },
  // Customer info (no login needed)
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    }
  },
  items: [orderItemSchema],
  subtotal: Number,
  shippingCost: { type: Number, default: 0 },
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-production', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: String,            // customer notes
  adminNotes: String,       // internal admin notes
  estimatedDelivery: Date,
  trackingNumber: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);