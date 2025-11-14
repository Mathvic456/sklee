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
      <header className="sticky top-0 z-40 bg-gradient-to-r from-background via-background to-primary/5 border-b border-primary/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <span className="text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors duration-300 flex items-center">
                SKLEE
                <span className="w-2 h-2 bg-primary rounded-full ml-1 group-hover:scale-150 transition-transform"></span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 bg-background/50 backdrop-blur-sm px-6 py-2 rounded-full border border-border/50">
              {["Home", "Shop", "About", "History", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={`/${item === "Home" ? "" : item.toLowerCase()}`}
                  className="text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 px-3 py-1 rounded-lg hover:bg-primary/10"
                >
                  {item}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2.5 bg-accent text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-all rounded-full hover:scale-110 border border-border/50"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 bg-accent text-muted-foreground hover:text-foreground transition-all rounded-full hover:bg-primary/20 border border-border/50"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className="relative p-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full hover:scale-105 group border border-primary/30"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-background text-foreground text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border border-primary scale-110 group-hover:scale-125 transition-transform">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden bg-gradient-to-b from-background to-accent/30 backdrop-blur-lg border border-border/50 rounded-2xl mt-2 py-4 space-y-3 shadow-lg">
              {["Home", "Shop", "About", "History", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={`/${item === "Home" ? "" : item.toLowerCase()}`}
                  className="block px-6 py-3 text-base font-semibold text-muted-foreground hover:text-primary transition-all hover:bg-primary/10 hover:border-l-4 border-primary mx-2 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
    )
  }