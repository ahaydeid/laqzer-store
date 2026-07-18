"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { CartItem } from '@/core/types/cart'
import { getServices } from '@/services'

import { useAuth } from '@/components/providers/AuthProvider'

interface CartContextProps {
  items: CartItem[]
  loading: boolean
  cartCount: number
  refreshCart: () => Promise<void>
  addToCart: (productId: string, variant: string, quantity: number) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  toggleCheckItem: (id: string) => Promise<void>
  toggleAllCheck: (checked: boolean) => Promise<void>
  clearCheckedItems: () => Promise<void>
}

const CartContext = createContext<CartContextProps | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const { user } = useAuth()

  // Use the service client-side
  const cartService = getServices().cart

  const refreshCart = useCallback(async () => {
    try {
      const cartItems = await cartService.getCartItems()
      setItems(cartItems)
    } catch (error) {
      console.error('Failed to fetch cart items:', error)
    }
  }, [cartService])

  useEffect(() => {
    let active = true
    const loadInit = async () => {
      try {
        const cartItems = await cartService.getCartItems()
        if (active) {
          setItems(cartItems)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch cart items:', err)
        if (active) {
          setLoading(false)
        }
      }
    }
    loadInit()
    return () => {
      active = false
    }
  }, [cartService, user])


  const addToCart = async (productId: string, variant: string, quantity: number) => {
    setLoading(true)
    try {
      await cartService.addToCart(productId, variant, quantity)
      await refreshCart()
    } catch (error) {
      console.error('Failed to add to cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (id: string) => {
    setLoading(true)
    try {
      await cartService.removeFromCart(id)
      await refreshCart()
    } catch (error) {
      console.error('Failed to remove from cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    // Optimistic UI update to feel super fast
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) }
          : item
      )
    )
    try {
      await cartService.updateQuantity(id, quantity)
      const cartItems = await cartService.getCartItems()
      setItems(cartItems)
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  const toggleCheckItem = async (id: string) => {
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
    try {
      await cartService.toggleCheckItem(id)
      const cartItems = await cartService.getCartItems()
      setItems(cartItems)
    } catch (error) {
      console.error('Failed to toggle item check:', error)
    }
  }

  const toggleAllCheck = async (checked: boolean) => {
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => ({ ...item, checked }))
    )
    try {
      await cartService.toggleAllCheck(checked)
      const cartItems = await cartService.getCartItems()
      setItems(cartItems)
    } catch (error) {
      console.error('Failed to toggle all check:', error)
    }
  }

  const clearCheckedItems = async () => {
    setLoading(true)
    try {
      const checkedIds = items.filter((item) => item.checked).map((item) => item.id)
      for (const id of checkedIds) {
        await cartService.removeFromCart(id)
      }
      await refreshCart()
    } catch (error) {
      console.error('Failed to clear checked items:', error)
    } finally {
      setLoading(false)
    }
  }

  // Count represents the sum of all item quantities in the cart
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        cartCount,
        refreshCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleCheckItem,
        toggleAllCheck,
        clearCheckedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
