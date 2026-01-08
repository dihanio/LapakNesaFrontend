import { create } from 'zustand';

const useLoginModalStore = create((set) => ({
    isOpen: false,
    openLoginModal: () => set({ isOpen: true }),
    closeLoginModal: () => set({ isOpen: false }),
}));

export default useLoginModalStore;
