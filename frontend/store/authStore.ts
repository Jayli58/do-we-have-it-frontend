import { create } from "zustand";

import type { UserInfo } from "@/lib/auth";
import { getIdToken, parseUserInfo } from "@/lib/auth";

interface AuthState {
  idToken: string | null;
  user: UserInfo | null;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  idToken: null,
  user: null,
  init: () => {
    const idToken = getIdToken();
    if (!idToken) {
      set({ idToken: null, user: null });
      return;
    }
    const user = parseUserInfo(idToken);
    set({ idToken, user });
  },
}));

// Parse token eagerly so user info is available on first render
useAuthStore.getState().init();
