import { create } from 'zustand';

interface AccountStore {
  // Tab states
  activeTab: string;
  activeAddress: string | null;
  activeOrders: string;
  openDetail: boolean;

  // Pagination states
  orderPage: number;
  orderLimit: number;

  // Actions
  setActiveTab: (tab: string) => void;
  setActiveAddress: (address: string | null) => void;
  setActiveOrders: (orders: string) => void;
  setOpenDetail: (open: boolean) => void;
  toggleActiveAddress: (address: string) => void;

  // Pagination actions
  setOrderPage: (page: number) => void;
  setOrderLimit: (limit: number) => void;
  resetOrderPage: () => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  // Initial states
  activeTab: 'dashboard',
  activeAddress: 'billing',
  activeOrders: 'all',
  openDetail: false,
  orderPage: 1,
  orderLimit: 10,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveAddress: (address) => set({ activeAddress: address }),
  setActiveOrders: (orders) => set({ activeOrders: orders, orderPage: 1 }), // Reset page when changing tabs
  setOpenDetail: (open) => set({ openDetail: open }),
  toggleActiveAddress: (address) =>
    set((state) => ({
      activeAddress: state.activeAddress === address ? null : address,
    })),

  // Pagination actions
  setOrderPage: (page) => set({ orderPage: page }),
  setOrderLimit: (limit) => set({ orderLimit: limit, orderPage: 1 }), // Reset page when changing limit
  resetOrderPage: () => set({ orderPage: 1 }),
}));
