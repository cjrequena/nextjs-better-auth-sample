export type { BusinessContext, UserProfile } from "@/types/business";
import type { UserProfile } from "@/types/business";

const users = new Map<string, UserProfile>();

export async function createUser(userId: string, email: string) {
  console.log("[AUTH-SERVICE-MOCK] createUser:", userId, email);
  users.set(userId, {
    user_id: userId,
    email,
    roles: ["customer"],
    permissions: ["read:profile", "update:profile"],
    businesses: [],
  });
}

export async function me(userId: string): Promise<UserProfile | null> {
  console.log("[AUTH-SERVICE-MOCK] me:", userId);
  return users.get(userId) ?? null;
}

export async function checkPermission(
  userId: string,
  permission: string,
  businessId?: string
): Promise<boolean> {
  console.log("[AUTH-SERVICE-MOCK] checkPermission:", userId, permission, businessId);
  const user = users.get(userId);
  if (!user) return false;

  if (user.permissions.includes(permission)) return true;

  if (businessId) {
    const biz = user.businesses?.find((b) => b.business_id === businessId);
    return biz?.permissions.includes(permission) ?? false;
  }

  return false;
}
