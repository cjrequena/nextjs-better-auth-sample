export type { BusinessContext, UserProfile } from "@/types/business";

const useMock = process.env.AUTH_SERVICE_MOCK === "true";

const mod = useMock
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? require("@/services/auth-service-mock")
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  : require("@/services/auth-service");

export const createUser: (userId: string, email: string) => Promise<void> = mod.createUser;
export const me: (userId: string) => Promise<import("@/types/business").UserProfile | null> = mod.me;
export const checkPermission: (userId: string, permission: string, businessId?: string) => Promise<boolean> = mod.checkPermission;
