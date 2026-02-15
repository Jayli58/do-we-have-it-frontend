"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

export default function AuthInitializer() {
  const initAuth = useAuthStore((store) => store.init);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return null;
}
