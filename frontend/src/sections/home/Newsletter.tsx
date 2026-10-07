import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { subscribeNewsletter } from "@/services/api";

const emailSchema = z.string().email();

export function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await subscribeNewsletter(email);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="container-page py-12">
      <div className="rounded-card bg-surface-2 p-8">
        <h2 className="font-heading text-heading-sm text-fg">{t("newsletter.title", "Stay in the loop")}</h2>
        <p className="mt-2 text-sm text-fg-muted">{t("newsletter.subtitle", "Get the latest news and offers")}</p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("newsletter.emailPlaceholder", "Enter your email")}
            className="flex-1 rounded-input border border-border bg-surface px-4 py-2 text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" disabled={status === "loading"}>
            {t("newsletter.subscribe", "Subscribe")}
          </Button>
        </form>
        {status === "success" && (
          <p className="mt-2 text-sm text-success">{t("newsletter.success", "Subscribed successfully")}</p>
        )}
        {status === "error" && (
          <p className="mt-2 text-sm text-danger">{t("newsletter.error", "Invalid email")}</p>
        )}
      </div>
    </section>
  );
}

export default Newsletter;
