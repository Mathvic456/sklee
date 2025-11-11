"use client"

import type React from "react"

import Header from "@/components/header"
import { Mail, MapPin, Phone } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <main className="min-h-screen bg-background">
      <Header onCartClick={() => {}} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-4 text-balance leading-tight">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground mb-16">
            We'd love to hear from you. Reach out with any questions, feedback, or inquiries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Mail,
                label: "Email",
                value: "hello@sklee.com",
              },
              {
                icon: Phone,
                label: "Phone",
                value: "+1 (555) 123-4567",
              },
              {
                icon: MapPin,
                label: "Address",
                value: "123 Fashion Street, New York, NY 10001",
              },
            ].map((contact, i) => {
              const Icon = contact.icon
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{contact.label}</p>
                    <p className="text-muted-foreground">{contact.value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Contact Form */}
          <div className="bg-muted rounded-lg p-8 md:p-12">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-none focus:outline-none focus:border-foreground"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-none focus:outline-none focus:border-foreground"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-none focus:outline-none focus:border-foreground"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-none focus:outline-none focus:border-foreground resize-none"
                  placeholder="Your message here..."
                  rows={6}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-3 bg-foreground text-background font-semibold rounded-none hover:bg-muted-foreground transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
