"use client"

import { useState } from "react"
import Header from "@/components/header"
import ProductGrid from "@/components/product-grid"
import Cart from "@/components/cart"

export default function ShopPage() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(!cartOpen)} />
      <ProductGrid />
      {cartOpen && <Cart onClose={() => setCartOpen(false)} />}
    </main>
  )
}
