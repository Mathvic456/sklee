# Supabase Setup Guide for Sklee E-Commerce Store

This guide will walk you through setting up Supabase as the database backend for the Sklee clothing store. Supabase is a PostgreSQL-based backend-as-a-service that provides authentication, real-time databases, and API endpoints out of the box.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js 16+ installed on your machine
- The Sklee project files

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `sklee-store` (or your preferred name)
   - **Database Password**: Create a strong password and save it securely
   - **Region**: Choose a region closest to Nigeria (Lagos EU region recommended)
4. Click "Create new project" and wait for it to initialize (2-5 minutes)

## Step 2: Get Your Connection Details

Once your project is created:

1. Navigate to the "Settings" tab in your Supabase project
2. Go to "Database" section
3. Copy the following credentials:
   - **Database URL**: This is your connection string
   - **Project URL**: Found in Settings > API
   - **Anon Key**: Found in Settings > API
   - **Service Role Key**: Found in Settings > API

## Step 3: Set Environment Variables

In your project root, create or update your `.env.local` file with:

\`\`\`
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
\`\`\`

Replace `[PASSWORD]`, `[PROJECT-ID]`, `[YOUR_ANON_KEY]`, and `[YOUR_SERVICE_ROLE_KEY]` with your actual credentials.

## Step 4: Create Database Tables

Connect to your Supabase database and run the following SQL queries in the SQL Editor (Settings > SQL Editor):

### Create Products Table with Variations Support

\`\`\`sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Variations Table (NEW - for sizes, colors, styles)
CREATE TABLE product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50),
  color VARCHAR(50),
  sku VARCHAR(100) UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Create Orders Table

\`\`\`sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(255) UNIQUE,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  payment_method VARCHAR(50), -- paystack, flutterwave
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Create Order Items Table with Variation Tracking

\`\`\`sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  size VARCHAR(50),
  color VARCHAR(50),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Create Indexes for Performance

\`\`\`sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_variations_product_id ON product_variations(product_id);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_reference ON orders(reference);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
\`\`\`

## Step 5: Enable Row Level Security (RLS) - Optional but Recommended

For enhanced security, enable RLS on tables that store sensitive data:

1. In Supabase, go to each table's RLS settings
2. Enable RLS for the `orders` and `order_items` tables
3. Create policies to allow operations

### Example RLS Policies:

\`\`\`sql
-- Allow anyone to read products
CREATE POLICY "Enable public read access" ON products
  FOR SELECT USING (true);

-- Allow anyone to insert orders
CREATE POLICY "Enable public insert access" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read their own orders
CREATE POLICY "Enable public read access for orders" ON orders
  FOR SELECT USING (true);

-- Allow anyone to insert order items
CREATE POLICY "Enable public insert access for order_items" ON order_items
  FOR INSERT WITH CHECK (true);
\`\`\`

## Step 6: Install Supabase Client

In your project directory, install the Supabase client:

\`\`\`bash
npm install @supabase/supabase-js @supabase/ssr
\`\`\`

## Step 7: Create Supabase Client Files

Create `lib/supabase.ts`:

\`\`\`typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
\`\`\`

Create `lib/supabase-server.ts`:

\`\`\`typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createServerClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies().set(name, value, options)
            )
          } catch {
            // Handle errors appropriately
          }
        },
      },
    }
  )
\`\`\`

## Step 8: Fetch Products from Supabase

Update the `ProductGrid` component to fetch from Supabase with variations:

\`\`\`typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface ProductVariation {
  size: string
  color: string
  stock_quantity: number
}

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category: string
  description: string
  variations: ProductVariation[]
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')

      if (productsError) {
        console.error('Error fetching products:', productsError)
      } else {
        // Fetch variations for each product
        const productsWithVariations = await Promise.all(
          (productsData || []).map(async (product) => {
            const { data: variations } = await supabase
              .from('product_variations')
              .select('size, color, stock_quantity')
              .eq('product_id', product.id)

            return {
              ...product,
              variations: variations || []
            }
          })
        )
        setProducts(productsWithVariations)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  // Rest of component...
}
\`\`\`

## Step 9: Save Orders with Variations to Supabase

Update the Paystack verification endpoint to save orders with variation details:

\`\`\`typescript
// app/api/paystack/verify/route.ts
import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { reference, orderItems } = await request.json()

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (data.status && data.data.status === 'success') {
      const supabase = createServerClient()
      
      // Save order to database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            reference: data.data.reference,
            customer_email: data.data.customer.email,
            customer_name: data.data.metadata.fullName,
            customer_phone: data.data.metadata.phone,
            address: data.data.metadata.address,
            city: data.data.metadata.city,
            state: data.data.metadata.state,
            zip_code: data.data.metadata.zipCode,
            total_amount: data.data.amount / 100,
            status: 'completed',
            payment_method: 'paystack',
          }
        ])
        .select()

      if (orderError) {
        console.error('Error saving order:', orderError)
      }

      // Save order items with variations
      const orderItemsToSave = (orderItems || []).map((item: any) => ({
        order_id: order?.[0]?.id,
        product_id: item.id,
        size: item.variant?.size,
        color: item.variant?.color,
        quantity: item.quantity,
        price: item.price,
      }))

      if (orderItemsToSave.length > 0) {
        await supabase
          .from('order_items')
          .insert(orderItemsToSave)
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        data: data.data,
      })
    }
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
\`\`\`

## Step 10: Set Up Storage for Product Images

1. In Supabase, go to **Storage**
2. Create a new bucket named `product-images`
3. Set it to **Public** (uncheck "Private bucket")
4. Add the RLS policy:

\`\`\`sql
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
\`\`\`

## Step 11: Verify the Setup

1. Start your development server: `npm run dev`
2. Add test products with variations in the Supabase dashboard
3. Verify products appear on the homepage with size/color options
4. Test the checkout process with size and color selection

## Troubleshooting

**Issue**: Connection refused error
- **Solution**: Check that your DATABASE_URL is correct and firewall allows connections from your region

**Issue**: Products not loading
- **Solution**: Verify that products table has data and your Anon Key has read permissions

**Issue**: Orders not saving
- **Solution**: Check that SUPABASE_SERVICE_ROLE_KEY is correct and has insert permissions

**Issue**: Variations not appearing
- **Solution**: Ensure product_variations table is populated with size and color data

## Nigeria-Specific Considerations

- Use **Lagos server region** in Supabase for faster local access
- Price amounts should be in **Nigerian Naira (₦)**
- Consider using mobile money integration alongside Paystack
- Store phone numbers with country codes (+234)
- Use Nigeria Post Code format for delivery

## Next Steps

- Set up Row Level Security policies for production
- Implement customer order history retrieval
- Add real inventory management with stock deductions
- Set up automated order confirmation emails
- Implement product review system

For more details, visit [Supabase Documentation](https://supabase.com/docs)
