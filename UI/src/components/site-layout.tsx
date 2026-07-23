import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export const BUSINESS = {
  name: "T Prime LLC",
  phone: "+1 (704) 771-4624",
  phoneHref: "tel:+17047714624",
  email: "hello@tprimellc.com",
  address: "3308 Jonesberry Rd, Matthews, NC 28105",
};

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`grid place-items-center rounded-2xl bg-primary text-primary-foreground ${className}`}>
      <span className="font-display text-[0.95em] font-black leading-none tracking-tighter">
        T<span className="text-accent">·</span>P
      </span>
    </span>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/book", label: "Book Service" },
    { to: "/contact", label: "Contact" },
  ] as const;
  return (
    <nav className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-full border border-border/60 bg-background/80 py-3 pl-5 pr-3 shadow-[0_10px_40px_-15px_rgba(15,23,42,0.25)] backdrop-blur-xl md:flex md:justify-between md:pl-6 md:pr-4">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <BrandMark className="size-9 text-sm" />
          <span className="truncate font-display text-base font-bold tracking-tight text-primary">
            T Prime <span className="text-muted-foreground font-medium">LLC</span>
          </span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/book"
            className="group inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-[0_8px_24px_-8px_oklch(0.86_0.20_130)] transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            Free Quote <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-full border border-border p-2 md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="mt-2 rounded-3xl border border-border/60 bg-background/95 p-3 shadow-xl backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-secondary"
                activeProps={{ className: "text-primary bg-secondary" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <BrandMark className="size-11 text-base" />
            <span className="font-display text-xl font-bold tracking-tight">
              T Prime LLC
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            Premium lawn care and mowing crafted for Matthews, Charlotte, and the greater Union County area.
          </p>
          <Link to="/book" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground">
            Book a visit <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="md:col-span-3">
          <h4 className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">Services</h4>
          <ul className="mt-5 space-y-2.5 text-sm text-primary-foreground/75">
            <li>Weekly Mowing</li>
            <li>Edging & Trimming</li>
            <li>Yard Cleanup</li>
            <li>Seasonal Care</li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <h4 className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">Contact</h4>
          <ul className="mt-5 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
              <a href={BUSINESS.phoneHref} className="hover:text-accent">{BUSINESS.phone}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-accent break-all">{BUSINESS.email}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>{BUSINESS.address}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-primary-foreground/50 md:flex-row">
          <p>© {new Date().getFullYear()} T Prime LLC · Matthews, NC</p>
          <Link to="/admin" className="hover:text-accent">Staff Login</Link>
        </div>
      </div>
    </footer>
  );
}

