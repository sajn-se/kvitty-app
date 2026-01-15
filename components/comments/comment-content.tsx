"use client";

import { cn } from "@/lib/utils";

interface CommentContentProps {
  content: string;
  className?: string;
}

export function CommentContent({ content, className }: CommentContentProps) {
  // Parse content and split into text and mention parts
  const parts: Array<{
    type: "text" | "mention";
    content: string;
    email?: string;
  }> = [];

  const mentionRegex = /@\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex, match.index),
      });
    }

    // Add mention
    parts.push({
      type: "mention",
      content: match[0],
      email: match[1],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.substring(lastIndex),
    });
  }

  return (
    <p className={cn("whitespace-pre-wrap break-words", className)}>
      {parts.map((part, index) => {
        if (part.type === "mention") {
          return (
            <span
              key={index}
              className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-sm font-medium text-primary"
              title={part.email}
            >
              @{part.email}
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </p>
  );
}
