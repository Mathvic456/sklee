"use client"

import { Trash2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

interface CartItemType {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex gap-4 py-4 border-b border-neutral-200">
      <img
        src={item.image || "/placeholder.svg"}
        alt={item.name}
        className="w-20 h-20 object-cover rounded bg-neutral-100"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-black text-sm mb-1">{item.name}</h3>
        <p className="text-neutral-600 text-sm mb-2">${item.price.toFixed(2)} each</p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-50 text-sm"
          >
            -
          </button>
          <span className="w-6 text-center text-sm">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-50 text-sm"
          >
            +
          </button>
          <button
            onClick={() => removeItem(item.id)}
            className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded transition"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-black">${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  )
}
