"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "@phosphor-icons/react";

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
import { authClient } from "@/lib/auth-client";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (otpError) {
        throw new Error(otpError.message);
      }

      router.push(
        `/otp?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
      );
    } catch (err) {
      setError("Kunde inte skicka verifieringskod. Försök igen.");
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
            <h1 className="text-xl font-bold">Skapa konto på Kvitty</h1>
            <FieldDescription>
              Har du redan ett konto? <a href="/login">Logga in</a>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Namn</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="Ditt namn"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </Field>
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
              {isLoading ? <Spinner /> : "Skapa konto"}
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
