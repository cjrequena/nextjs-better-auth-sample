import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? "http://localhost:8080";
const AUTH_SERVICE_VERSION = process.env.AUTH_SERVICE_API_VERSION ?? "application/vnd.auth-service.v1";

async function registerUserInAuthService(userId: string, email: string) {
  const headers = {
    "Content-Type": "application/json",
    "Accept-Version": AUTH_SERVICE_VERSION,
  };

  const createRes = await fetch(`${AUTH_SERVICE_URL}/api/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: userId, email }),
  });
  if (!createRes.ok && createRes.status !== 409) {
    console.error("[AUTH-SERVICE] Failed to create user:", await createRes.text());
  }
}

async function fetchUserProfile(userId: string) {
  const res = await fetch(
    `${AUTH_SERVICE_URL}/api/users/me?user_id=${userId}`,
    { headers: { "Accept-Version": AUTH_SERVICE_VERSION } }
  );
  if (!res.ok) return null;
  return res.json();
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          console.log("[AUTH-SERVICE] databaseHook user.create.after fired for:", user.id, user.email);
          await registerUserInAuthService(user.id, user.email);
        },
      },
    },
  },
  session: {
    additionalFields: {
      platformRoles: { type: "string", defaultValue: "[]" },
      platformPermissions: { type: "string", defaultValue: "[]" },
      businesses: { type: "string", defaultValue: "[]" },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email" && ctx.path !== "/sign-up/email" && ctx.path !== "/verify-email") return;

      const returned = (ctx.context as unknown as { returned?: { token?: string; user?: { id: string } } })?.returned;
      const session = ctx.context?.session;
      const token = returned?.token ?? session?.session?.token;
      const userId = returned?.user?.id ?? session?.user?.id;
      if (!token || !userId) return;

      const profile = await fetchUserProfile(userId);
      if (!profile) return;

      await ctx.context.internalAdapter.updateSession(token, {
        platformRoles: JSON.stringify(profile.platform_roles ?? []),
        platformPermissions: JSON.stringify(profile.platform_permissions ?? []),
        businesses: JSON.stringify(profile.businesses ?? []),
      });
    }),
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "1h",
        definePayload: (session) => ({
          sub: session.user.id,
          "custom:platform_roles": JSON.parse((session as unknown as Record<string, string>).platformRoles ?? "[]"),
          "custom:platform_permissions": JSON.parse((session as unknown as Record<string, string>).platformPermissions ?? "[]"),
          "custom:businesses": JSON.parse((session as unknown as Record<string, string>).businesses ?? "[]"),
        }),
      },
    }),
  ],
});
