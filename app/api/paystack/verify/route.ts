import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 })
    }

    // Call Paystack verify endpoint with the payment reference
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (data.status && data.data.status === "success") {
      // Payment successful - here you can:
      // 1. Save order to database
      // 2. Send confirmation email
      // 3. Create order record with transaction details
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: data.data,
      })
    } else {
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
