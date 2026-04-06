"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogo, Receipt, Copy, Check } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { authClient, signIn } from "@/lib/auth-client";
import { isWebView, getWebViewSource } from "@/lib/utils/webview-detection";
import {
  getLoginMethodCookie,
  setLoginMethodCookie,
  type LoginMethod,
} from "@/lib/login-method-cookie";

type LoginFormProps = React.ComponentProps<"div"> & {
  showEmailLogin?: boolean;
};

export function LoginForm({
  className,
  showEmailLogin = true,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inWebView, setInWebView] = useState(false);
  const [webViewSource, setWebViewSource] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastUsedMethod, setLastUsedMethod] = useState<LoginMethod | null>(
    null
  );
  const isGoogleSSOEnabled = process.env.NEXT_PUBLIC_GOOGLE_SSO === "true";
  const registrationsEnabled = process.env.NEXT_PUBLIC_REGISTRATIONS_ENABLED === "true";

  useEffect(() => {
    setInWebView(isWebView());
    setWebViewSource(getWebViewSource());
    setLastUsedMethod(getLoginMethodCookie());
  }, []);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/app",
      });
      setLoginMethodCookie("google");
      setLastUsedMethod("google");
    } catch (err) {
      setError("Kunde inte logga in med Google. Försök igen.");
      console.error(err);
      setIsGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn.magicLink({
        email,
        callbackURL: "/app",
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      setLoginMethodCookie("email");
      setLastUsedMethod("email");
      router.push(`/magic-link-sent?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError("Kunde inte skicka inloggningslänk. Försök igen.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        onSubmit={showEmailLogin ? handleSubmit : (e) => e.preventDefault()}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <Receipt className="size-6" weight="duotone" />
              </div>
              <span className="sr-only">Kvitty</span>
            </a>
            <h1 className="text-xl font-bold">Logga in på Kvitty</h1>
            {registrationsEnabled && (
              <FieldDescription>
                Har du inget konto? <a href="/signup">Registrera dig</a>
              </FieldDescription>
            )}
          </div>
          {isGoogleSSOEnabled && (
            <>
              {inWebView && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-900 dark:bg-amber-950">
                  <p className="text-amber-800 dark:text-amber-200">
                    Google-inloggning fungerar inte här
                    {webViewSource && webViewSource !== "WebView"
                      ? ` (${webViewSource})`
                      : ""}
                    .{" "}
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100"
                    >
                      {copied ? "Kopierad!" : "Kopiera länk"}
                    </button>{" "}
                    och öppna i Chrome/Safari
                    {showEmailLogin ? ", eller använd e-post nedan." : "."}
                  </p>
                </div>
              )}
              <Field>
                <div className="relative w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading || inWebView}
                    className={cn(
                      "w-full",
                      lastUsedMethod === "google" &&
                        "border-blue-400/50 ring-1 ring-blue-400/10"
                    )}
                  >
                    {isGoogleLoading ? (
                      <Spinner />
                    ) : (
                      <GoogleLogo className="size-4" weight="bold" />
                    )}
                    Fortsätt med Google
                  </Button>
                  {lastUsedMethod === "google" && (
                    <Badge
                      variant="blue"
                      className="absolute -right-2 -top-2 text-[10px] bg-blue-100 dark:bg-blue-900/50"
                    >
                      Senast använd
                    </Badge>
                  )}
                </div>
              </Field>
              {showEmailLogin && (
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    eller
                  </span>
                </div>
              )}
            </>
          )}
          {showEmailLogin && (
            <>
              <Field>
                <div className="relative">
                  <FieldLabel htmlFor="email">E-post</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="din@epost.se"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={cn(
                      lastUsedMethod === "email" &&
                        "border-blue-400/50 ring-1 ring-blue-400/10"
                    )}
                  />
                  {lastUsedMethod === "email" && (
                    <Badge
                      variant="blue"
                      className="absolute -right-2 -top-2 text-[10px] bg-blue-100 dark:bg-blue-900/50"
                    >
                      Senast använd
                    </Badge>
                  )}
                </div>
              </Field>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : "Skicka inloggningslänk"}
                </Button>
              </Field>
            </>
          )}
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Genom att fortsätta godkänner du våra{" "}
        <a href="/terms">användarvillkor</a> och{" "}
        <a href="/privacy">integritetspolicy</a>.
      </FieldDescription>
    </div>
  );
}
