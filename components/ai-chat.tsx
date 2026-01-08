"use client";

import { useState, useRef, useEffect } from "react";
import { PaperPlaneRight, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface JournalLine {
  accountNumber: number;
  accountName: string;
  debit: number;
  credit: number;
}

interface Suggestion {
  description: string;
  lines: JournalLine[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestion?: Suggestion;
}

interface AIChatProps {
  onSuggestion?: (suggestion: Suggestion) => void;
  context?: Record<string, unknown>;
  className?: string;
}

export function AIChat({ onSuggestion, context, className }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/bookkeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          suggestion: data.suggestion,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Något gick fel. Försök igen." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    if (!value) return "-";
    return `${value.toLocaleString("sv-SE")} kr`;
  };

  return (
    <div className={cn("flex flex-col h-full relative", className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-0">
        {messages.length === 0 ? (
          <div className="flex gap-3">
            <div className="rounded-lg px-3 py-2 text-sm max-w-[85%]">
              Hej! Jag kan hjälpa dig att bokföra. Prova t.ex. &quot;Bokför en dator för 22500kr&quot;
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="space-y-3">
              {/* Message bubble */}
              <div className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm max-w-[85%]",
                    message.role === "user" ? "bg-primary text-primary-foreground" : ""
                  )}
                >
                  {message.content}
                </div>
              </div>

              {/* Suggestion card */}
              {message.suggestion && (
                <div className={message.role === "user" ? "mr-0" : "ml-0"}>
                  <SuggestionCard
                    suggestion={message.suggestion}
                    onUse={onSuggestion ? () => onSuggestion(message.suggestion!) : undefined}
                  />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="rounded-lg px-3 py-2">
              <Spinner className="size-4" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="px-4 mt-auto relative">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none -translate-y-full" />
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && input.trim()) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }
            }}
            placeholder="Beskriv transaktionen..."
            disabled={isLoading}
            className="w-full resize-none pr-12 max-h-32"
            rows={2}
          />
          <Button
            type="submit"
            size="icon-sm"
            disabled={isLoading || !input.trim()}
            className="absolute bottom-2 right-2"
          >
            <PaperPlaneRight className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  onUse,
}: {
  suggestion: Suggestion;
  onUse?: () => void;
}) {
  const totalDebit = suggestion.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = suggestion.lines.reduce((sum, l) => sum + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const formatCurrency = (value: number) => {
    if (!value) return "-";
    return `${value.toLocaleString("sv-SE")} kr`;
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{suggestion.description}</span>
        {isBalanced && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Check className="size-3" weight="bold" />
            Balanserat
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_80px_80px] gap-2 text-xs text-muted-foreground font-medium">
          <span>Konto</span>
          <span className="text-right">Debet</span>
          <span className="text-right">Kredit</span>
        </div>
        {suggestion.lines.map((line, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_80px] gap-2 text-sm py-1 border-t">
            <span className="truncate">
              <span className="font-mono text-xs text-muted-foreground mr-1">
                {line.accountNumber}
              </span>
              {line.accountName}
            </span>
            <span className="text-right font-mono text-xs">{formatCurrency(line.debit)}</span>
            <span className="text-right font-mono text-xs">{formatCurrency(line.credit)}</span>
          </div>
        ))}
        <div className="grid grid-cols-[1fr_80px_80px] gap-2 text-sm py-1 border-t font-medium">
          <span>Summa</span>
          <span className="text-right font-mono text-xs">{formatCurrency(totalDebit)}</span>
          <span className="text-right font-mono text-xs">{formatCurrency(totalCredit)}</span>
        </div>
      </div>

      {onUse && (
        <Button size="sm" className="w-full" onClick={onUse}>
          <Check className="size-4 mr-2" />
          Använd förslag
        </Button>
      )}
    </div>
  );
}
