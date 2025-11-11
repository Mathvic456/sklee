"use client"

import Link from "next/link"
import { ShoppingBag, Menu, X, Moon, Sun } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

interface HeaderProps {
  onCartClick: () => void
}

export default function Header({ onCartClick }: HeaderProps) {
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 md:py-6">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-foreground">SKLEE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Home
            </Link>
            <Link href="/shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Shop
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              About
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              History
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-muted"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-muted-foreground hover:text-foreground transition"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              About
            </Link>
            <Link
              href="/history"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              History
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
