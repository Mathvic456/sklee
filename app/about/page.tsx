"use client"

import Header from "@/components/header"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header onCartClick={() => {}} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* About Hero */}
        <div className="mb-16 md:mb-24">
          <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-8 text-balance leading-tight">
            About Sklee
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            We are more than just a clothing brand. We are curators of elegance, champions of quality, and believers in
            the transformative power of great design.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16 md:mb-24">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">Our Vision</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Sklee was founded with a singular vision: to create clothing that celebrates individuality while
              maintaining impeccable quality and timeless design. We believe that fashion should be accessible,
              sustainable, and inspiring.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every piece in our collection is thoughtfully designed and carefully crafted to ensure you feel confident
              and comfortable, whether you're at work, out for leisure, or attending a special occasion.
            </p>
          </div>
          <div className="bg-muted rounded-lg aspect-square flex items-center justify-center">
            <img
              src="/fashion-design-studio-creative-space.jpg"
              alt="Sklee Vision"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-muted rounded-lg p-12 mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                value: "Quality First",
                description:
                  "We never compromise on quality. Every seam, every stitch, every fabric choice is intentional.",
              },
              {
                value: "Timeless Design",
                description: "We create pieces that endure beyond fleeting trends, staying relevant through the years.",
              },
              {
                value: "Sustainability",
                description:
                  "We are committed to ethical production practices and minimizing our environmental impact.",
              },
              {
                value: "Customer Focus",
                description: "Your satisfaction and style are at the heart of everything we do.",
              },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.value}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">Discover Our Collections</h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background font-semibold rounded-none hover:bg-muted-foreground transition"
          >
            Shop Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
