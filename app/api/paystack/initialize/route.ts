import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, email, fullName, phone, address, city, state, zipCode } = body

    // Call Paystack API with your secret key from environment variables
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount, // in kobo
        email,
        metadata: {
          fullName,
          phone,
          address,
          city,
          state,
          zipCode,
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
      return NextResponse.json({ error: "Payment initialization failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Paystack error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
