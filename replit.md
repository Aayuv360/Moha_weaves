# Moha - Saree E-commerce Platform

## Overview
Moha is a full-stack saree e-commerce platform with role-based access for Users, Admin, Inventory Staff, and Store Managers. The platform supports both online sales and in-store operations with inventory management across distribution channels.

## Tech Stack
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack Query for data fetching
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS with Shadcn UI components
- **Authentication**: JWT with HTTPOnly cookies

## Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components by module
│   │   │   ├── user/       # User module pages
│   │   │   ├── admin/      # Admin dashboard
│   │   │   ├── inventory/  # Inventory management
│   │   │   └── store/      # Store management
│   │   └── lib/            # Utilities and hooks
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── db.ts               # Database connection
└── shared/                 # Shared types and schemas
    └── schema.ts           # Drizzle schema definitions
```

## User Roles & Access

### 1. User (Customer)
- Browse sarees with filters (category, color, fabric, price)
- View product details
- Add items to cart and wishlist
- Place online orders
- View order history

### 2. Admin
- Dashboard with stats
- Manage users (create/update)
- Manage categories, colors, fabrics
- Manage store outlets
- Manage saree inventory
- View all orders

### 3. Inventory Staff
- View low stock items
- Manage stock levels
- Update distribution channels (online/shop/both)
- Process store stock requests
- Update online order statuses

### 4. Store Manager
- View store dashboard
- Browse store inventory
- Process walk-in sales
- Request stock from central inventory
- View sales history

## Distribution Channels
Sarees can be assigned to three distribution modes:
- **online**: Only available for online purchase
- **shop**: Only available in physical stores
- **both**: Available through both channels

## Database Schema

### Core Tables
- `users` - All user accounts with role-based access
- `categories` - Saree categories (Silk, Cotton, Banarasi, etc.)
- `colors` - Color options with hex codes
- `fabrics` - Fabric types
- `sarees` - Product catalog with stock levels
- `stores` - Physical store locations

### Transaction Tables
- `orders` / `order_items` - Online orders
- `cart` / `wishlist` - User shopping data
- `store_sales` / `store_sale_items` - In-store transactions
- `store_inventory` - Stock per store location
- `stock_requests` - Store-to-central inventory requests

## API Endpoints

### Authentication
- `POST /api/auth/user/register` - User registration
- `POST /api/auth/{role}/login` - Login (user/admin/inventory/store)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Public
- `GET /api/categories` - All categories
- `GET /api/colors` - All colors
- `GET /api/fabrics` - All fabrics
- `GET /api/sarees` - Sarees with filters
- `GET /api/sarees/:id` - Single saree

### User (Protected)
- `GET/POST /api/user/cart` - Cart operations
- `GET/POST/DELETE /api/user/wishlist` - Wishlist operations
- `GET/POST /api/user/orders` - Order operations

### Admin (Protected)
- `GET /api/admin/stats` - Dashboard stats
- `GET/POST /api/admin/users` - User management
- `CRUD /api/admin/sarees` - Saree management
- `CRUD /api/admin/categories` - Category management

### Inventory (Protected)
- `GET /api/inventory/low-stock` - Low stock alerts
- `GET/PATCH /api/inventory/requests` - Stock requests
- `PATCH /api/inventory/sarees/:id/distribution` - Update channel

### Store (Protected)
- `GET /api/store/stats` - Store dashboard
- `GET /api/store/inventory` - Store stock
- `GET/POST /api/store/sales` - Sales operations
- `GET/POST /api/store/requests` - Stock requests

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@moha.com | admin123 |
| Inventory | inventory@moha.com | admin123 |
| Store | store@moha.com | admin123 |

## Branding
- **Primary Color**: #B01F1F (Deep Maroon)
- **Typography**: Playfair Display (headings), Inter (body)
- **Style**: Luxury fashion with traditional Indian aesthetic

## Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema to database
