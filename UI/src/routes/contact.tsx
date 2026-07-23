import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter, BUSINESS } from "@/components/site-layout";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle2, Phone, Mail, MapPin, Clock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — T Prime LLC Lawn Care" },
      { name: "description", content: "Get in touch with T Prime LLC lawn care in Matthews, NC. Call (704) 771-4624 or send us a message." },
      { property: "og:title", content: "Contact — T Prime LLC" },
      { property: "og:description", content: "Reach our lawn care team in Matthews, NC." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(5, "Please provide a short message").max(1500),
});

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your entries.");
      return;
    }
    setStatus("submitting");
    const { error: err } = await supabase.from("contact_messages").insert({
      ...parsed.data,
      phone: parsed.data.phone || null,
    });
    if (err) { setStatus("error"); setError("Something went wrong. Please call us."); return; }
    setStatus("success");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <main>
        <section className="border-b border-primary/10 bg-gradient-to-b from-secondary/40 to-transparent py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Contact</span>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-6xl">
              We'd love to hear from you.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Questions, feedback, or a special request? Reach out below or call us directly — we respond fast.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
            <div className="space-y-6">
              {[
                { icon: Phone, label: "Call us", value: BUSINESS.phone, href: BUSINESS.phoneHref },
                { icon: Mail, label: "Email", value: BUSINESS.email, href: `mailto:${BUSINESS.email}` },
                { icon: MapPin, label: "Address", value: BUSINESS.address },
                { icon: Clock, label: "Hours", value: "Mon–Fri 7am–7pm · Sat 8am–5pm" },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 rounded-2xl border border-primary/10 bg-card p-6">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                    {href ? (
                      <a href={href} className="mt-1 block font-display text-lg font-bold break-words hover:text-primary">{value}</a>
                    ) : (
                      <p className="mt-1 font-display text-lg font-bold break-words">{value}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="rounded-3xl bg-primary p-8 text-primary-foreground">
                <h3 className="font-display text-lg font-bold">Need service quickly?</h3>
                <p className="mt-2 text-sm text-primary-foreground/70">Skip the form — book your service and we'll respond within 24 hours.</p>
                <Link to="/book" className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground">
                  Book Now <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <div>
              {status === "success" ? (
                <div className="rounded-3xl border border-primary/20 bg-card p-10 text-center shadow-xl">
                  <CheckCircle2 className="mx-auto size-16 text-primary" />
                  <h2 className="mt-6 font-display text-3xl font-extrabold">Message sent!</h2>
                  <p className="mt-3 text-muted-foreground">We'll get back to you within one business day.</p>
                  <button onClick={() => setStatus("idle")} className="mt-8 rounded-full border border-primary/20 px-6 py-3 text-sm font-bold hover:bg-secondary">Send another</button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="rounded-3xl border border-primary/10 bg-card p-8 shadow-xl md:p-10">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FieldC label="Name *" name="name" placeholder="Your name" required />
                    <FieldC label="Phone" name="phone" type="tel" placeholder="Optional" />
                  </div>
                  <div className="mt-5">
                    <FieldC label="Email *" name="email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="mt-5">
                    <FieldC label="Subject *" name="subject" placeholder="What's this about?" required />
                  </div>
                  <div className="mt-5">
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Message *</label>
                    <textarea name="message" rows={6} required placeholder="Tell us how we can help…" className="mt-1.5 w-full resize-none rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                  {error && <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
                  <button type="submit" disabled={status === "submitting"} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 disabled:opacity-60">
                    {status === "submitting" ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : <>Send Message <ArrowRight className="size-4" /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function FieldC({ label, name, type = "text", placeholder, required }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} className="mt-1.5 w-full rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}
