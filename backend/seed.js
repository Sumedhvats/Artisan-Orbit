require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Admin = require('./models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artisan-orbit');
  console.log('Connected to MongoDB');

  // Clear existing
  await Category.deleteMany();
  await Product.deleteMany();
  await Admin.deleteMany();

  // Create admin
  const admin = new Admin({ username: 'admin', password: 'admin123' });
  await admin.save();
  console.log('✅ Admin created: admin / admin123');

  // Create categories with customization options
  const categories = await Category.insertMany([
    {
      name: 'T-Shirts',
      slug: 'tshirts',
      description: 'Premium oversized tees, hand-finished to your specifications',
      sortOrder: 1,
      customizationOptions: [
        { key: 'print_photo', label: 'Photo/Design to Print', type: 'photo', required: false, description: 'Upload image for front or back print' },
        { key: 'front_text', label: 'Front Text', type: 'text', maxLength: 50, placeholder: 'Text for front of shirt' },
        { key: 'back_text', label: 'Back Text', type: 'text', maxLength: 50, placeholder: 'Text for back of shirt' },
        { key: 'number', label: 'Jersey Number', type: 'number', maxLength: 2 },
        { key: 'print_style', label: 'Print Style', type: 'select', options: ['DTF Print', 'Screen Print', 'Embroidery', 'Hand Painted'] }
      ]
    },
    {
      name: 'Jeans & Trousers',
      slug: 'jeans',
      description: 'Bespoke denim and trousers, tailored to perfection',
      sortOrder: 2,
      customizationOptions: [
        { key: 'custom_art', label: 'Custom Artwork', type: 'photo', description: 'Artwork for the leg or pocket area' },
        { key: 'text', label: 'Custom Text', type: 'text', maxLength: 30 },
        { key: 'distress_level', label: 'Distress Level', type: 'select', options: ['None', 'Light', 'Medium', 'Heavy'] },
        { key: 'color', label: 'Stitch Color', type: 'color' }
      ]
    },
    {
      name: 'Jackets',
      slug: 'jackets',
      description: 'Hand-crafted outerwear with custom patches, prints and embroidery',
      sortOrder: 3,
      customizationOptions: [
        { key: 'back_art', label: 'Back Art/Photo', type: 'photo', description: 'Image or design for the back' },
        { key: 'name_tag', label: 'Name on Chest', type: 'text', maxLength: 20 },
        { key: 'patch_style', label: 'Style', type: 'select', options: ['Embroidered Patch', 'Leather Emboss', 'Printed', 'Hand Painted'] },
        { key: 'color', label: 'Accent Color', type: 'color' }
      ]
    },
    {
      name: 'Sneakers',
      slug: 'sneakers',
      description: 'Custom painted and designed sneakers',
      sortOrder: 4,
      customizationOptions: [
        { key: 'base_color', label: 'Base Color', type: 'color', required: false },
        { key: 'side_text', label: 'Side Text', type: 'text', maxLength: 20, placeholder: 'e.g. your name' },
        { key: 'number', label: 'Jersey Number', type: 'number', maxLength: 3, placeholder: 'e.g. 23' },
        { key: 'custom_photo', label: 'Custom Photo/Art', type: 'photo', description: 'Upload artwork to be painted on the shoe' },
        { key: 'theme', label: 'Design Theme', type: 'select', options: ['Anime', 'Sports', 'Abstract', 'Floral', 'Street Art', 'Custom'] }
      ]
    }
  ]);

  console.log('✅ Categories created');

  const tshirtCat = categories.find(c => c.slug === 'tshirts');
  const jeansCat = categories.find(c => c.slug === 'jeans');
  const jacketCat = categories.find(c => c.slug === 'jackets');
  const sneakerCat = categories.find(c => c.slug === 'sneakers');

  await Product.insertMany([
    {
      name: 'The Ivory Oversized Tee',
      slug: 'ivory-oversized-tee',
      description: 'A masterclass in minimalism. This heavyweight 300 GSM cotton tee features a relaxed drop-shoulder silhouette, perfect as a blank canvas for your custom artwork or worn as-is for effortless style.',
      category: tshirtCat._id,
      basePrice: 1899,
      discountedPrice: 1499,
      images: ['/products/tshirt-white-1.png', '/products/tshirt-white-2.png'],
      tags: ['trending', 'bestseller', 'oversized'],
      isTrending: true,
      isFeatured: true,
      sizes: [
        { label: 'S', available: true },
        { label: 'M', available: true },
        { label: 'L', available: true },
        { label: 'XL', available: true },
        { label: 'XXL', available: true }
      ],
      colorVariants: [
        { name: 'Ivory White', hex: '#f5f0e8' },
        { name: 'Charcoal', hex: '#2d2d2d' },
        { name: 'Sand', hex: '#d4c5a9' }
      ],
      customizationZones: [
        { id: 'front', label: 'Front Print', allowedTypes: ['photo', 'text'] },
        { id: 'back', label: 'Back Print', allowedTypes: ['photo', 'text', 'number'] },
        { id: 'sleeve', label: 'Sleeve Detail', allowedTypes: ['text', 'color'] }
      ],
      customizationCost: 500
    },
    {
      name: 'Essentials Cotton Tee',
      slug: 'essentials-cotton-tee',
      description: 'The everyday essential, elevated. Crafted from premium ring-spun cotton with a boxy fit that drapes beautifully. Available for full custom treatment — your design, our craftsmanship.',
      category: tshirtCat._id,
      basePrice: 1299,
      images: ['/products/tshirt-white-2.png', '/products/tshirt-white-1.png'],
      tags: ['essentials', 'new'],
      isFeatured: true,
      sizes: [
        { label: 'S', available: true },
        { label: 'M', available: true },
        { label: 'L', available: true },
        { label: 'XL', available: true }
      ],
      colorVariants: [
        { name: 'White', hex: '#ffffff' },
        { name: 'Black', hex: '#1a1a1a' },
        { name: 'Olive', hex: '#4a5240' }
      ],
      customizationZones: [
        { id: 'chest', label: 'Chest Logo', allowedTypes: ['photo', 'text'] },
        { id: 'back', label: 'Back Design', allowedTypes: ['photo', 'text'] }
      ],
      customizationCost: 400
    },
    {
      name: 'Pleated Cargo Trousers',
      slug: 'pleated-cargo-trousers',
      description: 'Utilitarian meets atelier. Deep pleats, contrast stitching, and oversized cargo pockets in washed black denim. Each pair can be customised with your choice of artwork, patches, or distressing.',
      category: jeansCat._id,
      basePrice: 3499,
      discountedPrice: 2999,
      images: ['/products/jeans-black-1.png', '/products/jeans-black-2.png'],
      tags: ['trending', 'cargo', 'workwear'],
      isTrending: true,
      isFeatured: true,
      sizes: [
        { label: '28', available: true },
        { label: '30', available: true },
        { label: '32', available: true },
        { label: '34', available: true },
        { label: '36', available: true }
      ],
      colorVariants: [
        { name: 'Washed Black', hex: '#2c2c2c' },
        { name: 'Raw Indigo', hex: '#1a2744' }
      ],
      customizationZones: [
        { id: 'left-leg', label: 'Left Leg', allowedTypes: ['photo', 'text', 'color'] },
        { id: 'right-leg', label: 'Right Leg', allowedTypes: ['photo', 'text', 'color'] },
        { id: 'pocket', label: 'Cargo Pocket', allowedTypes: ['text', 'photo'] }
      ],
      customizationCost: 800
    },
    {
      name: 'Classic Pleated Denim',
      slug: 'classic-pleated-denim',
      description: 'Signature pleated front with a relaxed tapered leg. Premium 14oz selvedge denim sourced from Kurashiki, washed for a perfectly broken-in feel from day one.',
      category: jeansCat._id,
      basePrice: 4299,
      images: ['/products/jeans-black-2.png', '/products/jeans-black-1.png'],
      tags: ['premium', 'selvedge'],
      isFeatured: false,
      sizes: [
        { label: '28', available: true },
        { label: '30', available: true },
        { label: '32', available: true },
        { label: '34', available: true }
      ],
      colorVariants: [
        { name: 'Vintage Black', hex: '#1e1e1e' }
      ],
      customizationZones: [
        { id: 'leg-art', label: 'Leg Artwork', allowedTypes: ['photo', 'color'] }
      ],
      customizationCost: 1000
    },
    {
      name: 'Aviator Patch Jacket',
      slug: 'aviator-patch-jacket',
      description: 'Inspired by vintage flight jackets. Genuine sherpa collar, hand-applied military patches, and custom embroidery. Each piece is one-of-a-kind — tell us your story and we\'ll stitch it into the fabric.',
      category: jacketCat._id,
      basePrice: 7999,
      discountedPrice: 6499,
      images: ['/products/jacket-aviator-1.png'],
      tags: ['trending', 'military', 'embroidery'],
      isTrending: true,
      isFeatured: true,
      sizes: [
        { label: 'S', available: true },
        { label: 'M', available: true },
        { label: 'L', available: true },
        { label: 'XL', available: true }
      ],
      colorVariants: [
        { name: 'Army Olive', hex: '#4a4033' },
        { name: 'Midnight Navy', hex: '#1a1f2e' }
      ],
      customizationZones: [
        { id: 'back', label: 'Back Panel', allowedTypes: ['photo', 'text'] },
        { id: 'chest', label: 'Chest Patch', allowedTypes: ['photo', 'text'] },
        { id: 'sleeve', label: 'Sleeve Patches', allowedTypes: ['photo', 'color'] }
      ],
      customizationCost: 1500
    },
    {
      name: 'AF1 : Rooh',
      slug: 'af1-rooh',
      description: 'Inspired by the spirit of the city. A mesmerising fusion of Indian bridal art on the classic Air Force 1 silhouette. Hand-painted by our master artisans.',
      category: sneakerCat._id,
      basePrice: 25990,
      discountedPrice: 22990,
      images: ['/hero-shoe.png'],
      tags: ['trending', 'bridal', 'premium'],
      isTrending: true,
      isFeatured: true,
      sizes: [
        { label: 'UK6', available: true },
        { label: 'UK7', available: true },
        { label: 'UK8', available: true },
        { label: 'UK9', available: true },
        { label: 'UK10', available: true },
        { label: 'UK11', available: false }
      ],
      colorVariants: [
        { name: 'Bridal White', hex: '#f5f0e8' },
        { name: 'Gold Rush', hex: '#c4956a' }
      ],
      customizationZones: [
        { id: 'tongue', label: 'Tongue', allowedTypes: ['text', 'number', 'color'] },
        { id: 'side-panel', label: 'Side Panel', allowedTypes: ['photo', 'color'] },
        { id: 'heel', label: 'Heel Tab', allowedTypes: ['text', 'number'] }
      ],
      customizationCost: 2000
    }
  ]);

  console.log('✅ Products seeded');
  console.log('\n🎉 Seeding complete!');
  console.log('Admin login → username: admin | password: admin123');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});