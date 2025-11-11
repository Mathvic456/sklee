"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Heart, Minus, Plus, Share2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import Header from "@/components/header"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
  sizes?: string[]
  colors?: string[]
  details?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [cartOpen, setCartOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const mockProducts: { [key: string]: Product } = {
      "1": {
        id: "1",
        name: "Classic T-Shirt",
        price: 12500,
        image: "/white-premium-tshirt.jpg",
        category: "Tops",
        description: "Premium quality classic t-shirt made from 100% organic cotton",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["White", "Black", "Navy", "Grey"],
        details: "Comfortable and versatile. Perfect for everyday wear.",
      },
      "2": {
        id: "2",
        name: "Denim Jeans",
        price: 45000,
        image: "/blue-denim-jeans.jpg",
        category: "Bottoms",
        description: "Premium quality denim jeans with classic fit and durability",
        sizes: ["28", "30", "32", "34", "36", "38"],
        colors: ["Light Blue", "Medium Blue", "Dark Blue", "Black"],
        details: "Made from premium denim with a perfect fit for all body types.",
      },
    }

    const foundProduct = mockProducts[params.id as string]
    if (foundProduct) {
      setProduct(foundProduct)
      setSelectedSize(foundProduct.sizes?.[0] || "")
      setSelectedColor(foundProduct.colors?.[0] || "")
    }
  }, [params.id])

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Please select size and color")
      return
    }

    const cartItem = {
      ...product,
      id: `${product?.id}-${selectedSize}-${selectedColor}`,
      variant: {
        size: selectedSize,
        color: selectedColor,
      },
    }

    addItem(cartItem, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!product) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-white">
      <Header onCartClick={() => setCartOpen(!cartOpen)} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => router.back()} className="text-neutral-600 hover:text-black mb-8 transition">
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-neutral-100 rounded-lg overflow-hidden h-[600px]">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-start">
            <div className="mb-6">
              <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">{product.category}</p>
              <h1 className="text-4xl font-bold text-black mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-black">₦{product.price.toLocaleString()}</p>
            </div>

            <p className="text-neutral-700 mb-8 leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            {product.sizes && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-black mb-4">Select Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border-2 rounded-lg font-semibold transition ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 text-black hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-black mb-4">Select Color</label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border-2 rounded-lg font-semibold transition ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 text-black hover:border-black"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-black mb-4">Quantity</label>
              <div className="flex items-center border border-neutral-300 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-neutral-100 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-12 text-center border-0 focus:outline-none"
                />
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-neutral-100 transition">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition mb-4 ${
                added ? "bg-green-500 text-white" : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>

            {/* Additional Actions */}
            <div className="flex gap-4 pt-4 border-t border-neutral-200">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition">
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>

            {/* Product Details */}
            <div className="mt-8 pt-8 border-t border-neutral-200">
              <h3 className="text-lg font-bold text-black mb-4">Product Details</h3>
              <p className="text-neutral-700">{product.details}</p>
              <ul className="mt-4 space-y-2 text-neutral-700">
                <li>✓ Free shipping on orders over ₦50,000</li>
                <li>✓ 7-day return policy</li>
                <li>✓ Premium packaging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
