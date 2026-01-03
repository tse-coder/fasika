import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  content: React.ReactNode | null;
  openModal: (content: React.ReactNode | null) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  content: null,
  openModal: (content) =>
    set(() => {
      if (content === null) {
        return {
          isOpen: false,
          content: null,
        };
      }
      return {
        isOpen: true,
        content,
      };
    }),
  closeModal: () =>
    set(() => ({
      isOpen: false,
      content: null,
    })),
}));
