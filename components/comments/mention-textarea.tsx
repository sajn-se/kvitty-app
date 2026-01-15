"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MentionTextareaProps {
  workspaceId: string;
  value: string;
  onChange: (value: string) => void;
  onMentionsChange?: (mentions: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface Member {
  id: string;
  userId: string;
  name: string | null;
  email: string;
}

export function MentionTextarea({
  workspaceId,
  value,
  onChange,
  onMentionsChange,
  placeholder = "Skriv en kommentar...",
  className,
  disabled = false,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Fetch workspace members
  const { data: members = [] } = trpc.members.list.useQuery({ workspaceId });

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!mentionSearch) return members;

    const search = mentionSearch.toLowerCase();
    return members.filter((member) => {
      const name = member.name?.toLowerCase() || "";
      const email = member.email.toLowerCase();
      const [firstName = "", lastName = ""] = name.split(" ");

      return (
        name.includes(search) ||
        firstName.includes(search) ||
        lastName.includes(search) ||
        email.includes(search)
      );
    });
  }, [members, mentionSearch]);

  // Detect @ trigger
  const detectMentionTrigger = (text: string, position: number): boolean => {
    if (position === 0) return false;

    const textBeforeCursor = text.substring(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) return false;

    // Check if @ is at start or preceded by whitespace
    const charBeforeAt = textBeforeCursor[lastAtIndex - 1];
    if (lastAtIndex > 0 && charBeforeAt !== " " && charBeforeAt !== "\n") {
      return false;
    }

    // Check if there's already a closing bracket after @
    const textAfterAt = textBeforeCursor.substring(lastAtIndex);
    if (textAfterAt.includes("]")) return false;

    // Extract search term
    const searchTerm = textBeforeCursor.substring(lastAtIndex + 1);
    if (searchTerm.includes(" ") || searchTerm.includes("\n")) {
      return false;
    }

    setMentionSearch(searchTerm);
    return true;
  };

  // Handle text change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart || 0;

    onChange(newValue);
    setCursorPosition(newPosition);

    // Check for @ trigger
    const shouldShow = detectMentionTrigger(newValue, newPosition);
    setShowDropdown(shouldShow);

    if (shouldShow) {
      setSelectedIndex(0);
    }

    // Extract mentioned userIds for parent component
    if (onMentionsChange) {
      const mentionRegex = /@\[([^\]]+)\]/g;
      const emails: string[] = [];
      let match;
      while ((match = mentionRegex.exec(newValue)) !== null) {
        emails.push(match[1]);
      }

      // Map emails to userIds
      const userIds = emails
        .map((email) => members.find((m) => m.email === email)?.userId)
        .filter((id): id is string => !!id);

      onMentionsChange(userIds);
    }
  };

  // Insert mention
  const insertMention = (member: Member) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);

    // Find the @ position
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtIndex === -1) return;

    const mentionString = `@[${member.email}]`;

    const newValue =
      value.substring(0, lastAtIndex) + mentionString + " " + textAfterCursor;

    onChange(newValue);
    setShowDropdown(false);
    setMentionSearch("");

    // Move cursor after mention
    const newCursorPos = lastAtIndex + mentionString.length + 1;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown || filteredMembers.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredMembers[selectedIndex]) {
          insertMention(filteredMembers[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setMentionSearch("");
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !textareaRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[0]?.children[
        selectedIndex
      ] as HTMLElement;
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, showDropdown]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />

      {showDropdown && filteredMembers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-64 rounded-lg border bg-popover shadow-lg"
          style={{
            bottom: "100%",
            marginBottom: "4px",
          }}
        >
          <div className="max-h-48 overflow-y-auto p-1">
            {filteredMembers.map((member, index) => (
              <button
                key={member.userId}
                type="button"
                onClick={() => insertMention(member)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {(member.name || member.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="truncate font-medium">
                    {member.name || member.email}
                  </div>
                  {member.name && (
                    <div className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
