import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, emailOTP } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";
import { mailer } from "./email/mailer";

const isGoogleSSOEnabled = process.env.GOOGLE_SSO_ENABLED === "true";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: false, // Magic link only
  },
  socialProviders: isGoogleSSOEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          prompt: "select_account",
        },
      }
    : {},
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session daily
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await mailer.sendMail({
          from: process.env.EMAIL_FROM || "noreply@kvitty.se",
          to: email,
          subject: "Logga in på Kvitty",
          text: `Klicka på länken för att logga in: ${url}`,
          html: `<p>Klicka på länken för att logga in:</p><p><a href="${url}">${url}</a></p>`,
        });
      },
      expiresIn: 60 * 10, // 10 minutes
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subjects: Record<string, string> = {
          "email-verification": "Bekräfta din e-post - Kvitty",
          "sign-in": "Din inloggningskod - Kvitty",
          "forget-password": "Återställ lösenord - Kvitty",
        };
        const subject = subjects[type] || "Din verifieringskod - Kvitty";
        await mailer.sendMail({
          from: process.env.EMAIL_FROM || "noreply@kvitty.se",
          to: email,
          subject,
          text: `Din verifieringskod är: ${otp}`,
          html: `<p>Din verifieringskod är: <strong>${otp}</strong></p>`,
        });
      },
      otpLength: 6,
      expiresIn: 60 * 10, // 10 minutes
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
