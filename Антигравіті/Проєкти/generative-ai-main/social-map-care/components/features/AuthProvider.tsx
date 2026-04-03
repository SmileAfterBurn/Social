'use client';

import React, { createContext, useContext } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import type { UserRole, UserSession } from '@/types';
import type { Session } from 'next-auth';

// --- Типи ---
interface AuthContextValue {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

// --- Контекст ---
const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isManager: false,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

// --- Внутрішній хук ---
function useAuthInternal(): AuthContextValue {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  const role: UserRole =
    ((session as (Session & { user: { role?: UserRole } }) | null)?.user?.role) ?? 'Guest';

  const user: UserSession | null = session?.user
    ? {
        id: (session.user as { email?: string }).email ?? 'unknown',
        name: session.user.name ?? 'Користувач',
        role,
        avatar: session.user.image ?? undefined,
      }
    : null;

  return {
    user,
    isLoading,
    isAuthenticated: !!session?.user,
    isAdmin: role === 'Admin',
    isManager: role === 'Admin' || role === 'Manager',
    signInWithGoogle: () => signIn('google').then(() => {}),
    signOutUser: () => signOut({ callbackUrl: '/' }),
  };
}

// --- Компонент що надає контекст ---
function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthInternal();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Публічний хук ---
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

// --- Статичний провайдер (без NextAuth, для static export) ---
const STATIC_AUTH_DISABLED = process.env.NEXT_PUBLIC_AUTH_DISABLED === '1';

const staticAuthValue: AuthContextValue = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  isManager: false,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
};

// --- Головний провайдер (обгортає SessionProvider) ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (STATIC_AUTH_DISABLED) {
    return (
      <AuthContext.Provider value={staticAuthValue}>
        {children}
      </AuthContext.Provider>
    );
  }
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

