/**
 * Crawlers explicitly welcomed in robots.txt. Search engines are covered by `*`;
 * AI agents are listed by name so the intent is unambiguous.
 */
export const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "DuckAssistBot",
];

/** Paths no crawler needs. */
export const disallow: string[] = [];
