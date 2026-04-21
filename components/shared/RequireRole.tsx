"use client";

import { useAuth } from "@/lib/auth-provider";
import type { ReactNode } from "react";

interface RequireRoleProps {
  role: string | string[];
  operator?: "every" | "some";
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Renders children only if the current user has the specified role(s).
 * UX convenience only — not a security boundary.
 *
 * @example Single role
 * <RequireRole role="CLINIC_OWNER">...</RequireRole>
 *
 * @example Any one suffices
 * <RequireRole role={["CLINIC_OWNER", "PLATFORM_ADMIN"]} operator="some">...</RequireRole>
 *
 * @example All required (default)
 * <RequireRole role={["PRACTITIONER", "STAFF"]}>...</RequireRole>
 */
export function RequireRole({
  role,
  operator = "every",
  fallback = null,
  children,
}: RequireRoleProps) {
  const { hasRole } = useAuth();
  const roles = Array.isArray(role) ? role : [role];
  const granted = operator === "every"
    ? roles.every(hasRole)
    : roles.some(hasRole);
  return granted ? <>{children}</> : <>{fallback}</>;
}
