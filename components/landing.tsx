"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-6 text-balance leading-tight">
                Elevate Your Style
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Discover curated, premium clothing that transcends trends. At Sklee, we believe in timeless elegance and
                contemporary design.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background font-semibold rounded-none hover:bg-muted-foreground transition"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-foreground text-foreground font-semibold rounded-none hover:bg-foreground hover:text-background transition"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="bg-muted rounded-lg aspect-square flex items-center justify-center">
              <img
                src="/luxury-clothing-collection-fashion.jpg"
                alt="Sklee Collection"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-16 text-center">Why Choose Sklee</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Premium Quality",
                description: "Handpicked fabrics and meticulous craftsmanship in every piece",
              },
              {
                title: "Timeless Design",
                description: "Collections that transcend seasons and remain eternally relevant",
              },
              {
                title: "Sustainable",
                description: "Committed to ethical production and environmental responsibility",
              },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <h3 className="text-2xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Ready to Explore?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse our latest collection and find your perfect piece.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background font-semibold rounded-none hover:bg-muted-foreground transition"
          >
            Visit Store
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
