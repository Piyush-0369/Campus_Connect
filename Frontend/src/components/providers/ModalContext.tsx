"use client";

import { createContext, useContext, useState } from "react";

export type ModalType =
  | "project"
  | "achievement"
  | "experience"
  | "alumniEditProfile"
  | "studentEditProfile"
  | "DetailsCard"
  | null;

interface ModalState {
  type: ModalType;
  props?: any;
}

interface ModalContextType {
  modal: ModalState;
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState>({ type: null, props: null });

  const openModal = (type: ModalType, props?: any) => {
    setModal({ type, props });
  };

  const closeModal = () => {
    setModal({ type: null, props: null });
  };

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModalContext must be inside ModalProvider");
  return ctx;
}
