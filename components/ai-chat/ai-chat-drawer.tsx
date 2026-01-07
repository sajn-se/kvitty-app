"use client";

import { useState, useCallback, useEffect } from "react";
import { XIcon, Trash } from "@phosphor-icons/react";
import { ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import {
  InputGroup,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import { useWorkspace } from "@/components/workspace-provider";
import { useChatStorage } from "./use-chat-storage";

interface AIChatDrawerProps {
  onClose: () => void;
}

export function AIChatDrawer({ onClose }: AIChatDrawerProps) {
  const { workspace } = useWorkspace();
  const { messages, addMessage, clearMessages, updateLastMessage } =
    useChatStorage(workspace.id);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isStreaming) return;

      const userMessage = input.trim();
      setInput("");

      addMessage({ role: "user", content: userMessage });
      setIsStreaming(true);

      addMessage({ role: "assistant", content: "" });

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: userMessage },
            ],
            workspaceId: workspace.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          assistantContent += text;
          updateLastMessage(assistantContent);
        }
      } catch (error) {
        console.error("Chat error:", error);
        updateLastMessage("Något gick fel. Försök igen.");
      } finally {
        setIsStreaming(false);
      }
    },
    [input, isStreaming, messages, workspace.id, addMessage, updateLastMessage]
  );

  return (
    <div className="flex h-full flex-col">
      <DrawerHeader className="flex-row items-center justify-between border-b">
        <DrawerTitle>AI Assistent</DrawerTitle>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={clearMessages}
              title="Rensa konversation"
            >
              <Trash className="size-4" />
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <XIcon className="size-4" />
              <span className="sr-only">Stang</span>
            </Button>
          </DrawerClose>
        </div>
      </DrawerHeader>

      <Conversation>
        <ConversationContent>
          <Message from="assistant">
            <MessageContent>
              <MessageResponse>
                Hej! Jag kan hjalpa dig med bokforingen. Fraga mig om transaktioner, konton eller annat.
              </MessageResponse>
            </MessageContent>
          </Message>

          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                <MessageResponse>{message.content}</MessageResponse>
              </MessageContent>
            </Message>
          ))}

          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <Message from="assistant">
              <MessageContent>
                <Loader />
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <form onSubmit={handleSubmit} className="relative border-t p-4">
        <InputGroup>
          <InputGroupTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isStreaming && input.trim()) {
                  handleSubmit(e);
                }
              }
            }}
            placeholder="Stall en fraga..."
            disabled={isStreaming}
            rows={4}
            className="min-h-[100px]"
          />
        </InputGroup>
        <Button
          type="submit"
          variant="default"
          className="absolute bottom-6 right-6 rounded-full"
          size="icon-sm"
          disabled={isStreaming || !input.trim()}
        >
          <ArrowUpIcon />
          <span className="sr-only">Skicka</span>
        </Button>
      </form>
    </div>
  );
}
