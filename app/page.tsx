"use client"

import { useState } from "react"
import Header from "@/components/header"
import Landing from "@/components/landing"

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(!cartOpen)} />
      <Landing />
    </main>
  )
}
