import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter, BrandMark, BUSINESS } from "@/components/site-layout";
import heroLawn from "@/assets/tprime-hero.jpg";
import mowingAction from "@/assets/tprime-action.jpg";
import {
  ArrowUpRight, Scissors, Sprout, Trees, Leaf, Wrench, Sparkles,
  Star, Phone, MapPin, ShieldCheck, Clock, MessageSquareQuote,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "T Prime LLC — Premium Lawn Care & Mowing in Matthews, NC" },
      { name: "description", content: "Precision mowing, edging, cleanup, and seasonal lawn programs for Matthews, Charlotte, and Union County. Free 24-hour quotes." },
      { property: "og:title", content: "T Prime LLC — Lawn Care Perfected" },
      { property: "og:description", content: "Weekly mowing and full-service lawn care across the Charlotte metro." },
    ],
  }),
  component: Home,
});

const services = [
  { icon: Scissors, title: "Precision Mowing", desc: "Weekly and bi-weekly cuts with commercial mowers, alternating patterns, and razor-sharp blades.", tag: "Most popular" },
  { icon: Sprout, title: "Edging & Trimming", desc: "Blade edging on hard surfaces, detailed string trimming, and clean lines around every obstacle." },
  { icon: Leaf, title: "Yard Cleanup", desc: "Full leaf removal, storm debris haul-off, and one-time resets for overgrown properties." },
  { icon: Trees, title: "Hedge & Shrub Care", desc: "Shaping, pruning, and health-focused care for hedges, boxwoods, and ornamentals." },
  { icon: Sprout, title: "Fertilization & Weed Control", desc: "Season-tuned feeding, pre-emergent programs, and targeted post-emergent treatments." },
  { icon: Wrench, title: "Seasonal Programs", desc: "Spring startup, summer heat management, and fall winterization built for the Carolinas." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteNav />
      <main className="pt-6">
        <Hero />
        <TrustStrip />
        <Services />
        <Feature />
        <Process />
        <Testimonials />
        <ServiceArea />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 pt-10 md:pt-16">
        <div className="grid gap-6 md:grid-cols-12 md:gap-5">
          {/* Headline card */}
          <div className="md:col-span-8 rounded-[2rem] bg-primary p-8 text-primary-foreground md:p-14 lg:p-16 relative overflow-hidden">
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
                <span className="size-1.5 rounded-full bg-accent" /> Serving Matthews · Charlotte · Union County
              </div>
              <h1 className="mt-8 font-display text-[2.75rem] font-bold leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
                Lawns worth <span className="italic text-accent">stopping</span> for.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-primary-foreground/75 md:text-lg">
                T Prime is a precision lawn studio serving the Charlotte metro. Weekly mowing, sharp edges, meticulous cleanup — treated like craft, priced like maintenance.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  to="/book"
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-bold text-accent-foreground shadow-[0_20px_40px_-12px_oklch(0.86_0.20_130)] transition-transform hover:-translate-y-0.5"
                >
                  Get a free quote
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <a href={BUSINESS.phoneHref} className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-6 py-4 text-sm font-semibold text-primary-foreground/90 backdrop-blur hover:bg-primary-foreground/10">
                  <Phone className="size-4" /> {BUSINESS.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Hero image card */}
          <div className="md:col-span-4 rounded-[2rem] overflow-hidden relative aspect-[3/4] md:aspect-auto">
            <img
              src={heroLawn}
              alt="Aerial view of a professionally mowed lawn"
              width={1400}
              height={1600}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-background/95 p-4 backdrop-blur-md">
              <div className="flex items-center gap-1 text-accent">
                {[0,1,2,3,4].map(i => <Star key={i} className="size-3.5 fill-current" />)}
              </div>
              <p className="mt-1.5 font-display text-lg font-bold text-primary">5.0 rated</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">by neighbors in Matthews</p>
            </div>
          </div>

          {/* Stat cards row */}
          <StatTile label="Yards serviced weekly" value="180+" />
          <StatTile label="On-time arrival rate" value="99%" accent />
          <StatTile label="Quote turnaround" value="24h" />
          <StatTile label="Years in the Carolinas" value="6yr" />
        </div>
      </div>
    </section>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`md:col-span-3 rounded-2xl p-6 ${accent ? "bg-accent text-accent-foreground" : "bg-card ring-1 ring-border"}`}>
      <p className="font-display text-4xl font-bold tracking-tight">{value}</p>
      <p className={`mt-2 text-[11px] font-bold uppercase tracking-[0.18em] ${accent ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{label}</p>
    </div>
  );
}

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, text: "Licensed & insured" },
    { icon: Clock, text: "Same-day quotes" },
    { icon: Sparkles, text: "No contracts" },
    { icon: Leaf, text: "Locally owned" },
  ];
  return (
    <section className="mx-auto mt-6 max-w-6xl px-4">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4 md:p-6">
        {items.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Icon className="size-4" />
            </span>
            <span className="text-sm font-semibold text-foreground/80">{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="mx-auto mt-24 max-w-6xl px-4">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-foreground/60">/ Services</p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Everything your lawn needs, <span className="text-accent-foreground/40">nothing it doesn't.</span>
          </h2>
        </div>
        <Link to="/services" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary">
          Full pricing <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-6">
        {services.map(({ icon: Icon, title, desc, tag }, i) => (
          <article
            key={title}
            className={`group relative rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.35)] ${i === 0 ? "md:col-span-3 md:row-span-2 bg-primary text-primary-foreground border-transparent" : i < 2 ? "md:col-span-3" : "md:col-span-2"}`}
          >
            {tag && (
              <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
                {tag}
              </span>
            )}
            <span className={`grid size-12 place-items-center rounded-2xl ${i === 0 ? "bg-accent text-accent-foreground" : "bg-secondary text-primary"}`}>
              <Icon className="size-5" />
            </span>
            <h3 className={`mt-6 font-display font-bold tracking-tight ${i === 0 ? "text-3xl md:text-4xl" : "text-xl"}`}>{title}</h3>
            <p className={`mt-3 text-sm leading-relaxed ${i === 0 ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{desc}</p>
            {i === 0 && (
              <Link to="/book" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground">
                Start weekly service <ArrowUpRight className="size-4" />
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Feature() {
  const rows = [
    { k: "01", t: "Same crew every visit", d: "Consistency, not turnover. Your yard learns us, we learn your yard." },
    { k: "02", t: "Commercial-grade equipment", d: "Zero-turn mowers, sharpened weekly. Clean cut, cleaner finish." },
    { k: "03", t: "Transparent flat pricing", d: "One quote, no upsells, no surprise line items. Cancel anytime." },
    { k: "04", t: "Photo proof after every service", d: "Digital before/after + invoice sent to your inbox." },
  ];
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4">
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-5 relative overflow-hidden rounded-3xl aspect-[4/5] md:aspect-auto">
          <img
            src={mowingAction}
            alt="T Prime crew mowing with commercial equipment"
            width={1400}
            height={1000}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-background/95 p-5 backdrop-blur">
            <MessageSquareQuote className="size-5 text-accent-foreground/50" />
            <p className="mt-2 font-display text-sm font-semibold text-primary">
              "Our HOA finally has a lawn service that actually shows up."
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">Board member · Providence Plantation</p>
          </div>
        </div>
        <div className="md:col-span-7 rounded-3xl bg-card ring-1 ring-border p-8 md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-foreground/60">/ Why T Prime</p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            A better lawn service, built on four promises.
          </h2>
          <div className="mt-8 divide-y divide-border">
            {rows.map(r => (
              <div key={r.k} className="grid grid-cols-[auto_1fr] gap-6 py-5">
                <span className="font-display text-2xl font-bold text-accent-foreground/25 tabular-nums">{r.k}</span>
                <div>
                  <h4 className="font-display text-lg font-bold">{r.t}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{r.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { n: "01", t: "Request", d: "Share your address and what you need. Takes 60 seconds." },
    { n: "02", t: "Quote", d: "Firm price within 24 hours. No sales pressure." },
    { n: "03", t: "Schedule", d: "Pick weekly or bi-weekly. We lock a recurring day." },
    { n: "04", t: "Enjoy", d: "Show up. Cut. Edge. Blow. Photo. Invoice. Repeat." },
  ];
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4">
      <div className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-foreground/60">/ Process</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Four steps to a lawn you love.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {steps.map(s => (
          <div key={s.n} className="rounded-3xl border border-border bg-card p-7 transition-colors hover:bg-secondary">
            <p className="font-display text-5xl font-bold text-accent">{s.n}</p>
            <h4 className="mt-6 font-display text-xl font-bold">{s.t}</h4>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { quote: "Best lawn service we've had since moving to Matthews. Never miss a week.", name: "Sarah M.", role: "Homeowner · Matthews" },
    { quote: "Fast, professional, and the yard has never looked better. Highly recommend.", name: "David R.", role: "Homeowner · Weddington" },
    { quote: "T Prime transformed our overgrown property in one visit. Fair pricing, incredible work.", name: "Jessica T.", role: "Property Manager · Charlotte" },
  ];
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-foreground/60">/ Neighbors say</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((t, i) => (
          <figure
            key={t.name}
            className={`rounded-3xl p-8 ${i === 1 ? "bg-accent text-accent-foreground" : "bg-card ring-1 ring-border"}`}
          >
            <div className="flex items-center gap-1 text-accent-foreground">
              {[0,1,2,3,4].map(k => <Star key={k} className={`size-3.5 fill-current ${i === 1 ? "" : "text-accent"}`} />)}
            </div>
            <blockquote className="mt-5 font-display text-lg font-medium leading-snug">
              "{t.quote}"
            </blockquote>
            <figcaption className={`mt-6 border-t pt-4 ${i === 1 ? "border-accent-foreground/20" : "border-border"}`}>
              <p className="text-sm font-bold">{t.name}</p>
              <p className={`text-[11px] uppercase tracking-widest ${i === 1 ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{t.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ServiceArea() {
  const cities = ["Matthews", "Mint Hill", "Weddington", "Waxhaw", "Indian Trail", "Stallings", "Ballantyne", "South Charlotte"];
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4">
      <div className="rounded-3xl bg-card ring-1 ring-border p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-foreground/60">/ Coverage</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Serving the Charlotte metro from Matthews, NC.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">Based on Jonesberry Rd — our crew reaches most of Union and southern Mecklenburg counties within 20 minutes.</p>
          </div>
          <ul className="md:col-span-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {cities.map(c => (
              <li key={c} className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold">
                <MapPin className="size-3.5 text-accent-foreground/50" /> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary p-10 text-primary-foreground md:p-16">
        <div className="pointer-events-none absolute -left-24 -bottom-24 size-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <BrandMark className="size-14 text-lg" />
            <h2 className="mt-8 font-display text-4xl font-bold leading-[1] tracking-tight md:text-6xl">
              Ready for a lawn <br /><span className="text-accent italic">worth showing off?</span>
            </h2>
            <p className="mt-6 max-w-lg text-base text-primary-foreground/70">
              Free quote in 24 hours. First service typically within the week. No contracts, no lock-ins.
            </p>
          </div>
          <div className="md:col-span-5 flex flex-col gap-3">
            <Link to="/book" className="group inline-flex items-center justify-between gap-4 rounded-full bg-accent px-7 py-5 text-sm font-bold text-accent-foreground">
              Book service <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-between gap-4 rounded-full border border-primary-foreground/25 px-7 py-5 text-sm font-bold hover:bg-primary-foreground/10">
              Ask a question <ArrowUpRight className="size-4" />
            </Link>
            <div className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              <p className="flex items-center gap-2"><Phone className="size-4 text-accent" /> {BUSINESS.phone}</p>
              <p className="flex items-center gap-2"><MapPin className="size-4 text-accent" /> {BUSINESS.address}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}