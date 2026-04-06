import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Logga in — Kvitty",
};

export default function LoginPage() {
  const showEmailLogin =
    process.env.USESEND_ENABLED?.toLowerCase() !== "false";

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm showEmailLogin={showEmailLogin} />
      </div>
    </div>
  );
}
