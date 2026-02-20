"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import { useAuthStore } from "@/store/authStore";

interface AuthStoreInitProps {
  children: ReactNode;
}

export default function AuthStoreInit({ children }: AuthStoreInitProps) {
  // for local development
  const useDemoAuth = process.env.NEXT_PUBLIC_USE_DEMO_AUTH === "true";
  if (useDemoAuth) {
    return <>{children}</>;
  }

  const hasInitialized = useRef(false);
  const [ready, setReady] = useState(false);

  // ensure auth store is initialized before rendering children
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    useAuthStore.getState().init();
    setReady(true);
    hasInitialized.current = true;
  }, []);

  // show loading spinner while auth store is initializing
  if (!ready) {
    return (
      <Box className="auth-init-spinner">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
