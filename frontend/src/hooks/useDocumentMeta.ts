import { useEffect } from "react";

/**
 * Per-page SEO: updates document.title, meta description, Open Graph tags, and canonical link.
 * Restores previous values on unmount. Pattern: "{PageTitle} | SIWAR".
 */
export function useDocumentMeta(
  title: string,
  description: string,
  options?: {
    type?: string;
    image?: string;
    url?: string;
  },
): void {
  useEffect(() => {
    const siteName = "SIWAR";
    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
    const previousTitle = document.title;
    document.title = fullTitle;

    // description
    const descSelector = 'meta[name="description"]';
    const existingDesc = document.querySelector(descSelector) as HTMLMetaElement | null;
    const previousDesc = existingDesc?.getAttribute("content") ?? "";
    let createdDesc: HTMLMetaElement | null = null;
    if (existingDesc === null) {
      createdDesc = document.createElement("meta");
      createdDesc.name = "description";
      createdDesc.content = description;
      document.head.appendChild(createdDesc);
    } else {
      existingDesc.setAttribute("content", description);
    }

    // canonical
    const canonicalSelector = 'link[rel="canonical"]';
    const existingCanonical = document.querySelector(canonicalSelector) as HTMLLinkElement | null;
    const previousCanonical = existingCanonical?.getAttribute("href") ?? "";
    let createdCanonical: HTMLLinkElement | null = null;
    const pageUrl = options?.url ?? window.location.origin + window.location.pathname;
    if (existingCanonical === null) {
      createdCanonical = document.createElement("link");
      createdCanonical.rel = "canonical";
      createdCanonical.href = pageUrl;
      document.head.appendChild(createdCanonical);
    } else {
      existingCanonical.setAttribute("href", pageUrl);
    }

    const ogTags: Array<{ property: string; content: string }> = [
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: options?.type ?? "website" },
      { property: "og:url", content: pageUrl },
      { property: "og:image", content: options?.image ?? `${window.location.origin}/og-default.jpg` },
      { property: "og:site_name", content: siteName },
    ];

    const ogReverts: Array<() => void> = [];
    ogTags.forEach((tag) => {
      const sel = `meta[property="${tag.property}"]`;
      const el = document.querySelector(sel) as HTMLMetaElement | null;
      const prev = el?.getAttribute("content") ?? null;
      if (el === null) {
        const m = document.createElement("meta");
        m.setAttribute("property", tag.property);
        m.content = tag.content;
        document.head.appendChild(m);
        ogReverts.push(() => {
          m.remove();
        });
      } else {
        el.setAttribute("content", tag.content);
        ogReverts.push(() => {
          if (prev === null) {
            el.remove();
          } else {
            el.setAttribute("content", prev);
          }
        });
      }
    });

    return () => {
      document.title = previousTitle;
      if (createdDesc) createdDesc.remove();
      else if (existingDesc) existingDesc.setAttribute("content", previousDesc);
      if (createdCanonical) createdCanonical.remove();
      else if (existingCanonical) existingCanonical.setAttribute("href", previousCanonical);
      ogReverts.forEach((r) => r());
    };
  }, [title, description, options?.type, options?.image, options?.url]);
}
