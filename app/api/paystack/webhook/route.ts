import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    // This ensures the webhook is actually from Paystack
    const signature = request.headers.get("x-paystack-signature")
    const rawBody = await request.text()

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
      .update(rawBody)
      .digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    if (body.event === "charge.success") {
      const { data } = body
      // Here you can:
      // 1. Save order to database
      // 2. Send confirmation email
      // 3. Update inventory
      // 4. Generate invoice

      console.log("Payment successful:", data)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
