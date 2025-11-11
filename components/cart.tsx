"use client"

import { X } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import CartItem from "./cart-item"
import Link from "next/link"

interface CartProps {
  onClose: () => void
}

export default function Cart({ onClose }: CartProps) {
  const { items, total, clearCart } = useCart()

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Cart panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-xl font-bold text-foreground">Shopping Cart</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition" aria-label="Close cart">
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <p className="text-muted-foreground text-center mb-4">Your cart is empty</p>
            <button
              onClick={onClose}
              className="text-sm font-semibold text-foreground hover:text-muted-foreground transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="border-t border-border p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="text-lg font-bold text-foreground">₦{total.toLocaleString("en-NG")}</span>
              </div>

              <Link href="/checkout" onClick={onClose}>
                <button className="w-full py-3 bg-foreground text-background font-semibold rounded hover:bg-muted-foreground transition">
                  Checkout
                </button>
              </Link>

              <button
                onClick={() => {
                  clearCart()
                  onClose()
                }}
                className="w-full py-3 border border-border text-foreground font-semibold rounded hover:bg-muted transition"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
