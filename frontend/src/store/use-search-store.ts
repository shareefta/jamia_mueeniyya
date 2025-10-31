import { create } from 'zustand';

interface SearchState {
  keyword: string;
  setKeyword: (term: string) => void;
  clearKeyword: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  keyword: '',
  setKeyword: (term) => set({ keyword: term }),
  clearKeyword: () => set({ keyword: '' }),
}));