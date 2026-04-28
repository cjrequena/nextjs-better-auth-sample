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
 * <HasPermission permission="appointments:read">...</HasPermission>
 *
 * @example All required (default)
 * <HasPermission permission={["appointments:read", "appointments:write"]}>...</HasPermission>
 *
 * @example Any one suffices
 * <HasPermission permission={["billing:read", "billing:manage"]} operator="some">...</HasPermission>
 */
export function HasPermission({
  permission,
  operator = "every",
  fallback = null,
  children,
}: RequirePermissionProps) {
  const { hasPermission } = useAuth();
  const perms = Array.isArray(permission) ? permission : [permission];
  const granted = operator === "every"
    ? perms.every((element) => hasPermission(element))
    : perms.some((element) => hasPermission(element));
  return granted ? <>{children}</> : <>{fallback}</>;
}
