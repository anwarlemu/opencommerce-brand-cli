// Inline code as the brand sets a tag: the pale blue, 2px corners, blue text in the platform mono, kept whole across a
// line break.
export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="rounded-chip bg-blue-5 px-1.5 py-0.5 font-mono text-[0.875em] text-fg-brand [box-decoration-break:clone] [overflow-wrap:anywhere]">{children}</code>;
}

// Docs text from the registry's frontmatter: `backticked` names become inline code.
export function Prose({ text }: { text: string }) {
  return <>{Array.from(text.matchAll(/`([^`]+)`|([^`]+|`)/g), (match) => (match[1] !== undefined ? <InlineCode key={match.index}>{match[1]}</InlineCode> : match[0]))}</>;
}
