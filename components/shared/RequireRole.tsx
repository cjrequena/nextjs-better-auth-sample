"use client";

import { useAuth } from "@/lib/auth-provider";
import type { ReactNode } from "react";

interface RequireRoleProps {
  role: string;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Renders children only if the current user has the specified role.
 * UX convenience only — not a security boundary.
 */
export function RequireRole({
  role,
  fallback = null,
  children,
}: RequireRoleProps) {
  const { hasRole } = useAuth();
  return hasRole(role) ? <>{children}</> : <>{fallback}</>;
}
