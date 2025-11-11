# Paystack Integration Guide for Sklee Store (Nigeria)

This guide will help you integrate Paystack as the payment processor for the Sklee e-commerce store in Nigeria.

## What is Paystack?

Paystack is Nigeria's leading payment service provider that enables you to accept payments from customers across Nigeria and internationally. It supports:
- Card payments (Visa, Mastercard, American Express)
- Bank transfers
- USSD
- Mobile money
- Installment plans

## Prerequisites

- Paystack account (sign up at https://paystack.com)
- Business registration or valid ID for verification
- Nigerian bank account
- The Sklee project set up and running

## Step 1: Create a Paystack Account

1. Go to [Paystack.com](https://paystack.com)
2. Click "Get Started"
3. Fill in your business details:
   - Business name: "Sklee" (or your business name)
   - Business type: "Fashion/Retail"
   - Category: "Clothing Store"
4. Enter your personal and bank details
5. Verify your email
6. Complete business verification with government-issued ID

## Step 2: Get Your API Keys

Once your account is verified:

1. Log in to your Paystack Dashboard
2. Navigate to **Settings** → **API Keys & Webhooks**
3. You'll see two keys:
   - **Public Key**: Used for client-side initialization
   - **Secret Key**: Used for server-side verification (KEEP THIS SECRET!)
4. Copy both keys

### Important Security Notes:
- **NEVER** share your Secret Key
- **NEVER** commit Secret Key to version control
- Use environment variables for both keys
- Public Key can be exposed in frontend code but should still be in env variables

## Step 3: Add Environment Variables

Add these to your `.env.local` file:

\`\`\`
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
\`\`\`

For development/testing, use test keys:

\`\`\`
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key
PAYSTACK_SECRET_KEY=sk_test_your_test_secret_key
\`\`\`

## Step 4: Create Paystack Payment Routes

Create `app/api/paystack/initialize/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, email, fullName, phone, address, city, state, zipCode } =
      await request.json()

    // Convert to kobo (Paystack uses kobo, 1 Naira = 100 kobo)
    const amountInKobo = Math.round(amount * 100)

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInKobo,
        email: email,
        metadata: {
          fullName: fullName,
          phone: phone,
          address: address,
          city: city,
          state: state,
          zipCode: zipCode,
        },
      }),
    })

    const data = await response.json()

    if (data.status) {
      return NextResponse.json({
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: data.data.reference,
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Paystack initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
\`\`\`

Create `app/api/paystack/verify/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

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
      // Payment was successful
      // TODO: Save order to Supabase here
      
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          reference: data.data.reference,
          amount: data.data.amount / 100, // Convert back to Naira
          customer: data.data.customer,
          paidAt: data.data.paid_at,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
\`\`\`

## Step 5: Update Checkout Form

Update `components/checkout-form.tsx` to use Paystack with Naira currency:

\`\`\`typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/use-cart'

interface CheckoutFormProps {
  total: number
}

export default function CheckoutForm({ total }: CheckoutFormProps) {
  const router = useRouter()
  const { clearCart, items } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Step 1: Initialize payment with Paystack
      const initResponse = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total, // Total in Naira
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }),
      })

      const initData = await initResponse.json()

      if (initData.authorizationUrl) {
        // Store order details in session for verification
        sessionStorage.setItem('pendingOrder', JSON.stringify({
          items: items,
          total: total,
          customerEmail: formData.email,
          reference: initData.reference,
        }))

        // Redirect to Paystack checkout
        window.location.href = initData.authorizationUrl
      } else {
        alert('Failed to initialize payment. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handlePayment} className="bg-white p-6 rounded-lg border border-neutral-200">
      <h2 className="text-xl font-bold text-black mb-6">Shipping Information</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Your full name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="+234 (0) 800 000 0000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Delivery Address</label>
          <input
            type="text"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Street address"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Lagos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">State</label>
            <input
              type="text"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Lagos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Postal Code</label>
            <input
              type="text"
              name="zipCode"
              required
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="100001"
            />
          </div>
        </div>

        <div className="bg-neutral-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral-700">Subtotal</span>
            <span className="font-semibold">₦{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral-700">Shipping</span>
            <span className="font-semibold">₦0.00</span>
          </div>
          <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between items-center">
            <span className="font-bold">Total</span>
            <span className="text-xl font-bold text-black">₦{total.toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-6 bg-black text-white font-bold rounded hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Processing...' : `Pay with Paystack - ₦${total.toLocaleString()}`}
        </button>
      </div>
    </form>
  )
}
\`\`\`

## Step 6: Create Success/Failure Pages

Create `app/payment-success/page.tsx`:

\`\`\`typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const reference = searchParams.get('reference')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('error')
        return
      }

      try {
        const response = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        })

        const data = await response.json()

        if (data.success) {
          setStatus('success')
          // Clear the session storage
          sessionStorage.removeItem('pendingOrder')
        } else {
          setStatus('error')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
      }
    }

    verifyPayment()
  }, [reference])

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 mx-auto mb-4 animate-spin text-black" />
            <h1 className="text-2xl font-bold text-black mb-2">Verifying Payment</h1>
            <p className="text-neutral-600">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold text-black mb-2">Payment Successful!</h1>
            <p className="text-neutral-600 mb-6">Thank you for your order. Your items will be dispatched soon.</p>
            <p className="text-sm text-neutral-500 mb-6">Reference: {reference}</p>
            <button
              onClick={() => router.push('/shop')}
              className="px-6 py-2 bg-black text-white rounded font-semibold hover:bg-neutral-800"
            >
              Continue Shopping
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-red-600">✕</span>
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Payment Failed</h1>
            <p className="text-neutral-600 mb-6">Unfortunately, your payment could not be processed.</p>
            <button
              onClick={() => router.push('/checkout')}
              className="px-6 py-2 bg-black text-white rounded font-semibold hover:bg-neutral-800"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </main>
  )
}
\`\`\`

## Step 7: Set Up Webhooks for Order Confirmation (Optional)

Webhooks allow Paystack to notify you of payment status in real-time.

1. In Paystack Dashboard, go to **Settings** → **API Keys & Webhooks**
2. Under Webhooks, add your webhook URL:
   \`\`\`
   https://yourdomain.com/api/paystack/webhook
   \`\`\`
3. Select events to listen for: `charge.success`

Create `app/api/paystack/webhook/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex')

  const signature = request.headers.get('x-paystack-signature')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'charge.success') {
    const { reference, customer, amount } = event.data

    // TODO: Save order to database with payment status
    console.log(`Payment of ₦${amount / 100} received from ${customer.email}`)
  }

  return NextResponse.json({ success: true })
}
\`\`\`

## Step 8: Testing

### Using Test Keys:

1. Replace your keys with **test keys** from Paystack
2. Use test card numbers:
   - **Visa**: 4084084084084081 (Any future date, Any 3-digit CVV)
   - **Mastercard**: 5531887115915608 (Any future date, Any 3-digit CVV)
   - **Verve**: 5061020000000000000 (Any future date, Any 3-digit CVV)

### Test Transaction Flow:

1. Add items to cart
2. Go to checkout
3. Enter test customer details
4. Use test card number
5. Verify payment completes
6. Check order in database

## Step 9: Going Live

### Before Going Live:

1. Complete Paystack business verification
2. Replace test keys with **live keys**
3. Test with real transactions (small amounts)
4. Set up proper error handling and logging
5. Implement transaction receipts/invoices

### Update Environment Variables:

\`\`\`
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
\`\`\`

## Nigeria-Specific Features

### 1. USSD Payments

Paystack supports USSD for customers without cards. They'll automatically see the USSD option in the payment interface.

### 2. Bank Transfers

Customers can pay via bank transfer. Provide your business bank account details in Paystack settings.

### 3. Mobile Money

Through Paystack, customers can use services like:
- MTN Mobile Money (West Africa)
- Airtel Money
- Flutterwave (multi-partner)

### 4. Installment Plans

Enable installment payments:
\`\`\`typescript
// In checkout form
const installments = {
  3: { monthlyAmount: total / 3 },
  6: { monthlyAmount: total / 6 },
  12: { monthlyAmount: total / 12 },
}
\`\`\`

## Common Issues & Solutions

**Issue**: "Invalid public key"
- **Solution**: Ensure NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is correct and from live account

**Issue**: "Amount must be at least ₦100"
- **Solution**: Ensure prices are in Kobo (multiply by 100) when sending to Paystack

**Issue**: "Email not allowed"
- **Solution**: Ensure customer email format is valid

**Issue**: "Card declined"
- **Solution**: In test mode, ensure you're using valid test card numbers

## Useful Links

- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://paystack.com/docs/api/)
- [Paystack Dashboard](https://dashboard.paystack.com)
- [Test Credentials](https://paystack.com/docs/getting-started/)

## Support

For Paystack support, contact:
- Email: support@paystack.com
- Phone: +234 (0) 700 000 0000 (Nigeria)
- Website: https://paystack.com/support
