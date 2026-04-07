'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@lavastore/shared-types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem:      (item: CartItem) => void;
  removeItem:   (productId: string) => void;
  updateQty:    (productId: string, qty: number) => void;
  clearCart:    () => void;
  openCart:     () => void;
  closeCart:    () => void;

  // Computed
  totalItems:   () => number;
  totalPrice:   () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === newItem.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, newItem], isOpen: true };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: qty } : i,
                ),
        })),

      clearCart:  () => set({ items: [] }),
      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'lavastore-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
