import { create } from 'zustand'

type SearchMode = 'travel' | 'rental'

interface HomeState {
  searchMode: SearchMode
  setSearchMode: (mode: SearchMode) => void
}

export const useHomeStore = create<HomeState>((set) => ({
  searchMode: 'travel',
  setSearchMode: (mode) => set({ searchMode: mode }),
}))
