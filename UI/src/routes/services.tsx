import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-layout";
import { Scissors, Sprout, Leaf, Trees, Wrench, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — T Prime LLC Lawn Care & Mowing" },
      { name: "description", content: "Full-service lawn care in Matthews, NC: mowing, edging, trimming, cleanup, fertilization, hedge care, and seasonal maintenance." },
      { property: "og:title", content: "Services — T Prime LLC" },
      { property: "og:description", content: "Full-service lawn care in Matthews, NC and the Charlotte metro." },
    ],
  }),
  component: Services,
});

const services = [
  { icon: Scissors, title: "Weekly & Bi-Weekly Mowing", price: "From $45 / visit", desc: "Consistent, professional cuts using commercial-grade equipment. Sharp blades, alternating patterns, thorough blow-off.", features: ["Mowing at correct height for turf type", "Sharp-blade cut prevents disease", "Full blow-off of hard surfaces", "Photo confirmation each visit"] },
  { icon: Sprout, title: "Edging & Trimming", price: "Included", desc: "Precision string trimming and blade edging around walkways, driveways, garden beds, fences, and trees.", features: ["Blade edging on hard surfaces", "String trim around obstacles", "Fence-line detailing", "Clean crisp lines every time"] },
  { icon: Leaf, title: "Yard Cleanup", price: "From $150", desc: "Full-property leaf removal, storm debris haul-off, and one-time reset cleanups for neglected yards.", features: ["Full leaf and debris removal", "Bed cleaning and refresh", "Post-storm cleanup available", "Haul-away included"] },
  { icon: Trees, title: "Hedge & Shrub Care", price: "From $75", desc: "Shaping, pruning, and health maintenance for hedges, shrubs, and ornamental plants.", features: ["Shape and size maintenance", "Deadwood removal", "Health-focused pruning", "Debris haul-off included"] },
  { icon: Sprout, title: "Fertilization & Weed Control", price: "Custom program", desc: "Season-tuned fertilization schedules with targeted pre- and post-emergent weed control.", features: ["Soil-appropriate feeding", "Pre-emergent weed prevention", "Spot treatment for problem weeds", "Quarterly application options"] },
  { icon: Wrench, title: "Seasonal Property Care", price: "Custom", desc: "Spring startup, summer maintenance, and fall winterization built for the Carolinas climate.", features: ["Spring cleanup & startup", "Summer heat-stress management", "Fall cleanup & winterization", "Year-round support"] },
];

function Services() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteNav />
      <main>
        <section className="border-b border-primary/10 bg-gradient-to-b from-secondary/50 to-transparent py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Services & Pricing</span>
            <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight md:text-6xl">
              Professional lawn care, priced fairly.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Every service includes the same core standard: on-time arrival, meticulous execution, and complete cleanup. Prices below are starting points — get a firm quote in minutes.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2">
            {services.map(({ icon: Icon, title, price, desc, features }) => (
              <article key={title} className="group flex flex-col rounded-3xl border border-primary/10 bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">{price}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                <ul className="mt-6 space-y-2">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/book" className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
                  Book this service <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-primary py-20 text-primary-foreground">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Sparkles className="mx-auto size-8 text-accent" />
            <h2 className="mt-4 font-display text-3xl font-extrabold md:text-4xl">Not sure what you need?</h2>
            <p className="mt-4 text-primary-foreground/70">Tell us about your property. We'll recommend the right program.</p>
            <Link to="/book" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground">
              Get a Free Quote <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
