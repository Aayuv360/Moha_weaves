# Moha Saree E-Commerce Platform - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from luxury fashion e-commerce (Net-a-Porter, Farfetch) combined with traditional Indian aesthetic sensibilities. The design balances modern e-commerce patterns with cultural elegance appropriate for saree retail.

**Core Principles**:
- Elegance through restraint - let products shine
- Cultural resonance - subtle traditional Indian motifs in spacing and borders
- Role clarity - distinct visual hierarchies for each module dashboard
- Trust and professionalism - especially for multi-role business platform

## Typography

**Font Families** (Google Fonts):
- **Primary**: "Playfair Display" - Serif for headings, product titles, brand name (elegant, luxury feel)
- **Secondary**: "Inter" - Sans-serif for body text, UI elements, data tables (clean, highly legible)

**Type Scale**:
- Hero/Brand: text-5xl to text-7xl, font-semibold (Playfair)
- H1: text-4xl, font-semibold (Playfair)
- H2: text-3xl, font-medium (Playfair)
- H3: text-2xl, font-medium (Inter)
- Body: text-base, font-normal (Inter)
- Small/Meta: text-sm, font-normal (Inter)
- Buttons/CTAs: text-base, font-medium (Inter)

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20** (e.g., p-4, gap-6, mt-8, py-16)

**Grid Systems**:
- Product grids: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Dashboard layouts: 2-column split (sidebar + content)
- Feature sections: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

**Container Widths**:
- Full layouts: max-w-7xl mx-auto
- Product pages: max-w-6xl mx-auto
- Forms/Auth: max-w-md mx-auto

## Component Library

### Navigation
**User-Facing Header**:
- Sticky navigation with logo (left), search bar (center), icons for wishlist/cart/account (right)
- Secondary nav with category links
- Height: h-16 for main nav, h-12 for secondary

**Dashboard Navigation**:
- Persistent sidebar (w-64) with role-specific menu items
- Top bar with breadcrumbs, notifications, user profile dropdown
- Mobile: Collapsible hamburger menu

### Product Components
**Product Card**:
- Image ratio: aspect-[3/4] (portrait for sarees)
- Padding: p-4
- Hover: Subtle scale transform and shadow
- Info: Product name, price, quick-add-to-cart icon overlay on hover

**Product Detail Layout**:
- 2-column: Image gallery (left, 60%), Product info (right, 40%)
- Image gallery: Main image + thumbnail strip
- Info panel: Title, price, size/color selectors (chips), description, CTA buttons

### Forms
**Input Fields**:
- Height: h-12
- Padding: px-4
- Border: border with focus:ring-2
- Labels: text-sm font-medium mb-2

**Buttons**:
- Primary CTA: px-6 py-3, font-medium, rounded-md
- Secondary: Same size with border variant
- Icon buttons: w-10 h-10, rounded-full

### Data Tables (Admin/Inventory/Store)
- Striped rows for readability
- Sticky header
- Action column (right) with icon buttons
- Padding: px-4 py-3 for cells
- Borders: border-b between rows

### Dashboard Widgets
**Stat Cards**:
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Padding: p-6
- Include: Icon, label, value, change indicator
- Shadow: shadow-sm

**Charts/Graphs**:
- Use recharts or similar library
- Consistent color scheme tied to brand
- Padding: p-6 containers

### Role-Specific Modules

**User Module**:
- Hero section with full-width saree imagery
- Category showcase grid
- Featured/new arrivals carousel
- Wishlist/Cart: Grid view with product cards

**Admin Module**:
- Dashboard with KPI stat cards (4-column grid)
- Management tables with search/filter bar
- Modal forms for add/edit operations

**Inventory Module**:
- Stock level indicators (color-coded: low/medium/high)
- Distribution channel badges (Shop/Online/Both)
- Quick action buttons for stock updates
- Order queue table with status badges

**Store Module**:
- POS-style interface for in-store sales
- Inventory browser with availability filters
- Sales history table
- Request tracking with status timeline

## Images

**Hero Section** (User Module Homepage):
- Full-width hero image showcasing elegant saree display
- Overlay: Gradient overlay (dark at bottom) for text contrast
- Text: "Moha" brand name + tagline centered/left-aligned
- CTA button with blurred background (backdrop-blur-sm)
- Height: min-h-[70vh]

**Product Images**:
- High-quality saree photography on models or flat lay
- Consistent white/neutral backgrounds
- Multiple angles for product detail pages
- Zoom functionality on hover/click

**Category Images**:
- Grid of 6-8 category cards with representative saree images
- Overlay with category name

**Dashboard/Module Headers**:
- Subtle decorative pattern or textile texture as background
- Not distracting, adds cultural context

**About/Marketing Pages**:
- Craftsmanship images (weaving, fabric detail shots)
- Team photos if applicable
- Store location images for Store module

**No Images Needed**:
- Admin tables and forms (focus on data)
- Authentication pages (clean, minimal)
- Cart/checkout (focus on clarity)

## Accessibility

- Maintain WCAG AA contrast ratios with #B01F1F color
- Focus indicators on all interactive elements
- Semantic HTML throughout (nav, main, article)
- ARIA labels for icon-only buttons
- Keyboard navigation support for all modules
- Form validation with clear error messages