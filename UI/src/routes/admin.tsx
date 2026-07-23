import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Leaf, LogOut, Loader2, Calendar, Mail, RefreshCw, Trash2, CheckCircle2, Clock, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — T Prime LLC" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Booking = {
  id: string; name: string; email: string; phone: string; address: string;
  service: string; lawn_size: string | null; preferred_date: string | null;
  notes: string | null; status: string; created_at: string;
};
type Message = {
  id: string; name: string; email: string; phone: string | null;
  subject: string; message: string; status: string; created_at: string;
};

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (checking) return <FullScreenLoader />;
  if (!session) return <AuthGate />;
  if (isAdmin === null) return <FullScreenLoader />;
  if (!isAdmin) return <NotAuthorized email={session.user.email ?? ""} />;
  return <Dashboard email={session.user.email ?? ""} />;
}

function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

function AuthGate() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErr(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) setErr(error.message);
    }
    setBusy(false);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-secondary/40 via-background to-background px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-xl font-extrabold">T Prime <span className="text-primary">LLC</span></span>
        </Link>
        <div className="rounded-3xl border border-primary/10 bg-card p-8 shadow-2xl">
          <h1 className="font-display text-2xl font-extrabold">Staff Portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to manage bookings and messages." : "First-time setup — the first account created becomes the admin."}
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            {err && <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{err}</p>}
            <button disabled={busy} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {busy ? <Loader2 className="size-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(null); }} className="mt-6 w-full text-center text-xs font-semibold text-primary hover:underline">
            {mode === "signin" ? "First time here? Create the admin account →" : "← Back to sign in"}
          </button>
        </div>
        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground hover:text-primary">← Back to site</Link>
      </div>
    </div>
  );
}

function NotAuthorized({ email }: { email: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-extrabold">Not authorized</h1>
        <p className="mt-3 text-muted-foreground">Signed in as {email}, but this account doesn't have admin access.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Sign out</button>
      </div>
    </div>
  );
}

function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<"bookings" | "messages">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [b, m] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    ]);
    setBookings((b.data as Booking[]) ?? []);
    setMessages((m.data as Message[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const newCount = messages.filter(m => m.status === "new").length;

  async function updateBooking(id: string, status: string) {
    await supabase.from("bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    load();
  }
  async function deleteBooking(id: string) {
    if (!confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    load();
  }
  async function updateMessage(id: string, status: string) {
    await supabase.from("contact_messages").update({ status }).eq("id", id);
    load();
  }
  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    load();
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-primary/10 bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="size-5" />
            </span>
            <span className="font-display text-lg font-extrabold">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
            <button onClick={load} className="rounded-lg border border-primary/15 p-2 hover:bg-secondary" title="Refresh">
              <RefreshCw className="size-4" />
            </button>
            <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 px-3 py-2 text-xs font-bold hover:bg-secondary">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Calendar} label="Total Bookings" value={bookings.length} />
          <StatCard icon={Clock} label="Pending Bookings" value={pendingCount} accent />
          <StatCard icon={Mail} label="New Messages" value={newCount} accent />
        </div>

        <div className="mt-8 flex gap-2 rounded-full bg-background p-1 shadow-sm ring-1 ring-primary/10 w-fit">
          <TabBtn active={tab === "bookings"} onClick={() => setTab("bookings")}>Bookings ({bookings.length})</TabBtn>
          <TabBtn active={tab === "messages"} onClick={() => setTab("messages")}>Messages ({messages.length})</TabBtn>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : tab === "bookings" ? (
            bookings.length === 0 ? <Empty text="No bookings yet." /> : (
              <div className="grid gap-4">
                {bookings.map(b => <BookingCard key={b.id} b={b} onStatus={updateBooking} onDelete={deleteBooking} />)}
              </div>
            )
          ) : (
            messages.length === 0 ? <Empty text="No messages yet." /> : (
              <div className="grid gap-4">
                {messages.map(m => <MessageCard key={m.id} m={m} onStatus={updateMessage} onDelete={deleteMessage} />)}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${accent ? "border-primary/30 bg-primary text-primary-foreground" : "border-primary/10 bg-background"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
        <Icon className="size-5 opacity-70" />
      </div>
      <p className="mt-3 font-display text-4xl font-extrabold">{value}</p>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-primary/20 bg-background p-16 text-center text-sm text-muted-foreground">{text}</div>;
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    pending: "bg-accent/30 text-primary",
    confirmed: "bg-primary/10 text-primary",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-destructive/10 text-destructive",
    new: "bg-accent/30 text-primary",
    read: "bg-primary/10 text-primary",
    archived: "bg-muted text-muted-foreground",
  };
  return `rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${map[s] ?? "bg-muted"}`;
}

function BookingCard({ b, onStatus, onDelete }: { b: Booking; onStatus: (id: string, s: string) => void; onDelete: (id: string) => void }) {
  return (
    <article className="rounded-2xl border border-primary/10 bg-background p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold">{b.name}</h3>
            <span className={statusBadge(b.status)}>{b.status}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(b.created_at).toLocaleString()} · <span className="font-semibold text-primary">{b.service}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <select value={b.status} onChange={e => onStatus(b.id, e.target.value)}
            className="rounded-lg border border-primary/15 bg-background px-3 py-1.5 text-xs font-semibold">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={() => onDelete(b.id)} className="rounded-lg border border-destructive/20 p-1.5 text-destructive hover:bg-destructive/10" title="Delete">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Info icon={Mail} label="Email"><a href={`mailto:${b.email}`} className="hover:text-primary">{b.email}</a></Info>
        <Info icon={Phone} label="Phone"><a href={`tel:${b.phone}`} className="hover:text-primary">{b.phone}</a></Info>
        <Info icon={MapPin} label="Address">{b.address}</Info>
        <Info icon={Calendar} label="Preferred date">{b.preferred_date ?? "—"}</Info>
        {b.lawn_size && <Info icon={CheckCircle2} label="Lawn size">{b.lawn_size}</Info>}
      </dl>
      {b.notes && <p className="mt-4 rounded-lg bg-secondary/60 p-3 text-sm"><span className="font-bold">Notes:</span> {b.notes}</p>}
    </article>
  );
}

function MessageCard({ m, onStatus, onDelete }: { m: Message; onStatus: (id: string, s: string) => void; onDelete: (id: string) => void }) {
  return (
    <article className="rounded-2xl border border-primary/10 bg-background p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold">{m.subject}</h3>
            <span className={statusBadge(m.status)}>{m.status}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            From <span className="font-semibold text-foreground">{m.name}</span> · {new Date(m.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <select value={m.status} onChange={e => onStatus(m.id, e.target.value)}
            className="rounded-lg border border-primary/15 bg-background px-3 py-1.5 text-xs font-semibold">
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={() => onDelete(m.id)} className="rounded-lg border border-destructive/20 p-1.5 text-destructive hover:bg-destructive/10">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Info icon={Mail} label="Email"><a href={`mailto:${m.email}`} className="hover:text-primary">{m.email}</a></Info>
        {m.phone && <Info icon={Phone} label="Phone"><a href={`tel:${m.phone}`} className="hover:text-primary">{m.phone}</a></Info>}
      </dl>
      <p className="mt-4 whitespace-pre-wrap rounded-lg bg-secondary/60 p-4 text-sm">{m.message}</p>
    </article>
  );
}

function Info({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-words text-sm">{children}</p>
      </div>
    </div>
  );
}
