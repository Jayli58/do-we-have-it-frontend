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
  const hasRefreshed = useRef(false);
  const retryCount = useRef(0);
  const [ready, setReady] = useState(false);
  // a ref to store the retry timeout ID
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ensure auth store is initialized before rendering children
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    // retry auth store initialization
    const maxWaitMs = 3000;
    const retryDelayMs = 150;
    const maxRetries = Math.ceil(maxWaitMs / retryDelayMs);

    const attemptInit = () => {
      useAuthStore.getState().init();
      const { idToken } = useAuthStore.getState();
      if (idToken) {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
        setReady(true);
        return;
      }
      // if max retries is reached, reload the page
      if (retryCount.current >= maxRetries) {
        if (!hasRefreshed.current) {
          hasRefreshed.current = true;
          window.location.reload();
        }
        setReady(true);
        return;
      }
      retryCount.current += 1;
      console.log(`AuthStoreInit retry ${retryCount.current} time`);
      retryTimeoutRef.current = setTimeout(attemptInit, retryDelayMs);
    };

    // start auth store initialization
    attemptInit();
    hasInitialized.current = true;

    // cleanup retry timeout
    return () => {
      if (retryTimeoutRef.current) {
        // cancel the pending retry
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
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
