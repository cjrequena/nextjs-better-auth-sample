"use client";

import { useAuth } from "@/lib/auth-provider";
import type { ReactNode } from "react";

interface RequirePermissionProps {
  permission: string | string[];
  operator?: "every" | "some";
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Renders children only if the current user has the specified permission(s).
 * UX convenience only — not a security boundary.
 *
 * @example Single permission
 * <RequirePermission permission="appointments:read">...</RequirePermission>
 *
 * @example All required (default)
 * <RequirePermission permission={["appointments:read", "appointments:write"]}>...</RequirePermission>
 *
 * @example Any one suffices
 * <RequirePermission permission={["billing:read", "billing:manage"]} operator="some">...</RequirePermission>
 */
export function RequirePermission({
  permission,
  operator = "every",
  fallback = null,
  children,
}: RequirePermissionProps) {
  const { hasPermission } = useAuth();
  const perms = Array.isArray(permission) ? permission : [permission];
  const granted = operator === "every"
    ? perms.every(hasPermission)
    : perms.some(hasPermission);
  return granted ? <>{children}</> : <>{fallback}</>;
}
