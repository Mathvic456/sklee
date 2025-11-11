# Flutterwave Integration Guide for Sklee Store (Nigeria)

This guide will help you integrate Flutterwave as an alternative or additional payment processor for the Sklee e-commerce store. Flutterwave is a Pan-African payment service supporting Nigerian and international transactions.

## What is Flutterwave?

Flutterwave is a payment technology company that provides:
- Card payments (Visa, Mastercard, AmEx)
- Bank transfers & USSD
- Mobile money (MTN, Airtel, Vodafone)
- International transfers
- Split payments (e-commerce features)

## Why Use Flutterwave?

- **Lower fees** for certain payment methods
- **Better coverage** for mobile money across Africa
- **Instant settlement** options
- **Fraud detection** tools
- **Multi-currency** support

## Prerequisites

- Flutterwave account (sign up at https://flutterwave.com)
- Business verification completed
- Nigerian bank account
- The Sklee project set up

## Step 1: Create a Flutterwave Account

1. Go to [Flutterwave.com](https://flutterwave.com)
2. Click "Create Account" or "Sign Up"
3. Choose "Business" account type
4. Fill in your business information:
   - Business name: "Sklee"
   - Business type: "Fashion/Retail"
   - Business description
5. Complete email verification
6. Verify your business with government-issued ID

## Step 2: Get Your API Keys

Once verified:

1. Log in to Flutterwave Dashboard
2. Go to **Settings** → **API Keys**
3. You'll see:
   - **Public Key**: For client-side integration
   - **Secret Key**: For server-side operations (KEEP SECRET!)
   - **Encryption Key**: For additional security

Copy all three keys and store them securely.

### Flutterwave Key Types:

- **Test Keys**: Used for development/testing
- **Live Keys**: Used for production transactions

## Step 3: Add Environment Variables

Add these to your `.env.local`:

\`\`\`
# Flutterwave Keys
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_test_your_test_public_key
FLUTTERWAVE_SECRET_KEY=sk_test_your_test_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=enc_test_your_encryption_key

# For production
# NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_live_your_live_public_key
# FLUTTERWAVE_SECRET_KEY=sk_live_your_live_secret_key
# FLUTTERWAVE_ENCRYPTION_KEY=enc_live_your_encryption_key
\`\`\`

## Step 4: Install Flutterwave SDK

Install the Flutterwave React SDK:

\`\`\`bash
npm install flutterwave-react-v3
\`\`\`

## Step 5: Create Flutterwave Payment Routes

Create `app/api/flutterwave/initialize/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      email,
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      orderReference,
    } = await request.json()

    // Generate a unique transaction reference
    const txRef = `SKLEE-${orderReference}-${Date.now()}`

    // Create the payload
    const payload = {
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: txRef,
      amount: amount, // Flutterwave accepts amount in Naira
      currency: 'NGN',
      payment_options: 'card,ussd,bank_transfer,mobilemoneyfrombothservicesproviders',
      customer: {
        email: email,
        phonenumber: phone,
        name: fullName,
      },
      customizations: {
        title: 'Sklee Clothing Store',
        description: 'Purchase from Sklee',
        logo: 'https://yourdomain.com/logo.png',
      },
      meta: {
        address: address,
        city: city,
        state: state,
        zipCode: zipCode,
      },
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-flutterwave-callback`,
    }

    return NextResponse.json({
      status: 'success',
      message: 'Checkout initialized',
      data: {
        link: `https://checkout.flutterwave.com/?txref=${payload.tx_ref}&PBFPubKey=${payload.public_key}`,
        tx_ref: txRef,
      },
    })
  } catch (error) {
    console.error('Flutterwave initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
\`\`\`

Create `app/api/flutterwave/verify/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { transaction_id } = await request.json()

    // Verify the transaction with Flutterwave
    const verifyResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    )

    const data = await verifyResponse.json()

    if (data.status === 'success' && data.data.status === 'successful') {
      // Payment was successful
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          reference: data.data.tx_ref,
          amount: data.data.amount,
          currency: data.data.currency,
          customer: {
            email: data.data.customer.email,
            name: data.data.customer.name,
            phone: data.data.customer.phone,
          },
          chargeResponseCode: data.data.charge_code,
          chargeResponseMessage: data.data.charge_response_message,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Flutterwave verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
\`\`\`

## Step 6: Create Flutterwave Checkout Component

Create `components/flutterwave-button.tsx`:

\`\`\`typescript
'use client'

import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/use-cart'

interface FlutterwaveButtonProps {
  total: number
  customerData: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
  }
}

export default function FlutterwaveButton({ total, customerData }: FlutterwaveButtonProps) {
  const router = useRouter()
  const { clearCart, items } = useCart()
  const [loading, setLoading] = useState(false)

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `SKLEE-${Date.now()}`,
    amount: total,
    currency: 'NGN',
    payment_options: 'card,ussd,bank_transfer,mobilemoneyfrombothservicesproviders',
    customer: {
      email: customerData.email,
      phonenumber: customerData.phone,
      name: customerData.fullName,
    },
    customizations: {
      title: 'Sklee Clothing Store',
      description: 'Purchase premium clothing from Sklee',
      logo: 'https://yourdomain.com/logo.png',
    },
    meta: {
      address: customerData.address,
      city: customerData.city,
      state: customerData.state,
      zipCode: customerData.zipCode,
    },
  }

  const handleFlutterPayment = useFlutterwave(config)

  const onPaymentComplete = async (response: any) => {
    if (response.status === 'successful') {
      try {
        // Verify payment
        const verifyResponse = await fetch('/api/flutterwave/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: response.transaction_id,
          }),
        })

        const verifyData = await verifyResponse.json()

        if (verifyData.success) {
          clearCart()
          router.push(
            `/payment-flutterwave-success?reference=${response.tx_ref}&transactionId=${response.transaction_id}`
          )
        } else {
          alert('Payment verification failed')
        }
      } catch (error) {
        console.error('Verification error:', error)
        alert('An error occurred verifying your payment')
      }
    } else {
      alert('Payment failed. Please try again.')
    }

    closePaymentModal()
  }

  return (
    <button
      onClick={() => {
        setLoading(true)
        handleFlutterPayment({
          callback: onPaymentComplete,
          onClose: () => setLoading(false),
        })
      }}
      disabled={loading}
      className="w-full py-3 mt-6 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading ? 'Processing...' : `Pay with Flutterwave - ₦${total.toLocaleString()}`}
    </button>
  )
}
\`\`\`

## Step 7: Add Flutterwave to Checkout Form

Update `components/checkout-form.tsx` to include both payment options:

\`\`\`typescript
'use client'

import { useState } from 'react'
import CheckoutFormContent from './checkout-form-content'
import FlutterwaveButton from './flutterwave-button'

interface CheckoutFormProps {
  total: number
}

export default function CheckoutForm({ total }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | null>(null)
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

  return (
    <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-6">
      <h2 className="text-xl font-bold text-black">Payment Information</h2>

      {/* Customer Information */}
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Address</label>
          <input
            type="text"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
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
            />
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-semibold text-black mb-4">Select Payment Method</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('paystack')}
            className={`p-4 border-2 rounded-lg font-semibold transition ${
              paymentMethod === 'paystack'
                ? 'border-black bg-black text-white'
                : 'border-neutral-300 text-black hover:border-black'
            }`}
          >
            Paystack
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('flutterwave')}
            className={`p-4 border-2 rounded-lg font-semibold transition ${
              paymentMethod === 'flutterwave'
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-neutral-300 text-black hover:border-orange-500'
            }`}
          >
            Flutterwave
          </button>
        </div>
      </div>

      {/* Display selected payment method button */}
      {paymentMethod === 'paystack' && (
        <button className="w-full py-3 bg-black text-white font-bold rounded hover:bg-neutral-800 transition">
          Pay with Paystack - ₦{total.toLocaleString()}
        </button>
      )}

      {paymentMethod === 'flutterwave' && (
        <FlutterwaveButton total={total} customerData={formData} />
      )}
    </div>
  )
}
\`\`\`

## Step 8: Create Flutterwave Callback Page

Create `app/payment-flutterwave-success/page.tsx`:

\`\`\`typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader } from 'lucide-react'

export default function FlutterwaveSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const reference = searchParams.get('reference')
  const transactionId = searchParams.get('transactionId')

  useEffect(() => {
    // Payment is already verified from the client side
    if (reference && transactionId) {
      setStatus('success')
    } else {
      setStatus('error')
    }
  }, [reference, transactionId])

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 mx-auto mb-4 animate-spin text-orange-500" />
            <h1 className="text-2xl font-bold text-black mb-2">Processing Payment</h1>
            <p className="text-neutral-600">Please wait...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold text-black mb-2">Payment Successful!</h1>
            <p className="text-neutral-600 mb-6">Thank you for shopping with Sklee. Your order has been confirmed.</p>
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
            <h1 className="text-2xl font-bold text-black mb-2">Payment Error</h1>
            <p className="text-neutral-600 mb-6">An error occurred processing your payment.</p>
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

## Step 9: Set Up Webhooks (Optional but Recommended)

1. Go to Flutterwave Dashboard
2. Navigate to **Settings** → **Webhooks**
3. Add your webhook URL:
   \`\`\`
   https://yourdomain.com/api/flutterwave/webhook
   \`\`\`
4. Set hash algorithm to **SHA256**
5. Test the webhook connection

Create `app/api/flutterwave/webhook/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const body = await request.text()

  // Verify webhook signature
  const hash = crypto
    .createHmac('sha256', process.env.FLUTTERWAVE_ENCRYPTION_KEY!)
    .update(body)
    .digest('base64')

  const signature = request.headers.get('verif-hash')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'charge.completed') {
    const { reference, amount, customer } = event.data

    // TODO: Save order to database
    console.log(`Received ₦${amount} from ${customer.email}`)
  }

  return NextResponse.json({ success: true })
}
\`\`\`

## Step 10: Testing Flutterwave

### Test Credentials:

1. Get test cards from [Flutterwave Test Cards](https://developer.flutterwave.com/docs/testing)
2. Common test cards:
   - **Visa**: 4556737586899855 (Any future date, Any 3-digit CVV)
   - **Mastercard**: 5438898014666046 (Any future date, Any 3-digit CVV)
   - **Verve**: 5090002222222221 (Any future date, Any 3-digit CVV)

### Test USSD:

- Use test USSD code: *901#

### Test Bank Transfer:

- Flutterwave will provide test bank details during testing

## Step 11: Comparison: Paystack vs Flutterwave

| Feature | Paystack | Flutterwave |
|---------|----------|------------|
| Card Payments | ✓ | ✓ |
| USSD | ✓ | ✓ |
| Bank Transfer | ✓ | ✓ |
| Mobile Money | Limited | ✓ (Better) |
| International | Limited | ✓ |
| Settlement Time | 1-3 days | Instant |
| Fees | 1.5% + ₦100 | 1.4% + ₦100 |
| Support | Excellent | Excellent |

## Step 12: Going Live

### Before Going Live:

1. Replace test keys with live keys
2. Update webhook URLs to production domain
3. Test with real transactions
4. Set up proper error handling
5. Configure auto-settlement
6. Enable fraud detection

### Production Checklist:

- [ ] Live keys added to environment variables
- [ ] Domain SSL certificate configured
- [ ] Error logging implemented
- [ ] Monitoring set up
- [ ] Support contact info in emails
- [ ] Return/refund policy documented
- [ ] Payment receipts/invoices working

## Nigeria-Specific Features

### 1. Mobile Money Options:
- MTN Mobile Money
- Airtel Money
- 9Mobile
- Vodafone (International)

### 2. Local Bank Integration:
- Direct bank transfer
- Same-day settlement option
- Bank reconciliation tools

### 3. USSD Support:
- *901*amount*reference# format
- No internet needed
- Fastest for feature phones

## Troubleshooting

**Issue**: "Cannot read properties of undefined (reading 'public_key')"
- **Solution**: Ensure NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY is set in environment variables

**Issue**: "Invalid API key"
- **Solution**: Check that keys are from the same Flutterwave account and environment (test/live)

**Issue**: "Transaction amount is too low"
- **Solution**: Flutterwave minimum is ₦100. Ensure prices are properly calculated.

**Issue**: USSD not showing up
- **Solution**: Enable USSD in your Flutterwave dashboard settings

## Useful Links

- [Flutterwave Documentation](https://developer.flutterwave.com/docs)
- [Flutterwave Dashboard](https://dashboard.flutterwave.com)
- [Test Cards](https://developer.flutterwave.com/docs/testing)
- [Settlement Guide](https://developer.flutterwave.com/docs/guides/settlements)

## Support

For Flutterwave support:
- Email: hello@flutterwave.com
- Website: https://flutterwave.com/contact
- Documentation: https://developer.flutterwave.com
