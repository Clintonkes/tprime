import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter, BUSINESS } from "@/components/site-layout";
import { useState } from "react";
import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { ArrowRight, CheckCircle2, Phone, Mail, MapPin, Loader2 } from "lucide-react";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book Lawn Care — T Prime LLC" },
      { name: "description", content: "Book professional lawn mowing and yard care in Matthews, NC. Free quote within 24 hours." },
      { property: "og:title", content: "Book Lawn Care — T Prime LLC" },
      { property: "og:description", content: "Free quotes within 24 hours." },
    ],
  }),
  component: BookPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z.string().trim().min(7, "Enter a valid phone").max(30),
  address: z.string().trim().min(5, "Enter service address").max(200),
  service: z.string().min(1, "Choose a service"),
  lawn_size: z.string().max(60).optional().or(z.literal("")),
  preferred_date: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

function BookPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your entries.");
      return;
    }
    setStatus("submitting");
    const payload = {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      frequency: parsed.data.service,
      lawn_size: parsed.data.lawn_size || null,
      preferred_date: parsed.data.preferred_date || null,
      notes: parsed.data.notes || null,
    };
    try {
      await api.createBooking(payload);
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "We couldn't submit your request. Please call us or try again.");
      return;
    }
    setStatus("success");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <main>
        <section className="border-b border-primary/10 bg-gradient-to-b from-secondary/40 to-transparent py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Book a Service</span>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-6xl">
              Get a free quote in 24 hours.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Fill out the form and we'll respond same day with a firm price. Weekly service typically starts within a few days.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_1.4fr]">
            <aside className="space-y-6">
              <div className="rounded-3xl border border-primary/10 bg-card p-8">
                <h3 className="font-display text-lg font-bold">Reach us directly</h3>
                <ul className="mt-6 space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 size-5 text-primary" />
                    <a href={BUSINESS.phoneHref} className="font-semibold hover:text-primary">{BUSINESS.phone}</a>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 size-5 text-primary" />
                    <a href={`mailto:${BUSINESS.email}`} className="font-semibold hover:text-primary break-all">{BUSINESS.email}</a>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-5 text-primary" />
                    <span className="text-muted-foreground">{BUSINESS.address}</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl bg-primary p-8 text-primary-foreground">
                <h3 className="font-display text-lg font-bold">What happens next</h3>
                <ol className="mt-6 space-y-4 text-sm text-primary-foreground/80">
                  {["We review your details","Send you a firm quote in 24h","Confirm a recurring schedule","First service within days"].map((s, i) => (
                    <li key={s} className="flex items-start gap-3">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{i+1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            <div>
              {status === "success" ? (
                <div className="rounded-3xl border border-primary/20 bg-card p-10 text-center shadow-xl">
                  <CheckCircle2 className="mx-auto size-16 text-primary" />
                  <h2 className="mt-6 font-display text-3xl font-extrabold">Request received!</h2>
                  <p className="mt-3 text-muted-foreground">
                    Thanks — we'll reach out within 24 hours with your quote. For faster service, call us at {BUSINESS.phone}.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button onClick={() => setStatus("idle")} className="rounded-full border border-primary/20 px-6 py-3 text-sm font-bold hover:bg-secondary">
                      Book another
                    </button>
                    <Link to="/" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Back home</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="rounded-3xl border border-primary/10 bg-card p-8 shadow-xl md:p-10">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name" name="name" required placeholder="Jane Doe" />
                    <Field label="Phone" name="phone" type="tel" required placeholder="(469) 555-0000" />
                  </div>
                  <div className="mt-5">
                    <Field label="Email" name="email" type="email" required placeholder="you@example.com" />
                  </div>
                  <div className="mt-5">
                    <Field label="Service address" name="address" required placeholder="Street, City, ZIP" />
                  </div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label>Service needed *</Label>
                      <select name="service" required className="mt-1.5 w-full rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
                        <option value="">Choose a service…</option>
                        <option>Weekly Mowing</option>
                        <option>Bi-Weekly Mowing</option>
                        <option>One-Time Mow</option>
                        <option>Edging & Trimming</option>
                        <option>Yard Cleanup</option>
                        <option>Hedge & Shrub Care</option>
                        <option>Fertilization & Weed Control</option>
                        <option>Seasonal Care Program</option>
                        <option>Not sure — recommend for me</option>
                      </select>
                    </div>
                    <Field label="Lawn size (approx.)" name="lawn_size" placeholder="e.g. 1/4 acre" />
                  </div>
                  <div className="mt-5">
                    <Field label="Preferred start date" name="preferred_date" type="date" />
                  </div>
                  <div className="mt-5">
                    <Label>Notes for our crew</Label>
                    <textarea name="notes" rows={4} placeholder="Gate code, pet info, problem areas…" className="mt-1.5 w-full resize-none rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                  {error && <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {status === "submitting" ? <><Loader2 className="size-4 animate-spin" /> Submitting…</> : <>Request my free quote <ArrowRight className="size-4" /></>}
                  </button>
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    By submitting, you agree to be contacted about your quote. No spam, ever.
                  </p>
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

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">{children}</label>;
}
function Field({ label, name, type = "text", placeholder, required }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <Label>{label}{required && " *"}</Label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
