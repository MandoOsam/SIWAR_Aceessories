import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/utils/cn";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

export interface AccordionProps {
  items: AccordionItem[];
  /** First open section. Defaults to none. */
  defaultOpenId?: string;
  /** When false (default) opening a section closes the others. */
  allowMultiple?: boolean;
  className?: string;
}

/**
 * Accessible disclosure list (05-ui-context.md §8). Used for shipping, returns and material
 * details. Each header is a real button wired to its panel with `aria-expanded` / `aria-controls`,
 * and the open/close animation is skipped when the visitor prefers reduced motion.
 */
export function Accordion({
  items,
  defaultOpenId,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);

  const toggle = (id: string): void => {
    setOpenIds((current) => {
      const isOpen = current.includes(id);
      if (isOpen) return current.filter((openId) => openId !== id);
      return allowMultiple ? [...current, id] : [id];
    });
  };

  const transition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeInOut" };

  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const panelId = `accordion-panel-${item.id}`;
        const headerId = `accordion-header-${item.id}`;

        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-start font-medium text-fg transition-colors duration-300 ease-smooth hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>{item.title}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={transition}
                  className="shrink-0"
                  aria-hidden="true"
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={panelId}
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={transition}
                  className="overflow-hidden"
                >
                  <div className="pb-4 text-sm leading-relaxed text-fg-muted">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
