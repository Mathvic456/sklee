# SKLEE - Premium Clothing E-Commerce Store

A modern, fast, and secure e-commerce platform built with Next.js, Tailwind CSS, and integrated payment solutions for the Nigerian market.

## Project Overview

SKLEE is a full-stack clothing store that allows customers to browse products, select variations (sizes and colors), and complete purchases without creating an account. The platform supports multiple payment methods optimized for Nigeria including Paystack and Flutterwave.

## Project Structure

\`\`\`
sklee-store/
├── app/                           # Next.js app directory (server-side routes)
│   ├── layout.tsx                # Root layout with ThemeProvider
│   ├── globals.css               # Global styles with dark/light mode variables
│   ├── page.tsx                  # Landing page
│   ├── shop/
│   │   └── page.tsx              # Product listing page
│   ├── product/
│   │   └── [id]/page.tsx         # Product detail page with variations
│   ├── checkout/
│   │   └── page.tsx              # Checkout page
│   ├── success/
│   │   └── page.tsx              # Order success page
│   ├── about/
│   │   └── page.tsx              # About us page
│   ├── history/
│   │   └── page.tsx              # Company history page
│   ├── contact/
│   │   └── page.tsx              # Contact page
│   └── api/
│       └── paystack/             # Paystack payment endpoints
│           ├── initialize/route.ts
│           ├── verify/route.ts
│           └── webhook/route.ts
│
├── components/                    # Reusable React components
│   ├── header.tsx                # Header with navigation and theme toggle
│   ├── footer.tsx                # Footer component
│   ├── landing.tsx               # Landing page hero section
│   ├── product-grid.tsx          # Product grid display
│   ├── product-card.tsx          # Individual product card
│   ├── cart.tsx                  # Shopping cart sidebar
│   ├── cart-item.tsx             # Cart item component
│   ├── checkout-form.tsx         # Checkout form
│   ├── order-summary.tsx         # Order summary display
│   ├── theme-provider.tsx        # Next-themes provider wrapper
│   └── ui/                       # shadcn/ui components
│
├── hooks/                         # Custom React hooks
│   ├── use-cart.ts               # Cart state management with Zustand
│
├── public/                        # Static assets
│   ├── images/                   # Product images
│   └── icons/                    # Icon files
│
├── styles/                        # Additional style files
│   └── globals.css               # Theme configuration
│
├── SUPABASE_SETUP.md             # Supabase database setup guide
├── DASHBOARD_BUILD_GUIDE.md      # Admin dashboard implementation guide
├── PAYSTACK_SETUP.md             # Paystack payment integration guide
├── FLUTTERWAVE_SETUP.md          # Flutterwave integration guide
└── package.json                  # Project dependencies

\`\`\`

## Key Features

### Frontend Features
- **Responsive Design**: Mobile-first approach, optimized for all screen sizes
- **Dark/Light Mode**: Complete theme support with user preference persistence
- **Product Variations**: Size and color selection with real-time inventory tracking
- **Shopping Cart**: Client-side cart with persistent storage
- **Guest Checkout**: No account required for purchases
- **Payment Integration**: Paystack and Flutterwave support

### Backend Features
- **Supabase Integration**: PostgreSQL database for products, orders, and customers
- **Payment Processing**: Secure payment handling via API routes
- **Order Management**: Complete order tracking and status updates
- **Webhook Support**: Real-time payment confirmation

### Admin Features
- **Product Management**: Create, edit, and delete products
- **Variation Management**: Manage sizes, colors, and SKUs
- **Order Dashboard**: View and manage all orders
- **Analytics**: Track sales, revenue, and customer metrics

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with dark mode support
- **State Management**: Zustand (client-side cart)
- **Database**: Supabase (PostgreSQL)
- **Payment Gateways**: Paystack & Flutterwave
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Authentication**: next-themes for dark mode
- **Deployment**: Vercel

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- Paystack account (for payments)
- Flutterwave account (optional alternative)

### Steps

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd sklee-store
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
   FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
   \`\`\`

4. **Set up Supabase database**
   - Follow the detailed guide in `SUPABASE_SETUP.md`
   - Run the provided SQL migrations to create tables

5. **Configure payment gateways**
   - Follow `PAYSTACK_SETUP.md` for Paystack setup
   - Follow `FLUTTERWAVE_SETUP.md` for Flutterwave setup

6. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

7. **Open in browser**
   Navigate to `http://localhost:3000`

## File Descriptions

### Core Files

**app/layout.tsx**
- Root layout wrapper
- Integrates ThemeProvider for dark/light mode support
- Sets up metadata for SEO
- Wraps all pages with theme context

**components/header.tsx**
- Main navigation component
- Contains theme toggle button (Moon/Sun icon)
- Mobile responsive hamburger menu
- Shopping cart button with item count
- Links to all main pages

