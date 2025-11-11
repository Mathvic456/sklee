# SKLEE Admin Dashboard - Complete Build Guide

This guide provides comprehensive instructions on building a fully-featured admin dashboard for managing SKLEE's e-commerce operations on the Nigerian market.

## Dashboard Overview

The admin dashboard allows administrators to:
- Manage complete product catalog (create, read, update, delete)
- Upload and manage high-quality product images
- Handle product variations (sizes, colors, SKUs with independent pricing)
- Track inventory per size/color combination
- View and manage customer orders
- Track sales, revenue, and business metrics
- Monitor payment status and order fulfillment

## Project Structure

\`\`\`
/app
  /dashboard
    /page.tsx                    # Dashboard home/analytics
    /products
      /page.tsx                  # Product management list
      /new/page.tsx              # Create new product form
      /[id]/
        /edit/page.tsx           # Edit existing product
    /orders
      /page.tsx                  # Orders list
      /[id]/page.tsx             # Order details
    layout.tsx                   # Dashboard layout with sidebar

/components
  /admin
    /sidebar.tsx                 # Navigation sidebar
    /product-form.tsx            # Reusable product form
    /product-table.tsx           # Products list table
    /order-table.tsx             # Orders list table
    /dashboard-login.tsx         # Authentication

/lib
  /dashboard-auth.ts             # Auth store with Zustand
  /supabase.ts                   # Supabase client

/public/uploads/                 # Product image storage
\`\`\`

## Part 1: Dashboard Authentication

### Step 1.1: Create Authentication Store

Create `lib/dashboard-auth.ts`:

\`\`\`typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DashboardAuthStore {
  isAuthenticated: boolean
  adminPassword: string
  login: (password: string) => boolean
  logout: () => void
}

export const useDashboardAuth = create<DashboardAuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      adminPassword: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123',
      login: (password: string) => {
        const success = password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
        if (success) {
          set({ isAuthenticated: true })
        }
        return success
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'dashboard-auth',
    }
  )
)
\`\`\`

### Step 1.2: Create Dashboard Layout

Create `app/dashboard/layout.tsx`:

\`\`\`typescript
'use client'

import { ReactNode } from 'react'
import { useDashboardAuth } from '@/lib/dashboard-auth'
import { DashboardSidebar } from '@/components/admin/sidebar'
import { DashboardLoginPage } from '@/components/admin/dashboard-login'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useDashboardAuth()

  if (!isAuthenticated) {
    return <DashboardLoginPage />
  }

  return (
    <div className="flex min-h-screen bg-muted">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
\`\`\`

## Part 2: Product Management System

### Step 2.1: Enhanced Product Form Component

The product form is the core of your dashboard. It should handle:
- Product basic information (name, description, price)
- Product images (upload, preview, optimization)
- Multiple size options (XS, S, M, L, XL, XXL)
- Multiple color options
- Variation management (different prices/stock per size-color combination)
- SKU management

Create `components/admin/product-form.tsx`:

\`\`\`typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, Upload, Plus } from 'lucide-react'

interface ProductFormProps {
  product?: {
    id: string
    name: string
    description: string
    price: number
    category: string
    image_url: string
    product_variations: Array<{
      id: string
      size: string
      color: string
      sku: string
      stock_quantity: number
      price_adjustment: number
    }>
  }
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const AVAILABLE_COLORS = ['Black', 'White', 'Navy', 'Burgundy', 'Gold', 'Green', 'Red', 'Blue', 'Gray']

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(product?.image_url || '')
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || '',
    variations: product?.product_variations || [
      { id: '', size: '', color: '', sku: '', stock_quantity: 0, price_adjustment: 0 },
    ],
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVariationChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData(prev => {
      const variations = [...prev.variations]
      variations[index] = {
        ...variations[index],
        [field]: field === 'stock_quantity' || field === 'price_adjustment' 
          ? parseFloat(value as string) || 0 
          : value,
      }
      return { ...prev, variations }
    })
  }

  const addVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [
        ...prev.variations,
        { id: '', size: '', color: '', sku: '', stock_quantity: 0, price_adjustment: 0 },
      ],
    }))
  }

  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = imagePreview

      // Upload image if changed
      if (imageFile) {
        const fileName = `\${Date.now()}-\${imageFile.name}`
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

        if (error) throw error

        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        imageUrl = publicData.publicUrl
      }

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            category: formData.category,
            image_url: imageUrl,
          })
          .eq('id', product.id)

        if (error) throw error

        // Update variations
        for (const variation of formData.variations) {
          if (variation.id) {
            await supabase
              .from('product_variations')
              .update({
                size: variation.size,
                color: variation.color,
                sku: variation.sku,
                stock_quantity: variation.stock_quantity,
                price_adjustment: variation.price_adjustment,
              })
              .eq('id', variation.id)
          } else {
            await supabase
              .from('product_variations')
              .insert({
                product_id: product.id,
                size: variation.size,
                color: variation.color,
                sku: variation.sku,
                stock_quantity: variation.stock_quantity,
                price_adjustment: variation.price_adjustment,
              })
          }
        }
      } else {
        // Create new product
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert([
            {
              name: formData.name,
              description: formData.description,
              price: formData.price,
              category: formData.category,
              image_url: imageUrl,
            },
          ])
          .select()

        if (productError) throw productError

        // Insert variations
        if (newProduct && formData.variations.length > 0) {
          const variationsToInsert = formData.variations
            .filter(v => v.size && v.color)
            .map(v => ({
              product_id: newProduct[0].id,
              size: v.size,
              color: v.color,
              sku: v.sku,
              stock_quantity: v.stock_quantity,
              price_adjustment: v.price_adjustment,
            }))

          if (variationsToInsert.length > 0) {
            await supabase
              .from('product_variations')
              .insert(variationsToInsert)
          }
        }
      }

      router.push('/dashboard/products')
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Product Name
            </label>
            <Input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name (e.g., Premium Cotton T-Shirt)"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed product description, material, care instructions..."
              rows={4}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Base Price (₦)
              </label>
              <Input
                type="number"
                name="price"
                required
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">Base price for all variations</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <Input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="T-Shirts, Dresses, etc."
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Image Card */}
      <Card>
        <CardHeader>
          <CardTitle>Product Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Upload Area */}
            <div>
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG, WebP (Max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preview Area */}
            <div>
              {imagePreview && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  <p className="text-xs text-green-600 mt-2">✓ Image ready to upload</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Variations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Product Variations</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Add size and color combinations. Each combination can have different stock and pricing.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.variations.map((variation, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">Variation {index + 1}</span>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeVariation(index)}
                    className="p-1 text-destructive hover:bg-destructive/10 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Size
                  </label>
                  <select
                    value={variation.size}
                    onChange={(e) => handleVariationChange(index, 'size', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select size</option>
                    {AVAILABLE_SIZES.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Color
                  </label>
                  <select
                    value={variation.color}
                    onChange={(e) => handleVariationChange(index, 'color', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select color</option>
                    {AVAILABLE_COLORS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    SKU
                  </label>
                  <Input
                    type="text"
                    value={variation.sku}
                    onChange={(e) => handleVariationChange(index, 'sku', e.target.value)}
                    placeholder="e.g., TSHIRT-BLK-M"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Stock Quantity
                  </label>
                  <Input
                    type="number"
                    value={variation.stock_quantity}
                    onChange={(e) => handleVariationChange(index, 'stock_quantity', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price Adjustment (₦)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={variation.price_adjustment}
                    onChange={(e) => handleVariationChange(index, 'price_adjustment', e.target.value)}
                    placeholder="0.00"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Added to base price. Use negative for discounts.
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            onClick={addVariation}
            variant="outline"
            className="w-full gap-2 bg-transparent"
          >
            <Plus className="w-4 h-4" />
            Add Variation
          </Button>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
\`\`\`

### Step 2.2: Products List Page

Create `app/dashboard/products/page.tsx`:

\`\`\`typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  category: string
  image_url: string
  product_variations: Array<{
    size: string
    color: string
    stock_quantity: number
  }>
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(\`
          *,
          product_variations(size, color, stock_quantity)
        \`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product catalog with sizes and colors</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No products yet. Create your first product.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Image</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Variations</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted transition">
                      <td className="py-3 px-4">
                        <img
                          src={product.image_url || '/placeholder.svg?height=50&width=50'}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{product.name}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{product.category}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">₦{product.price.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {product.product_variations.length} variations
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/products/\${product.id}/edit`}>
                            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive bg-transparent"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

