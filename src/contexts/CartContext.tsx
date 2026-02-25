'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type CartItem = {
  id: string
  name_ar: string
  price: number
  image: string
  store_id: string
  store_name: string
  unit: string
  max_quantity: number
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (productId: string) => number
  getCartTotal: () => number
  getItemCount: () => number
  openCart: () => void
  closeCart: () => void
  isCartOpen: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('quincadz_cart')
    if (saved) {
      try {
        setCartItems(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error)
      }
    }
  }, [])

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quincadz_cart') {
        setCartItems(JSON.parse(e.newValue || '[]'))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    localStorage.setItem('quincadz_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        const newQuantity = Math.min(existing.quantity + 1, existing.max_quantity)
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        )
      } else {
        return [...prev, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(quantity, item.max_quantity) }
          : item
      )
    )
  }

  const clearCart = () => setCartItems([])

  const getItemQuantity = (productId: string) => {
    return cartItems.find(item => item.id === productId)?.quantity || 0
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        getCartTotal,
        getItemCount,
        openCart,
        closeCart,
        isCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
