import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, emailOTP } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";

// TODO: Enable email sending when domain is verified
// import { mailer } from "./email/mailer";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: false, // Magic link only
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session daily
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Transform URL to user-friendly path
        const friendlyUrl = url.replace('/api/auth/magic-link/verify', '/login/verify');

        // TODO: Enable when domain is verified
        // await mailer.sendMail({
        //   from: process.env.EMAIL_FROM || "noreply@kvitty.app",
        //   to: email,
        //   subject: "Logga in på Kvitty",
        //   text: `Klicka på länken för att logga in: ${friendlyUrl}`,
        //   html: `<p>Klicka på länken för att logga in:</p><p><a href="${friendlyUrl}">${friendlyUrl}</a></p>`,
        // });

        // Dev mode: Log to console
        console.log("\n========================================");
        console.log("🔗 MAGIC LINK LOGIN");
        console.log("========================================");
        console.log(`📧 Email: ${email}`);
        console.log(`🔗 URL: ${friendlyUrl}`);
        console.log("========================================\n");
      },
      expiresIn: 60 * 10, // 10 minutes
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log("sendVerificationOTP called!");
        // TODO: Enable when domain is verified
        // const subjects: Record<string, string> = {
        //   "email-verification": "Bekräfta din e-post - Kvitty",
        //   "sign-in": "Din inloggningskod - Kvitty",
        //   "forget-password": "Återställ lösenord - Kvitty",
        // };
        // const subject = subjects[type] || "Din verifieringskod - Kvitty";
        // await mailer.sendMail({
        //   from: process.env.EMAIL_FROM || "noreply@kvitty.app",
        //   to: email,
        //   subject,
        //   text: `Din verifieringskod är: ${otp}`,
        //   html: `<p>Din verifieringskod är: <strong>${otp}</strong></p>`,
        // });

        // Dev mode: Log to console
        console.log("\n========================================");
        console.log("🔑 EMAIL OTP CODE");
        console.log("========================================");
        console.log(`📧 Email: ${email}`);
        console.log(`🔢 OTP: ${otp}`);
        console.log(`📝 Type: ${type}`);
        console.log("========================================\n");
      },
      otpLength: 6,
      expiresIn: 60 * 10, // 10 minutes
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
