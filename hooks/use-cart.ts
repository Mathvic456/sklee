import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  total: number
  addItem: (product: any, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  calculateTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      total: 0,

      addItem: (product, quantity) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id)

          let newItems
          if (existingItem) {
            newItems = state.items.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
            )
          } else {
            newItems = [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity,
              },
            ]
          }

          return {
            items: newItems,
            total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          }
        }),

      removeItem: (productId) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== productId)
          return {
            items: newItems,
            total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          }
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== productId),
              total: state.items
                .filter((item) => item.id !== productId)
                .reduce((sum, item) => sum + item.price * item.quantity, 0),
            }
          }

          const newItems = state.items.map((item) => (item.id === productId ? { ...item, quantity } : item))

          return {
            items: newItems,
            total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          }
        }),

      clearCart: () =>
        set(() => ({
          items: [],
          total: 0,
        })),

      calculateTotal: () => 0,
    }),
    {
      name: "sklee-cart",
    },
  ),
)