**hooks/use-cart.ts**
- Zustand store for shopping cart state
- Handles add/remove/update items
- Persistent storage using localStorage
- Calculates totals and item counts

**app/api/paystack/***
- Payment initialization endpoint
- Payment verification endpoint
- Webhook handler for payment confirmations

### Page Files

**app/page.tsx** - Landing page
**app/shop/page.tsx** - Product listing
**app/product/[id]/page.tsx** - Product details with variations
**app/checkout/page.tsx** - Checkout form
**app/success/page.tsx** - Order confirmation
**app/about/page.tsx** - About SKLEE
**app/history/page.tsx** - Company history
**app/contact/page.tsx** - Contact information

## Dark Mode Implementation

The project uses `next-themes` for dark/light mode management:

1. **Theme Provider** (`components/theme-provider.tsx`)
   - Wraps app with NextThemesProvider
   - Handles theme persistence

2. **Global Styles** (`app/globals.css`)
   - Defines CSS variables for both light and dark modes
   - Uses OKLch color space for better color accuracy

3. **Theme Toggle** (Header component)
   - Moon icon for light mode
   - Sun icon for dark mode
   - Toggles theme on click

All components automatically adapt to the current theme using Tailwind CSS dark mode classes and CSS variables.

## Cart State Management

The shopping cart uses Zustand for state management:

\`\`\`typescript
// Add item to cart
cart.addItem({ productId, name, price, size, color, quantity })

// Remove item from cart
cart.removeItem(itemId)

// Update quantity
cart.updateQuantity(itemId, quantity)

// Get cart totals
const { totalPrice, totalItems } = cart
\`\`\`

Cart data persists in localStorage, so items remain even after page refresh.

## Payment Flow

### Checkout Process
1. Customer reviews cart
2. Enters shipping information
3. Selects payment method (Paystack/Flutterwave)
4. Payment gateway processes transaction
5. Webhook confirms payment
6. Order saved to Supabase
7. Success page displays order reference

### Paystack Integration
- Initialize payment with order details
- Redirect to Paystack modal
- Verify payment after completion
- Store order in database

### Flutterwave Integration
- Initialize Flutterwave checkout
- Handle payment response
- Verify transaction
- Store order in database

See `PAYSTACK_SETUP.md` and `FLUTTERWAVE_SETUP.md` for detailed implementation.

## Admin Dashboard

The admin dashboard allows you to:
- Add/edit/delete products
- Manage product variations (sizes, colors)
- Upload product images to Supabase Storage
- View all orders and customer information
- Track sales metrics and revenue

See `DASHBOARD_BUILD_GUIDE.md` for complete implementation instructions.

## Database Schema

### Products Table
- id (UUID)
- name (text)
- description (text)
- price (decimal)
- image_url (text)
- sizes (JSON array)
- colors (JSON array)
- sku (text)
- stock (integer)
- created_at (timestamp)

### Orders Table
- id (UUID)
- reference (text)
- customer_email (text)
- customer_name (text)
- total_amount (decimal)
- status (text)
- payment_method (text)
- created_at (timestamp)

### Order Items Table
- id (UUID)
- order_id (UUID)
- product_id (UUID)
- quantity (integer)
- price (decimal)
- size (text)
- color (text)

See `SUPABASE_SETUP.md` for complete schema and RLS policies.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

\`\`\`bash
vercel deploy
\`\`\`

### Environment Variables to Add
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY`
- `FLUTTERWAVE_SECRET_KEY`

## Testing

### Test Paystack Payments
- Use test card: 4084084084084081
- CVV: 123
- Expiry: Any future date

### Test Flutterwave Payments
- Use test card: 5531886652142950
- CVV: 564
- Expiry: 09/32

See payment setup guides for more test credentials.

## Troubleshooting

### Dark Mode Not Working
- Ensure `suppressHydrationWarning` is in `<html>` tag in layout.tsx
- Check that ThemeProvider is wrapping children in layout.tsx
- Verify `next-themes` is installed: `npm install next-themes`

### Products Not Loading
- Check Supabase connection in environment variables
- Verify database tables are created
- Check RLS policies allow public read access to products

### Payment Not Processing
- Verify payment gateway credentials are correct
- Check that environment variables are set
- Review webhook configuration
- Check browser console for errors

### Images Not Loading
- Verify Supabase Storage bucket is configured
- Check image URLs are publicly accessible
- Ensure RLS policies allow public read on storage

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Paystack Documentation](https://paystack.com/docs)
- [Flutterwave Documentation](https://developer.flutterwave.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review relevant setup guides (PAYSTACK_SETUP.md, SUPABASE_SETUP.md, etc.)
3. Check the browser console for error messages
4. Review Vercel logs for server-side errors

## License

MIT License - feel free to use this for commercial projects.

---

**Built with ❤️ for SKLEE - Premium Clothing Store**
