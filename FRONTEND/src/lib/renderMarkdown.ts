/**
 * Lightweight markdown-to-JSX renderer for AI assistant messages.
 * Handles: bold, italic, unordered/ordered lists, headings, line breaks.
 * Escapes HTML first to prevent XSS from AI-generated content.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert inline markdown (bold, italic, code) to HTML */
function inline(text: string): string {
  // Bold **text**
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic *text* (but not inside bold markers we just created)
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  // Inline code `text`
  text = text.replace(/`(.+?)`/g, "<code>$1</code>");
  return text;
}

/**
 * Parse a markdown string into safe HTML.
 * Returns an HTML string safe for use with dangerouslySetInnerHTML
 * (all user/AI content is HTML-escaped first).
 */
export function renderMarkdown(raw: string): string {
  if (!raw) return "";

  const lines = raw.split("\n");
  const output: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;

  const closeLists = () => {
    if (inUnorderedList) {
      output.push("</ul>");
      inUnorderedList = false;
    }
    if (inOrderedList) {
      output.push("</ol>");
      inOrderedList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trimEnd();

    // Empty line — close any open list and add spacing
    if (trimmed === "") {
      closeLists();
      output.push("");
      continue;
    }

    // Heading ### text
    const headingMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      closeLists();
      const level = trimmed.match(/^(#{1,3})/)?.[1].length || 1;
      const tag = `h${level}`;
      output.push(`<${tag}>${inline(escapeHtml(headingMatch[1]))}</${tag}>`);
      continue;
    }

    // Unordered list: - item or * item
    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (!inUnorderedList) {
        closeLists();
        output.push("<ul>");
        inUnorderedList = true;
      }
      output.push(`  <li>${inline(escapeHtml(ulMatch[1]))}</li>`);
      continue;
    }

    // Ordered list: 1. item
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inOrderedList) {
        closeLists();
        output.push("<ol>");
        inOrderedList = true;
      }
      output.push(`  <li>${inline(escapeHtml(olMatch[1]))}</li>`);
      continue;
    }

    // Regular paragraph line
    closeLists();
    output.push(`<p>${inline(escapeHtml(trimmed))}</p>`);
  }

  closeLists();
  return output.join("\n");
}
