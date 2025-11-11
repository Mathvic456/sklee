"use client"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface OrderSummaryProps {
  items: OrderItem[]
  total: number
}

export default function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-neutral-200 sticky top-24">
      <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div>
              <p className="font-medium text-black">{item.name}</p>
              <p className="text-neutral-600">Qty: {item.quantity}</p>
            </div>
            <p className="font-medium text-black">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Shipping</span>
          <span>TBD</span>
        </div>
        <div className="border-t border-neutral-200 pt-2 mt-4 flex justify-between font-bold text-black">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
