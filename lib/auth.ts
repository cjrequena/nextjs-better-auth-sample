import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { registerUser, fetchUserProfile } from "@/services/auth-service";

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
          await registerUser(user.id, user.email);
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
