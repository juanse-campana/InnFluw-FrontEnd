import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Drop } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  discountCode: string | null;
  discountValue: number;
  addItem: (drop: Drop) => void;
  removeItem: (dropId: string) => void;
  updateQuantity: (dropId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getItemCount: () => number;
  setDiscount: (code: string, value: number) => void;
  clearDiscount: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      discountCode: null,
      discountValue: 0,

      addItem: (drop: Drop) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.drop.id === drop.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.drop.id === drop.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                drop,
                quantity: 1,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      removeItem: (dropId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.drop.id !== dropId),
        }));
      },

      updateQuantity: (dropId: string, quantity: number) => {
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((item) => item.drop.id !== dropId),
          }));
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.drop.id === dropId ? { ...item, quantity } : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], discountCode: null, discountValue: 0 });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      setDiscount: (code: string, value: number) => {
        set({ discountCode: code, discountValue: value });
      },

      clearDiscount: () => {
        set({ discountCode: null, discountValue: 0 });
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
