import { create } from "zustand";

import type { Item } from "@/types";
import { searchItems } from "@/api/inventory";

interface SearchState {
  query: string;
  results: Item[];
  isSearching: boolean;
  setQuery: (query: string) => void;
  runSearch: (query: string, parentId: string | null) => Promise<void>;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  isSearching: false,
  setQuery: (query) => set({ query }),
  runSearch: async (query, parentId) => {
    set({ isSearching: true, query });
    const results = await searchItems(query, parentId);
    set({ results, isSearching: false });
  },
  clear: () => set({ query: "", results: [], isSearching: false }),
}));
