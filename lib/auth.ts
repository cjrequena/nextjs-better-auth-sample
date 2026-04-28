import {betterAuth, Session, User} from "better-auth";
import {createAuthMiddleware} from "better-auth/api";
import {jwt} from "better-auth/plugins";
import {Pool} from "pg";
import {Resend} from "resend";
import type {BusinessContext, UserProfile} from "@/types/business";
import {createUser, me} from "@/services";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({user, url}: { user: { email: string }; url: string }) => {
            console.log("[AUTH] sendResetPassword called for:", user.email);
            const {data, error} = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL!,
                to: user.email,
                subject: "Reset your password",
                html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 1 hour.</p>`,
            });
            if (error) console.error("[AUTH] Resend reset error:", error);
            else console.log("[AUTH] Reset email sent:", data);
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({user, url}: { user: { email: string }; url: string }) => {
            console.log("[AUTH] sendVerificationEmail called for:", user.email);
            const {data, error} = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL!,
                to: user.email,
                subject: "Verify your email address",
                html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
            });
            if (error) console.error("[AUTH] Resend verification error:", error);
            else console.log("[AUTH] Verification email sent:", data);
        },
        sendOnSignUp: true,
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
                    try {
                        await createUser(user.id, user.email);
                    } catch (err) {
                        console.error("[AUTH] createUser hook failed (non-fatal):", err);
                    }
                },
            },
        },
    },
    session: {
        additionalFields: {
            roles: {type: "string", defaultValue: "[]"},
            permissions: {type: "string", defaultValue: "[]"},
            businesses: {type: "string", defaultValue: "[]"},
            activeBusiness: {type: "string", defaultValue: ""},
        },
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            if (ctx.path !== "/sign-in/email" && ctx.path !== "/sign-up/email" && ctx.path !== "/verify-email") return;

            const returned = (ctx.context as unknown as {
                returned?: { token?: string; user?: { id: string } }
            })?.returned;

            const session = ctx.context?.session;
            const token = returned?.token ?? session?.session?.token;
            const userId = returned?.user?.id ?? session?.user?.id;
            if (!token || !userId) return;

            const profile: UserProfile | null = await me(userId);

            if (!profile) return;

            const businesses: BusinessContext[] = profile.businesses ?? [];
            const activeBusinessId = businesses.length > 0 ? businesses[0].business_id : "";

            // Store platform-only roles/permissions — aggregation with the active
            // business is done downstream (AuthProvider for UI, auth-service for enforcement).
            const roles: string[] = profile.roles ?? [];
            const permissions: string[] = profile.permissions ?? [];

            await ctx.context.internalAdapter.updateSession(token, {
                roles: JSON.stringify(roles),
                permissions: JSON.stringify(permissions),
                businesses: JSON.stringify(businesses),
                activeBusiness: activeBusinessId,
            });
        }),
    },
    plugins: [
        jwt({
            jwt: {
                expirationTime: "1h",
                definePayload: (userCtx: { user: User & Record<string, unknown>; session: Session & Record<string, unknown> }) => {
                    const session = userCtx.session as unknown as Record<string, string>;
                    return {
                        sub: userCtx.user.id,
                        "custom:roles": JSON.parse(session.roles ?? "[]"),
                        "custom:permissions": JSON.parse(session.permissions ?? "[]"),
                        "custom:businesses": JSON.parse(session.businesses ?? "[]"),
                    };
                },
            },
        }),
    ],
});
