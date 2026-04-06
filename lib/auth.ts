import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log("[EMAIL] Sending verification to:", user.email);
      console.log("[EMAIL] Verification URL:", url);
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "ClinicHub <onboarding@resend.dev>",
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Hi ${user.name},</p><p>Click the link below to verify your email:</p><p><a href="${url}">Verify Email</a></p>`,
      });
      if (error) console.error("[EMAIL] Resend error:", error);
      else console.log("[EMAIL] Sent successfully, id:", data?.id);
    },
  },
});
