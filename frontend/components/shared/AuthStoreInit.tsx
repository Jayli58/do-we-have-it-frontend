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
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);

  // ensure auth store is initialized before rendering children
  useEffect(() => {
    if (initialized.current) {
      return;
    }
    useAuthStore.getState().init();
    initialized.current = true;
    setReady(true);
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
