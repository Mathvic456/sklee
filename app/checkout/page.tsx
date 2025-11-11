"use client"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import CheckoutForm from "@/components/checkout-form"
import OrderSummary from "@/components/order-summary"

export default function CheckoutPage() {
  const { items, total } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-black text-white rounded font-semibold hover:bg-neutral-800"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-black mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckoutForm total={total} />
          </div>

          <div>
            <OrderSummary items={items} total={total} />
          </div>
        </div>
      </div>
    </main>
  )
}
