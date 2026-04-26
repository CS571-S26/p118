import { create } from "zustand";

const useSavedDebatesStore = create((set, get) => ({
  savedIds: new Set(),

  toggle: (debateId) =>
    set((state) => {
      const next = new Set(state.savedIds);
      next.has(debateId) ? next.delete(debateId) : next.add(debateId);
      return { savedIds: next };
    }),

  isSaved: (debateId) => get().savedIds.has(debateId),
}));

export default useSavedDebatesStore;