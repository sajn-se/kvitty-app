"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogo, Receipt } from "@phosphor-icons/react";

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
import { authClient, signIn } from "@/lib/auth-client";

const isGoogleSSOEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_SSO_ENABLED === "true";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/app",
      });
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
      <form onSubmit={handleSubmit}>
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
            <FieldDescription>
              Har du inget konto? <a href="/signup">Registrera dig</a>
            </FieldDescription>
          </div>
          {isGoogleSSOEnabled && (
            <>
              <Field>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? (
                    <Spinner />
                  ) : (
                    <GoogleLogo className="size-4" weight="bold" />
                  )}
                  Fortsätt med Google
                </Button>
              </Field>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  eller
                </span>
              </div>
            </>
          )}
          <Field>
            <FieldLabel htmlFor="email">E-post</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="din@epost.se"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </Field>
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : "Skicka inloggningslänk"}
            </Button>
          </Field>
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
