"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/auth-client";
import type { BusinessContext } from "@/types/business";

export interface AuthContextValue {
  user: { id: string; email: string; name: string } | null;
  roles: string[];
  permissions: string[];
  businesses: BusinessContext[];
  activeBusiness: string;
  isAuthenticated: boolean;
  setActiveBusiness: (businessId: string) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const parsed = useMemo(() => {
    if (!session?.session) {
      return { roles: [], permissions: [], businesses: [], activeBusiness: "" };
    }
    const s = session.session as unknown as Record<string, string>;
    return {
      roles: JSON.parse(s.roles ?? "[]") as string[],
      permissions: JSON.parse(s.permissions ?? "[]") as string[],
      businesses: JSON.parse(s.businesses ?? "[]") as BusinessContext[],
      activeBusiness: (s.activeBusiness ?? "") as string,
    };
  }, [session]);

  const [activeBusinessId, setActiveBusinessId] = useState(parsed.activeBusiness);

  // Sync state when session loads or changes (useState only captures the initial value)
  useEffect(() => {
    setActiveBusinessId(parsed.activeBusiness);
  }, [parsed.activeBusiness]);

  // Aggregate platform + active business roles/permissions at runtime.
  // The session stores platform-only claims; business claims live in parsed.businesses.
  const aggregated = useMemo(() => {
    const activeBiz = parsed.businesses.find(
      (b) => b.business_id === activeBusinessId
    );
    const roles = [...parsed.roles, ...(activeBiz?.roles ?? [])];
    const permissions = [...parsed.permissions, ...(activeBiz?.permissions ?? [])];
    return { roles, permissions };
  }, [parsed, activeBusinessId]);

  const hasPermission = useCallback(
    (permission: string) => aggregated.permissions.includes(permission),
    [aggregated.permissions]
  );

  const hasRole = useCallback(
    (role: string) => aggregated.roles.includes(role),
    [aggregated.roles]
  );

  const setActiveBusiness = useCallback((businessId: string) => {
    setActiveBusinessId(businessId);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
          }
        : null,
      roles: aggregated.roles,
      permissions: aggregated.permissions,
      businesses: parsed.businesses,
      activeBusiness: activeBusinessId,
      isAuthenticated: !!session?.user,
      setActiveBusiness,
      hasPermission,
      hasRole,
    }),
    [session, aggregated, parsed.businesses, activeBusinessId, setActiveBusiness, hasPermission, hasRole]
  );

  if (isPending) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
