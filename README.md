# CustomKicks Backend API

Node.js + Express + MongoDB backend for the CustomKicks sneaker/clothing customization platform.

## Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (admin only)
- **File Uploads**: Multer (local disk storage)

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed the database (optional)
```bash
node seed.js
# Creates: admin account + default categories + sample products
# Admin login: admin / admin123
```

### 4. Start server
```bash
# Development
npm run dev

# Production
npm start
```

---

## API Endpoints

### Auth (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/setup` | None | Create first admin (one-time) |
| POST | `/api/auth/login` | None | Admin login → returns JWT |
| GET | `/api/auth/me` | JWT | Verify token |
| PUT | `/api/auth/change-password` | JWT | Change admin password |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | None | List all active categories |
| GET | `/api/categories/:slug` | None | Get category with customization options |
| POST | `/api/categories` | JWT | Create category |
| PUT | `/api/categories/:id` | JWT | Update category |
| DELETE | `/api/categories/:id` | JWT | Deactivate category |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | None | List products (filter: category, tag, featured, search) |
| GET | `/api/products/featured` | None | Featured products |
| GET | `/api/products/:slug` | None | Single product with customization zones |
| POST | `/api/products` | JWT | Create product |
| PUT | `/api/products/:id` | JWT | Update product |
| DELETE | `/api/products/:id` | JWT | Soft delete product |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | None | Place order (guest checkout) |
| GET | `/api/orders/track/:orderNumber?email=` | None | Track order by number + email |
| GET | `/api/orders` | JWT | List all orders (admin) |
| GET | `/api/orders/:id` | JWT | Order details (admin) |
| PUT | `/api/orders/:id/status` | JWT | Update order status (admin) |

### File Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload/product` | JWT | Upload product images (max 10) |
| POST | `/api/upload/category` | JWT | Upload category image |
| POST | `/api/upload/customization` | None | User uploads custom photo/art |

### Admin Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard` | JWT | Stats: orders, revenue, products |

---

## Order Status Flow
```
pending → confirmed → in-production → shipped → delivered
                                              ↘ cancelled
```

## Customization Types
Products and categories define zones/options with these types:
- `color` — hex color picker
- `text` — text input
- `number` — jersey number
- `photo` — image upload (user uploads to `/api/upload/customization` first)
- `select` — dropdown of predefined choices
- `toggle` — boolean on/off

---

## Frontend Integration Notes

### Placing a customized order
```json
POST /api/orders
{
  "customer": {
    "name": "Rahul",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "address": { "line1": "12 Main St", "city": "Delhi", "state": "Delhi", "pincode": "110001" }
  },
  "items": [{
    "productId": "...",
    "size": "UK8",
    "quantity": 1,
    "customizations": [
      { "zoneId": "side_text", "zoneLabel": "Side Text", "type": "text", "value": "RAHUL" },
      { "zoneId": "number", "zoneLabel": "Jersey Number", "type": "number", "value": "23" },
      { "zoneId": "custom_photo", "zoneLabel": "Custom Photo", "type": "photo", "value": "filename.jpg", "photoUrl": "/uploads/customizations/filename.jpg" }
    ]
  }],
  "notes": "Please make the text bold"
}
```

### Uploading a custom photo first
```
POST /api/upload/customization
Content-Type: multipart/form-data
Body: photo (file)

Response: { "url": "/uploads/customizations/uuid.jpg", "filename": "uuid.jpg" }
```

---

## Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `MONGODB_URI` | mongodb://localhost:27017/customkicks | MongoDB connection string |
| `JWT_SECRET` | secret | JWT signing secret (change in production!) |
| `FRONTEND_URL` | * | CORS allowed origin |