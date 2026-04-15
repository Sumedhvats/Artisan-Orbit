require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Admin = require('./models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/customkicks');
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
      name: 'Sneakers',
      slug: 'sneakers',
      description: 'Custom painted and designed sneakers',
      sortOrder: 1,
      customizationOptions: [
        { key: 'base_color', label: 'Base Color', type: 'color', required: false },
        { key: 'side_text', label: 'Side Text', type: 'text', maxLength: 20, placeholder: 'e.g. your name' },
        { key: 'number', label: 'Jersey Number', type: 'number', maxLength: 3, placeholder: 'e.g. 23' },
        { key: 'custom_photo', label: 'Custom Photo/Art', type: 'photo', description: 'Upload a photo or artwork to be painted on the shoe' },
        { key: 'theme', label: 'Design Theme', type: 'select', options: ['Anime', 'Sports', 'Abstract', 'Floral', 'Street Art', 'Custom'] }
      ]
    },
    {
      name: 'T-Shirts',
      slug: 'tshirts',
      description: 'Custom printed and hand-painted t-shirts',
      sortOrder: 2,
      customizationOptions: [
        { key: 'print_photo', label: 'Photo/Design to Print', type: 'photo', required: false, description: 'Upload image for front or back print' },
        { key: 'front_text', label: 'Front Text', type: 'text', maxLength: 50, placeholder: 'Text for front of shirt' },
        { key: 'back_text', label: 'Back Text', type: 'text', maxLength: 50, placeholder: 'Text for back of shirt' },
        { key: 'number', label: 'Jersey Number', type: 'number', maxLength: 2 },
        { key: 'print_style', label: 'Print Style', type: 'select', options: ['DTF Print', 'Screen Print', 'Embroidery', 'Hand Painted'] }
      ]
    },
    {
      name: 'Jackets',
      slug: 'jackets',
      description: 'Custom jackets with patches, prints and art',
      sortOrder: 3,
      customizationOptions: [
        { key: 'back_art', label: 'Back Art/Photo', type: 'photo', description: 'Image or design for the back' },
        { key: 'name_tag', label: 'Name on Chest', type: 'text', maxLength: 20 },
        { key: 'patch_style', label: 'Style', type: 'select', options: ['Embroidered Patch', 'Leather Emboss', 'Printed', 'Hand Painted'] },
        { key: 'color', label: 'Accent Color', type: 'color' }
      ]
    },
    {
      name: 'Jeans & Pants',
      slug: 'jeans',
      description: 'Custom painted and distressed jeans',
      sortOrder: 4,
      customizationOptions: [
        { key: 'custom_art', label: 'Custom Artwork', type: 'photo', description: 'Artwork for the leg or pocket area' },
        { key: 'text', label: 'Custom Text', type: 'text', maxLength: 30 },
        { key: 'distress_level', label: 'Distress Level', type: 'select', options: ['None', 'Light', 'Medium', 'Heavy'] },
        { key: 'color', label: 'Paint Color', type: 'color' }
      ]
    }
  ]);

  console.log('✅ Categories created');

  const sneakerCat = categories.find(c => c.slug === 'sneakers');
  const tshirtCat = categories.find(c => c.slug === 'tshirts');
  const jacketCat = categories.find(c => c.slug === 'jackets');

  await Product.insertMany([
    {
      name: 'AF1 : Rooh',
      slug: 'af1-rooh',
      description: 'Inspired by the spirit of the city. A mesmerizing fusion of Indian bridal art on classic Air Force 1 silhouette.',
      category: sneakerCat._id,
      basePrice: 25990,
      discountedPrice: 22990,
      tags: ['trending', 'bridal'],
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
      customizationCost: 2000
    },
    {
      name: 'Cafe Samba',
      slug: 'cafe-samba',
      description: 'Coffee-inspired custom Adidas Samba. Warm tones, premium finish.',
      category: sneakerCat._id,
      basePrice: 17990,
      discountedPrice: 15490,
      tags: ['trending', 'coffee'],
      isTrending: true,
      sizes: [
        { label: 'UK6', available: true },
        { label: 'UK7', available: true },
        { label: 'UK8', available: true },
        { label: 'UK9', available: true },
        { label: 'UK10', available: true }
      ],
      customizationCost: 1500
    },
    {
      name: 'King of Pirates',
      slug: 'king-of-pirates',
      description: 'One Piece themed custom sneakers with vibrant anime artwork across the entire shoe.',
      category: sneakerCat._id,
      basePrice: 24990,
      tags: ['anime'],
      isFeatured: true,
      sizes: [
        { label: 'UK6', available: true },
        { label: 'UK7', available: true },
        { label: 'UK8', available: true },
        { label: 'UK9', available: true }
      ],
      customizationCost: 2500
    },
    {
      name: 'Monochrome Forces',
      slug: 'monochrome-forces',
      description: 'Clean and minimal. Sketch art custom AF1 in crisp black and white.',
      category: sneakerCat._id,
      basePrice: 13990,
      tags: ['sketch', 'trending'],
      isTrending: true,
      sizes: [
        { label: 'UK6', available: true },
        { label: 'UK7', available: true },
        { label: 'UK8', available: true },
        { label: 'UK9', available: true },
        { label: 'UK10', available: true }
      ],
      customizationCost: 1000
    },
    {
      name: 'Custom Portrait Tee',
      slug: 'custom-portrait-tee',
      description: 'Upload your photo and we will hand paint or print it on a premium tshirt. Perfect gift.',
      category: tshirtCat._id,
      basePrice: 1499,
      tags: ['trending', 'portrait', 'gift'],
      isFeatured: true,
      sizes: [
        { label: 'XS', available: true },
        { label: 'S', available: true },
        { label: 'M', available: true },
        { label: 'L', available: true },
        { label: 'XL', available: true },
        { label: 'XXL', available: true }
      ],
      customizationCost: 500
    },
    {
      name: 'Varsity Custom Jacket',
      slug: 'varsity-custom-jacket',
      description: 'Classic varsity jacket with your name, number and custom back artwork.',
      category: jacketCat._id,
      basePrice: 4999,
      tags: ['trending', 'varsity'],
      isFeatured: true,
      isTrending: true,
      sizes: [
        { label: 'S', available: true },
        { label: 'M', available: true },
        { label: 'L', available: true },
        { label: 'XL', available: true }
      ],
      customizationCost: 1500
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