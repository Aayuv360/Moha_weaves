# Moha - Saree E-commerce Platform

## Overview
Moha is a full-stack saree e-commerce platform with role-based access for Users, Admin, Inventory Staff, and Store Managers. The platform supports both online sales and in-store operations with inventory management across distribution channels.

## Tech Stack
- **Frontend**: React 18 with TypeScript, React Router v6 for routing, TanStack Query for data fetching
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
- View saree stock details (read-only)
- View all orders

### 3. Inventory Staff
- **Full saree management (Add/Edit/Delete sarees)**
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
- `user_addresses` - User delivery addresses with default flag
- `serviceable_pincodes` - Delivery availability by pincode

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

### Public
- `GET /api/pincodes/:pincode/check` - Check delivery availability by pincode

### User (Protected)
- `GET/POST /api/user/cart` - Cart operations
- `GET/POST/DELETE /api/user/wishlist` - Wishlist operations
- `GET/POST /api/user/orders` - Order operations
- `GET/POST/PATCH/DELETE /api/user/addresses` - Address management
- `PATCH /api/user/addresses/:id/default` - Set default address

### Admin (Protected)
- `GET /api/admin/stats` - Dashboard stats
- `GET/POST /api/admin/users` - User management
- `GET /api/admin/sarees` - View sarees (read-only)
- `CRUD /api/admin/categories` - Category management

### Inventory (Protected)
- `GET/POST /api/inventory/sarees` - Saree management (Add/View)
- `PATCH/DELETE /api/inventory/sarees/:id` - Saree management (Edit/Delete)
- `GET /api/inventory/low-stock` - Low stock alerts
- `GET/PATCH /api/inventory/requests` - Stock requests
- `PATCH /api/inventory/sarees/:id/distribution` - Update channel
- `PATCH /api/inventory/sarees/:id/stock` - Update stock levels

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

## Data-Testid Convention
All interactive elements have data-testid attributes for E2E testing:

### Navigation Elements
- `nav-{label}` - Sidebar navigation buttons (e.g., `nav-stock-management`, `nav-new-sale`)
- `button-mobile-menu` - Mobile menu toggle button
- `button-logout` - Logout button

### User Info Display
- `text-user-name` - User's name in sidebar
- `text-user-email` - User's email in sidebar
- `text-page-title` - Page title heading

### Form Elements
- `input-{field}` - Input fields (e.g., `input-email`, `input-password`, `input-search`)
- `select-{field}` - Select dropdowns (e.g., `select-filter-status`, `select-channel-{id}`)
- `button-{action}` - Action buttons (e.g., `button-submit`, `button-save-stock`)

### Data Rows
- `row-{type}-{id}` - Table rows (e.g., `row-stock-{id}`, `row-order-{id}`, `row-sale-{id}`)

## Address Validation Rules
All user addresses are validated with:
- **Name**: 2-100 characters
- **Phone**: Exactly 10 digits
- **Locality**: 5-200 characters
- **City**: 2-100 characters
- **Pincode**: Exactly 6 digits

## Recent Changes (December 2024)
- Migrated from Wouter to React Router v6 for routing across all 30+ component files
- Implemented user address management with add/edit/delete functionality and default address support
- Added pincode availability checking feature with serviceable pincode database
- Added Zod validation for address API endpoints (name, phone, locality, city, pincode)
- Single-default address enforcement (only one address can be default per user)
- Seeded database with 20 serviceable pincodes for major Indian cities (Chennai, Delhi, Bangalore, Mumbai, Hyderabad, Kolkata, Ahmedabad)
- Enhanced checkout page with saved address selection and inline address creation
- Added delivery day estimates on checkout based on pincode availability
- Updated user navigation menu (desktop dropdown and mobile) with links to Orders, Wishlist, and Addresses
- Added comprehensive data-testid attributes across all inventory and store module pages
- Implemented consistent navigation pattern across Inventory and Store modules with sidebar buttons
- E2E tests passing for navigation, login/logout, and page transitions in both modules
- **Moved saree management (Add/Edit/Delete) from Admin to Inventory module**
- Admin sarees page now shows read-only stock overview
- Added distinct navigation icons: Shirt icon for Sarees, Warehouse icon for Stock Management
- All inventory saree endpoints protected with authInventory middleware
