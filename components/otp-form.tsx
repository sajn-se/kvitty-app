"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Receipt } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";

  const [otp, setOtp] = useState("");
  const updateProfile = trpc.users.updateProfile.useMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await authClient.signIn.emailOtp({
        email,
        otp,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      // Update user's name if provided during signup
      if (name) {
        await updateProfile.mutateAsync({ name });
      }

      router.push("/");
    } catch (err) {
      setError("Ogiltig verifieringskod. Försök igen.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    setError(null);

    try {
      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (otpError) {
        throw new Error(otpError.message);
      }
    } catch (err) {
      setError("Kunde inte skicka ny kod. Försök igen.");
      console.error(err);
    } finally {
      setIsResending(false);
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
            <h1 className="text-xl font-bold">Ange verifieringskod</h1>
            <FieldDescription>
              Vi skickade en 6-siffrig kod till {email}
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="otp" className="sr-only">
              Verifieringskod
            </FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              required
              containerClassName="gap-4"
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
            >
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription className="text-center">
              Fick du ingen kod?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="underline inline-flex items-center gap-1"
              >
                {isResending ? <Spinner /> : "Skicka igen"}
              </button>
            </FieldDescription>
          </Field>
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <Field>
            <Button type="submit" disabled={isLoading || otp.length !== 6}>
              {isLoading ? <Spinner /> : "Verifiera"}
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
