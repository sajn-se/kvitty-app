export interface MentionData {
  email: string;
}

/**
 * Parses mention format: @[email]
 */
export function parseMentions(content: string): MentionData[] {
  const mentionRegex = /@\[([^\]]+)\]/g;
  const mentions: MentionData[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      email: match[1],
    });
  }

  return mentions;
}

/**
 * Extracts just the emails from content
 */
export function extractMentionedEmails(content: string): string[] {
  return parseMentions(content).map((m) => m.email);
}

/**
 * Creates a mention string
 */
export function createMentionString(email: string): string {
  return `@[${email}]`;
}

/**
 * Checks if content has mentions
 */
export function hasMentions(content: string): boolean {
  return /@\[[^\]]+\]/.test(content);
}
