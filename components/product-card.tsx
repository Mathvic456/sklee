"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group bg-white rounded-lg overflow-hidden border border-neutral-200 hover:border-neutral-300 transition cursor-pointer">
        <div className="relative overflow-hidden bg-neutral-100 aspect-square">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition" />
        </div>

        <div className="p-4">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">{product.category}</p>
          <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-black">₦{(product.price * 1000).toLocaleString()}</span>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
              onClick={(e) => e.stopPropagation()}
              className="w-16 px-2 py-2 border border-neutral-300 rounded text-center text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handleAddToCart()
              }}
              className={`flex-1 py-2 px-4 rounded font-semibold flex items-center justify-center gap-2 transition ${
                added ? "bg-green-500 text-white" : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              <Plus className="w-4 h-4" />
              {added ? "Added!" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