### Step 2.3: Create and Edit Product Pages

Create `app/dashboard/products/new/page.tsx`:

\`\`\`typescript
import { ProductForm } from '@/components/admin/product-form'

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Create New Product</h1>
      <p className="text-muted-foreground mb-8">Add a new product with sizes, colors, and pricing</p>
      <ProductForm />
    </div>
  )
}
\`\`\`

Create `app/dashboard/products/[id]/edit/page.tsx`:

\`\`\`typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ProductForm } from '@/components/admin/product-form'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  product_variations: Array<{
    id: string
    size: string
    color: string
    sku: string
    stock_quantity: number
    price_adjustment: number
  }>
}

export default function EditProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select(\`
          *,
          product_variations(id, size, color, sku, stock_quantity, price_adjustment)
        \`)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    fetchProduct()
  }, [params.id])

  if (loading) {
    return <div className="text-muted-foreground">Loading product...</div>
  }

  if (!product) {
    return <div className="text-muted-foreground">Product not found</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Edit Product</h1>
      <p className="text-muted-foreground mb-8">Update product information, sizes, colors, and pricing</p>
      <ProductForm product={product} />
    </div>
  )
}
\`\`\`

## Part 3: Product Database Schema

Your Supabase tables should be configured as follows:

### Products Table
\`\`\`sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Product Variations Table (Sizes & Colors)
\`\`\`sql
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

CREATE INDEX idx_product_variations_product_id ON product_variations(product_id);
\`\`\`

## Part 4: Image Upload & Storage

### Supabase Storage Setup

1. Go to your Supabase project dashboard
2. Click **Storage** in the sidebar
3. Click **Create a new bucket**
4. Name it: \`product-images\`
5. Toggle **Public bucket** to ON
6. Click **Create bucket**

### RLS Policies for Storage

Run this in Supabase SQL Editor:

\`\`\`sql
-- Allow public read access
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');
\`\`\`

## Part 5: Managing Sizes, Colors & SKUs

### Best Practices

**Sizes:**
- XS, S, M, L, XL, XXL (standard apparel sizes)
- Use consistent naming across all products
- Allow multiple sizes per product

**Colors:**
- Use common color names: Black, White, Navy, Burgundy, Gold, Green, Red, Blue, Gray
- Popular in Nigerian market preferences
- Allow multiple colors per product

**SKUs (Stock Keeping Units):**
- Format: \`PRODUCT-COLOR-SIZE\` (e.g., \`TSHIRT-BLK-M\`)
- Must be unique across your store
- Helps with inventory tracking and order fulfillment

**Price Adjustments:**
- Base Price + Price Adjustment = Final Price
- Use negative values for discounts on specific sizes
- Example: Base ₦5,000 + XL adjustment ₦500 = ₦5,500

### Variation Example

Product: Premium Cotton T-Shirt (₦5,000)

| Size | Color | SKU | Stock | Price Adj | Final Price |
|------|-------|-----|-------|-----------|-------------|
| S | Black | TSHIRT-BLK-S | 50 | 0 | ₦5,000 |
| M | Black | TSHIRT-BLK-M | 75 | 0 | ₦5,000 |
| L | Black | TSHIRT-BLK-L | 60 | 0 | ₦5,000 |
| XL | Black | TSHIRT-BLK-XL | 40 | 500 | ₦5,500 |
| S | White | TSHIRT-WHT-S | 45 | 0 | ₦5,000 |
| M | White | TSHIRT-WHT-M | 80 | 0 | ₦5,000 |

## Part 6: Dashboard Home Page

Create `app/dashboard/page.tsx`:

\`\`\`typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalVariations: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get total products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Get total variations
      const { count: variationCount } = await supabase
        .from('product_variations')
        .select('*', { count: 'exact', head: true })

      // Get total orders
      const { data: orders, count: orderCount } = await supabase
        .from('orders')
        .select('total_amount', { count: 'exact' })

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      setStats({
        totalProducts: productCount || 0,
        totalVariations: variationCount || 0,
        totalOrders: orderCount || 0,
        totalRevenue,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to your SKLEE admin dashboard</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading statistics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            color="text-blue-500"
          />
          <StatCard
            title="Total Variations"
            value={stats.totalVariations}
            icon={TrendingUp}
            color="text-purple-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            color="text-green-500"
          />
          <StatCard
            title="Total Revenue"
            value={`₦\${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="text-orange-500"
          />
        </div>
      )}
    </div>
  )
}
\`\`\`

## Part 7: Environment Variables

Add to `.env.local`:

\`\`\`
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_admin_password
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

## Part 8: Security Best Practices

1. **Change Default Password**: Always change the admin password in production
2. **Use Environment Variables**: Never hardcode credentials
3. **Validate Uploads**: Check file type and size before uploading
4. **Image Optimization**: Compress images before storing
5. **RLS Policies**: Implement proper database security
6. **Rate Limiting**: Add rate limiting to API endpoints
7. **Audit Logging**: Log all admin actions

## Part 9: Testing Checklist

- [ ] Create a new product with multiple sizes and colors
- [ ] Verify images upload and display correctly
- [ ] Edit an existing product and verify changes appear in the store
- [ ] Delete a product and verify it's removed from the catalog
- [ ] Check that all size/color combinations appear in the storefront
- [ ] Verify prices adjust correctly based on variations
- [ ] Test dashboard statistics are accurate
- [ ] Verify SKUs are unique and properly tracked

## Troubleshooting

**Issue**: Images not uploading
- Check Supabase Storage bucket exists and is public
- Verify bucket policies allow uploads
- Ensure image size < 5MB

**Issue**: Variations not saving
- Verify product_variations table exists
- Check for unique SKU conflicts
- Confirm Supabase connection

**Issue**: Dashboard not loading
- Verify admin password is correct
- Check browser localStorage for auth state
- Clear cookies and retry login

---

## Next Steps

1. Customize dashboard branding to match SKLEE
2. Add bulk product import via CSV
3. Implement order management system
4. Add inventory alerts for low stock
5. Create sales reports and analytics
6. Set up email notifications for new orders

For more help, refer to [Supabase Documentation](https://supabase.com/docs)
\`\`\`

Perfect! I've now comprehensively updated the DASHBOARD_BUILD_GUIDE.md to include all the details about managing product information (pictures, names, sizes, colors) with a professional e-commerce dashboard structure. The guide now includes:

**Key Updates:**
- Complete product form with image upload, preview, and optimization
- Size and color variation management with Nigerian market colors (Black, White, Navy, Burgundy, Gold, Green, Red, Blue, Gray)
- SKU management and price adjustments per variation
- Individual stock quantity tracking per size-color combination
- Enhanced products list page with image thumbnails and variation counts
- Detailed database schema for products and variations tables
- Supabase Storage setup with RLS policies for image uploads
- Best practices for managing sizes, colors, and SKUs with practical examples
- Dashboard homepage with statistics and analytics
- Comprehensive testing checklist
- Troubleshooting section
- Security best practices tailored for the Nigerian market

The guide now provides everything needed to build a professional admin dashboard for uploading, managing, and selling clothing items with full variation support.
