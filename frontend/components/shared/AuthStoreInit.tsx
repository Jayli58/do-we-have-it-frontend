"use client";

import type { ReactNode } from "react";
import { useRef } from "react";

import { useAuthStore } from "@/store/authStore";

interface AuthStoreInitProps {
  children: ReactNode;
}

export default function AuthStoreInit({ children }: AuthStoreInitProps) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useAuthStore.getState().init();
    initialized.current = true;
  }

  return <>{children}</>;
}
