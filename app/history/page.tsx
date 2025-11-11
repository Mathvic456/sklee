"use client"

import Header from "@/components/header"

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header onCartClick={() => {}} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-12 text-balance leading-tight">
            Our Journey
          </h1>

          {/* Timeline */}
          <div className="space-y-12 md:space-y-16">
            {[
              {
                year: "2020",
                title: "The Beginning",
                description:
                  "Sklee was founded by a group of passionate designers with a shared vision: to revolutionize affordable fashion through exceptional quality and timeless design.",
              },
              {
                year: "2021",
                title: "First Collection Launch",
                description:
                  "We launched our debut collection featuring 50 carefully curated pieces, receiving overwhelming support from fashion enthusiasts and industry critics alike.",
              },
              {
                year: "2022",
                title: "Expansion",
                description:
                  "With growing demand, we expanded our team and production capacity. We established our commitment to sustainable and ethical manufacturing practices.",
              },
              {
                year: "2023",
                title: "Global Reach",
                description:
                  "Sklee products reached customers across 15 countries. We opened our first flagship store and launched our online community platform.",
              },
              {
                year: "2024",
                title: "Innovation & Growth",
                description:
                  "We introduced new product lines, enhanced our digital experience, and doubled down on our sustainability initiatives. Today, Sklee serves thousands of customers worldwide.",
              },
            ].map((milestone, i) => (
              <div key={i} className="flex gap-8">
                <div className="flex-shrink-0 w-24">
                  <p className="text-2xl font-serif font-bold text-foreground">{milestone.year}</p>
                </div>
                <div className="flex-grow pb-8 border-b border-muted">
                  <h3 className="text-2xl font-semibold text-foreground mb-3">{milestone.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Looking Forward */}
          <div className="mt-16 md:mt-24 bg-muted rounded-lg p-12">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">Looking Forward</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              We are just getting started. Our vision for the future includes expanding our collections, deepening our
              commitment to sustainability, and building a global community of Sklee lovers.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Thank you for being part of our journey. Together, we're shaping the future of fashion—one timeless piece
              at a time.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
