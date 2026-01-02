"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  const {
    data: invite,
    isLoading,
    error,
  } = trpc.invites.getByToken.useQuery(
    { token },
    { enabled: !!token && !!session }
  );

  const acceptInvite = trpc.invites.accept.useMutation({
    onSuccess: (data) => {
      router.push(`/${data.workspaceSlug}`);
    },
  });

  // Check for email mismatch
  const emailMismatch =
    session &&
    invite &&
    session.user.email?.toLowerCase() !== invite.email.toLowerCase();

  async function handleAccept() {
    if (!session) {
      router.push(`/login?callbackUrl=/invite/${token}`);
      return;
    }
    acceptInvite.mutate({ token });
  }

  if (isLoading || isSessionLoading || !token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
        <Spinner />
      </div>
    );
  }

  if (error || acceptInvite.error) {
    const errorMessage = error?.message || acceptInvite.error?.message;
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <Receipt className="size-8" weight="duotone" />
          <h1 className="text-xl font-bold">Ogiltig inbjudan</h1>
          <p className="text-muted-foreground text-sm">{errorMessage}</p>
          <Button variant="outline" onClick={() => router.push("/")}>
            Gå till startsidan
          </Button>
        </div>
      </div>
    );
  }

  // Email mismatch warning
  if (emailMismatch) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <Warning className="size-8 text-amber-500" weight="duotone" />
          <h1 className="text-xl font-bold">Fel e-postadress</h1>
          <p className="text-muted-foreground text-sm">
            Denna inbjudan är avsedd för <strong>{invite.email}</strong>.
          </p>
          <p className="text-muted-foreground text-sm">
            Du är inloggad som <strong>{session.user.email}</strong>.
          </p>
          <div className="flex flex-col gap-2 w-full mt-4">
            <Button
              variant="outline"
              onClick={() => {
                router.push(`/login?callbackUrl=/invite/${token}`);
              }}
            >
              Logga in med rätt konto
            </Button>
            <Button variant="ghost" onClick={() => router.push("/")}>
              Gå till startsidan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <Receipt className="size-8" weight="duotone" />
        <h1 className="text-xl font-bold">Du är inbjuden</h1>
        <p className="text-muted-foreground text-sm">
          Du har blivit inbjuden att gå med i arbetsytan{" "}
          <span className="font-medium">{invite?.workspace.name}</span>
        </p>
        <p className="text-muted-foreground text-xs">
          Inbjudan skickades till {invite?.email}
        </p>
        <Button onClick={handleAccept} disabled={acceptInvite.isPending}>
          {acceptInvite.isPending ? (
            <Spinner />
          ) : session ? (
            "Acceptera inbjudan"
          ) : (
            "Logga in för att acceptera"
          )}
        </Button>
      </div>
    </div>
  );
}
