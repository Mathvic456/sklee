"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const reference = searchParams.get("reference")

    if (reference) {
      // Send the payment reference to our verification endpoint
      verifyPayment(reference)
    }
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      })

      const data = await response.json()

      if (data.success) {
        setOrder(data.data)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Verification failed:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Verifying payment...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-4">Payment Verification Failed</h1>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-black text-white rounded font-semibold hover:bg-neutral-800"
        >
          Return to Shop
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg border border-neutral-200 p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

        <h1 className="text-2xl font-bold text-black mb-2">Order Confirmed!</h1>

        <p className="text-neutral-600 mb-6">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>

        <div className="bg-neutral-50 p-4 rounded mb-6 text-left">
          <p className="text-sm text-neutral-600 mb-1">Order Reference</p>
          <p className="font-mono font-bold text-black break-all">{order.reference}</p>
        </div>

        <p className="text-sm text-neutral-600 mb-6">
          A confirmation email has been sent to <strong>{order.customer.email}</strong>
        </p>

        <button
          onClick={() => router.push("/")}
          className="w-full px-6 py-3 bg-black text-white rounded font-semibold hover:bg-neutral-800 transition"
        >
          Continue Shopping
        </button>
      </div>
    </main>
  )
}
