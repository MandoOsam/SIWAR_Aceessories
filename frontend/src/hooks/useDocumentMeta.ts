import { useEffect } from "react";

/**
 * Minimal per-page SEO (D-040): sets `document.title` and the description meta tag while the page is
 * mounted, restoring the previous values on unmount. The full head/OG pass lands in F7.
 */
export function useDocumentMeta(title: string, description: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const existing = document.querySelector('meta[name="description"]');
    const previousDescription = existing?.getAttribute("content") ?? "";
    let created: HTMLMetaElement | null = null;

    if (existing === null) {
      created = document.createElement("meta");
      created.name = "description";
      created.content = description;
      document.head.appendChild(created);
    } else {
      existing.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;
      existing?.setAttribute("content", previousDescription);
      created?.remove();
    };
  }, [title, description]);
}
