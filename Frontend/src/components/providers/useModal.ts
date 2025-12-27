"use client";
import { useModalContext } from "./ModalContext";

export function useModal() {
  const { modal, openModal, closeModal } = useModalContext();

  return { modal, openModal, closeModal };
}
