"use client"

import { useState, useEffect } from "react"
import ProductCard from "./product-card"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock products - in production, fetch from Supabase
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Classic T-Shirt",
        price: 25.0,
        image: "/white-t-shirt.png",
        category: "Tops",
        description: "Comfortable cotton t-shirt perfect for everyday wear",
      },
      {
        id: "2",
        name: "Denim Jeans",
        price: 79.0,
        image: "/blue-denim-jeans.png",
        category: "Bottoms",
        description: "Premium quality denim jeans with classic fit",
      },
      {
        id: "3",
        name: "Leather Jacket",
        price: 150.0,
        image: "/black-leather-jacket.png",
        category: "Outerwear",
        description: "Stylish leather jacket for a bold look",
      },
      {
        id: "4",
        name: "Casual Hoodie",
        price: 55.0,
        image: "/gray-hoodie.png",
        category: "Tops",
        description: "Cozy hoodie perfect for any season",
      },
      {
        id: "5",
        name: "Sport Shorts",
        price: 40.0,
        image: "/black-sport-shorts.jpg",
        category: "Bottoms",
        description: "Lightweight shorts for athletic activities",
      },
      {
        id: "6",
        name: "Wool Sweater",
        price: 65.0,
        image: "/navy-wool-sweater.jpg",
        category: "Tops",
        description: "Warm wool sweater with elegant design",
      },
    ]

    setProducts(mockProducts)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-neutral-500">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-black mb-2">Shop Sklee</h1>
        <p className="text-neutral-600">Discover our curated collection of premium clothing</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
