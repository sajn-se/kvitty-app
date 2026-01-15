"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Key, Copy, Check, Trash, Plus, Eye, EyeClosed } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

export function ApiKeysSettings() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [createdKeyWorkspace, setCreatedKeyWorkspace] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: apiKeys, isLoading } = trpc.apiKeys.listMyKeys.useQuery();
  const { data: workspaces } = trpc.apiKeys.getAvailableWorkspaces.useQuery();

  const createMutation = trpc.apiKeys.createForWorkspace.useMutation({
    onSuccess: (data) => {
      setCreatedKey(data.key);
      setCreatedKeyWorkspace(data.workspace?.name ?? null);
      setNewKeyName("");
      setSelectedWorkspaceId("");
      utils.apiKeys.listMyKeys.invalidate();
    },
  });

  const revokeMutation = trpc.apiKeys.revokeMyKey.useMutation({
    onSuccess: () => {
      setRevokeId(null);
      utils.apiKeys.listMyKeys.invalidate();
    },
  });

  const handleCreate = () => {
    if (!newKeyName.trim() || !selectedWorkspaceId) return;
    createMutation.mutate({
      workspaceId: selectedWorkspaceId,
      name: newKeyName.trim(),
    });
  };

  const handleCopy = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setCreatedKey(null);
    setCreatedKeyWorkspace(null);
    setNewKeyName("");
    setSelectedWorkspaceId("");
    setShowKey(false);
    setCopied(false);
  };

  const keyToRevoke = apiKeys?.find((k) => k.id === revokeId);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API-nycklar
          </CardTitle>
          <CardDescription>
            Hantera API-nycklar för att komma åt Kvitty API:et programmatiskt.
            Dokumentation finns på <code className="text-xs bg-muted px-1 py-0.5 rounded">/api/v1/docs</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{key.name}</span>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {key.keyPrefix}...
                      </code>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">{key.workspace?.name}</span>
                      {" · "}
                      Skapad{" "}
                      {formatDistanceToNow(new Date(key.createdAt), {
                        addSuffix: true,
                        locale: sv,
                      })}
                      {key.lastUsedAt && (
                        <>
                          {" "}· Senast använd{" "}
                          {formatDistanceToNow(new Date(key.lastUsedAt), {
                            addSuffix: true,
                            locale: sv,
                          })}
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevokeId(key.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Inga API-nycklar ännu</p>
              <p className="text-sm">Skapa en nyckel för att komma igång</p>
            </div>
          )}

          <div className="mt-4">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              disabled={!workspaces || workspaces.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Skapa ny API-nyckel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {createdKey ? "API-nyckel skapad" : "Skapa ny API-nyckel"}
            </DialogTitle>
            <DialogDescription>
              {createdKey
                ? "Kopiera din API-nyckel nu. Den visas bara en gång!"
                : "Välj arbetsyta och ge din API-nyckel ett beskrivande namn."}
            </DialogDescription>
          </DialogHeader>

          {createdKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">
                  Viktigt: Kopiera nyckeln nu!
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Av säkerhetsskäl kan vi inte visa nyckeln igen. Om du tappar
                  bort den måste du skapa en ny.
                </p>
              </div>

              {createdKeyWorkspace && (
                <p className="text-sm text-muted-foreground">
                  Nyckel för arbetsyta: <strong>{createdKeyWorkspace}</strong>
                </p>
              )}

              <Field>
                <FieldLabel>Din API-nyckel</FieldLabel>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={showKey ? createdKey : "•".repeat(createdKey.length)}
                      readOnly
                      className="font-mono text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? (
                        <EyeClosed className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button onClick={handleCopy} variant="outline">
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <FieldDescription>
                  Använd denna nyckel i Authorization header:{" "}
                  <code className="text-xs">Bearer {"{nyckel}"}</code>
                </FieldDescription>
              </Field>
            </div>
          ) : (
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="workspace">Arbetsyta</FieldLabel>
                <Select
                  value={selectedWorkspaceId}
                  onValueChange={setSelectedWorkspaceId}
                >
                  <SelectTrigger id="workspace">
                    <SelectValue placeholder="Välj arbetsyta" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces?.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  API-nyckeln ger tillgång till data i vald arbetsyta
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="keyName">Namn</FieldLabel>
                <Input
                  id="keyName"
                  placeholder="T.ex. Integration med bokföringssystem"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                />
                <FieldDescription>
                  Ett beskrivande namn för att identifiera nyckeln
                </FieldDescription>
              </Field>
            </div>
          )}

          <DialogFooter>
            {createdKey ? (
              <Button onClick={handleCloseCreateDialog}>Klar</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCloseCreateDialog}>
                  Avbryt
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newKeyName.trim() || !selectedWorkspaceId || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    "Skapa"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Återkalla API-nyckel?</AlertDialogTitle>
            <AlertDialogDescription>
              {keyToRevoke && (
                <>
                  Är du säker på att du vill återkalla nyckeln{" "}
                  <strong>{keyToRevoke.name}</strong> för arbetsytan{" "}
                  <strong>{keyToRevoke.workspace?.name}</strong>? Detta kan inte
                  ångras och alla integrationer som använder denna nyckel kommer
                  sluta fungera.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (revokeId) {
                  revokeMutation.mutate({ id: revokeId });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                "Återkalla"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
