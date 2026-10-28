import { useEffect, useRef, useState, ReactNode } from "react";
import {
  Phone, MessageCircle, MapPin, Megaphone, Video, Search, Code, Palette, QrCode,
  Mail, Bot, Crown, Smartphone, Zap, Menu, X, Star, ArrowRight,
} from "lucide-react";
import logoKbg from "../assets/logo-kbg-a.png";

const WA = "923142763051";
const wa = (t: string) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;

/* ---------- helpers ---------- */
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

const Reveal = ({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) => {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
};

const Counter = ({ to, suffix }: { to: number; suffix: string }) => {
  const [ref, seen] = useInView<HTMLSpanElement>(0.6);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / 1800, 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return <span ref={ref}>{n}{suffix}</span>;
};

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div
    onMouseMove={(e) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
    }}
    className={`kbg-card ${className}`}>
    {children}
  </div>
);

/* ---------- data ---------- */
const stats = [
  { to: 10, suffix: "x+", label: "Average ROI on Ads", c: "text-emerald-400" },
  { to: 500, suffix: "k+", label: "Local Leads Generated", c: "text-cyan-400" },
  { to: 150, suffix: "+", label: "Karachi Brands Scaled", c: "text-purple-400" },
  { to: 99, suffix: "%", label: "Transparent Pricing", c: "text-amber-400" },
];

const services = [
  { cat: "ads", icon: Megaphone, title: "Meta Ads (Facebook & Instagram)", tag: "High ROI", text: "Laser-targeted campaigns, lookalike audiences and direct-to-WhatsApp objectives for Karachi." },
  { cat: "ads", icon: Smartphone, title: "TikTok Ads Management", tag: "Viral Growth", text: "Vertical video campaigns built for Pakistan's TikTok audience." },
  { cat: "ads", icon: Search, title: "Google & YouTube Ads", tag: "Intent Sales", text: "Search, Performance Max and YouTube campaigns for buyers already searching." },
  { cat: "branding", icon: Palette, title: "Graphics, Cards & Company Profiles", tag: "Brand Identity", text: "Logos, brochures, visiting cards, NFC cards and corporate profiles." },
  { cat: "branding", icon: QrCode, title: "Dynamic QR Codes", tag: "Smart Tech", text: "Branded, trackable QR codes linking print to WhatsApp, menu or website." },
  { cat: "ai", icon: Bot, title: "WhatsApp Catalog & AI Chat", tag: "AI Powered", text: "Product catalogs, AI auto-replies and WhatsApp Business API setup." },
  { cat: "ai", icon: Video, title: "AI Video Generation", tag: "Next-Gen Video", text: "Urdu/English AI voiceovers and product video ads without expensive shoots." },
  { cat: "ai", icon: Mail, title: "Email Marketing & Signatures", tag: "Retention", text: "Automated flows, abandoned-cart recovery and clickable HTML signatures." },
  { cat: "web", icon: Code, title: "Websites, Apps & E-Commerce", tag: "Custom Web", text: "Fast responsive sites, landing pages, Shopify and WooCommerce stores." },
  { cat: "web", icon: MapPin, title: "Google Map Optimization", tag: "Karachi Local SEO", text: "Rank #1 on Google Maps in Karachi for your target keywords." },
];

const filters: [string, string][] = [["all", "All Services"], ["ads", "Ads & Paid Media"], ["branding", "Branding & Print"], ["ai", "AI, Video & WhatsApp"], ["web", "Web, Apps & Maps SEO"]];

const strategies = [
  ["01", "New Arrivals Launch", "Teaser reels, countdown ads and WhatsApp broadcasts for launch-day demand."],
  ["02", "Flash Deals & Discounts", "Urgency offers with countdown pages and instant WhatsApp deal claims."],
  ["03", "New Products Spotlight", "AI video presentations and keyword PPC domination."],
  ["04", "VIP Loyalty Engine", "Early access, personalized greetings and repeat-buyer coupons."],
];

const funnel = [
  [Megaphone, "Targeted Ads Campaign", "Meta, TikTok or Google ads aimed at high-spending Karachi areas."],
  [Zap, "Landing Page / Fast Trigger", "Fast mobile page with offer countdowns or one-tap WhatsApp."],
  [MessageCircle, "Automated AI WhatsApp Close", "Catalog, deal code and instant replies to complete the sale."],
] as const;

const testimonials = [
  ["WhatsApp AI funnel and Meta Ads doubled our walk-in orders!", "Corporate Retailer, I.I. Chundrigar Road"],
  ["Google Maps SEO put our showroom at #1 in just 3 weeks!", "Showroom Owner, Gulshan-e-Maymar"],
  ["TikTok Ads + landing page generated non-stop leads.", "Boutique Brand, DHA Phase 6"],
];

const quoteOptions = ["Meta & TikTok Ads", "Google Map SEO", "WhatsApp AI Catalog", "Website / Landing Page", "Social Media Mgmt", "Graphics & Profiles"];

/* ---------- page ---------- */
export default function LandingPage() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState("all");
  const [picked, setPicked] = useState<string[]>([]);
  const [objective, setObjective] = useState("New Product Launch Strategy");
  const [biz, setBiz] = useState("");

  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      setScrolled(h.scrollTop > 30);
      setProgress((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const sendQuote = () => {
    if (!picked.length) return alert("Please select at least one service.");
    window.open(wa(`Hi Karachi Business Growth!\n\nI'd like a custom quote.\n*Business:* ${biz || "Karachi business"}\n*Services:* ${picked.join(", ")}\n*Objective:* ${objective}`), "_blank");
  };

  const btn = "kbg-shine relative overflow-hidden inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-transform hover:scale-105";

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 antialiased overflow-x-hidden font-sans">
      <div className="fixed top-0 left-0 z-[100] h-[3px] bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" style={{ width: `${progress}%` }} />

      {/* Offer bar */}
      <div className="kbg-bar bg-gradient-to-r from-emerald-600 via-teal-600 to-purple-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium">
        🔥 24/7 Priority Support & Same-Day Onboarding in Karachi | 20% Off Ads Setup + Free WhatsApp AI Bot Setup!
        <a href={wa("Hi! I want to claim the offer.")} target="_blank" rel="noreferrer" className="underline font-bold ml-2 hidden sm:inline">Claim Now →</a>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 border-b border-slate-800 backdrop-blur-xl bg-[#0B0F17]/85 transition-all ${scrolled ? "shadow-[0_8px_30px_-12px_rgba(0,0,0,.8)]" : ""}`}>
        <div className={`max-w-7xl mx-auto px-4 flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}>
          <a href="#" className="flex items-center gap-3">
            <img src={logoKbg} alt="Karachi Business Growth" width={40} height={40} loading="lazy" className="w-10 h-10 rounded-xl shrink-0" />
            <div className="leading-tight">
              <div className="font-extrabold text-white">KARACHI <span className="text-emerald-400">BUSINESS GROWTH</span></div>
              <div className="text-[10px] text-slate-400 tracking-widest uppercase">Gulshan-e-Maymar • AI Agency</div>
            </div>
          </a>
          <nav className="hidden lg:flex gap-6 text-sm font-medium text-slate-300">
            {[["services", "Services"], ["strategies", "More Customers"], ["funnel", "WhatsApp Funnel"], ["calculator", "Estimate Plan"], ["vip", "VIP Club"]].map(([id, l]) => (
              <a key={id} href={`#${id}`} className="hover:text-emerald-400 transition-colors">{l}</a>
            ))}
          </nav>
          <div className="hidden sm:flex gap-3">
            <a href="tel:03142763051" className="border border-slate-700 hover:border-emerald-500 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-colors"><Phone size={14} className="text-emerald-400" />0314 2763051</a>
            <a href={wa("Hi, I want to scale my business!")} target="_blank" rel="noreferrer" className={`${btn} bg-[#25D366] text-slate-950 px-5 py-2.5 !rounded-full text-xs`}><MessageCircle size={16} />WhatsApp</a>
          </div>
          <button className="lg:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X /> : <Menu />}</button>
        </div>
        {menu && (
          <div className="lg:hidden px-6 py-4 space-y-3 bg-[#151C2C] border-t border-slate-800 animate-in slide-in-from-top-2">
            {["services", "strategies", "funnel", "calculator", "vip"].map((id) => (
              <a key={id} href={`#${id}`} onClick={() => setMenu(false)} className="block capitalize py-2 border-b border-slate-800">{id}</a>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="kbg-float absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="kbg-float2 absolute top-1/3 right-10 w-[400px] h-[300px] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
          <Reveal><span className="inline-flex gap-2 items-center px-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-xs text-emerald-300"><Zap size={12} />Karachi Focused Marketing<span className="text-slate-500">•</span><MapPin size={12} className="text-red-400" />Gulshan-e-Maymar</span></Reveal>
          <Reveal delay={120}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-5xl mx-auto">
              Dominate Karachi Market with <span className="kbg-gradient">High-Converting Digital Ads</span> & Direct WhatsApp Leads
            </h1>
          </Reveal>
          <Reveal delay={240}><p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">Social Media, Meta/TikTok Ads, Google Maps SEO, Web/Apps, AI Video and WhatsApp AI Catalogs designed for Karachi businesses.</p></Reveal>
          <Reveal delay={360}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={wa("Hi, I want a Free Strategy Consultation.")} target="_blank" rel="noreferrer" className={`${btn} bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-8 py-4`}><MessageCircle />WhatsApp Quick Strategy</a>
              <a href="tel:03142763051" className={`${btn} bg-slate-900 border border-slate-700 text-white px-8 py-4`}><Phone size={18} className="text-emerald-400" />Call 0314 2763051</a>
            </div>
          </Reveal>
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <Card className="p-4 rounded-2xl"><div className={`text-3xl font-extrabold ${s.c}`}><Counter to={s.to} suffix={s.suffix} /></div><div className="text-xs text-slate-400 mt-1">{s.label}</div></Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal className="text-center mb-8"><span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">Trusted Across Karachi</span><h2 className="text-2xl font-bold text-white mt-1">What Local Business Owners Say</h2></Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(([q, a], i) => (
              <Reveal key={a} delay={i * 120}>
                <Card className="p-6 rounded-2xl h-full">
                  <div className="flex gap-1 text-amber-400 mb-3">{[...Array(5)].map((_, k) => <Star key={k} size={12} fill="currentColor" />)}</div>
                  <p className="text-sm italic text-slate-300 mb-4">"{q}"</p><div className="text-xs font-bold text-white">— {a}</div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">Complete 360° Digital Agency Services</h2>
            <p className="text-3xl sm:text-5xl font-extrabold text-white">All Digital & Design Solutions Under One Roof</p>
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {filters.map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)} className={`px-5 py-2 rounded-full text-xs sm:text-sm border transition-all ${filter === k ? "bg-emerald-500 text-slate-950 font-bold border-emerald-500" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"}`}>{l}</button>
              ))}
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter((s) => filter === "all" || s.cat === filter).map((s, i) => (
              <div key={s.title} className="kbg-pop" style={{ animationDelay: `${i * 60}ms` }}>
                <Card className="p-6 rounded-3xl h-full hover:-translate-y-2 transition-transform duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 grid place-items-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors"><s.icon /></div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-semibold">{s.tag}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm mb-5">{s.text}</p>
                  <a href={wa(`Hi, I'm interested in ${s.title}`)} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-400 inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform">Inquire via WhatsApp <ArrowRight size={14} /></a>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategies */}
      <section id="strategies" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal className="text-center mb-12"><h2 className="text-3xl sm:text-5xl font-extrabold text-white">More Customer Strategy Engine</h2></Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {strategies.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 100}>
                <Card className={`p-6 rounded-3xl h-full hover:-translate-y-2 transition-transform ${n === "04" ? "!border-amber-500/30" : ""}`}>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center font-bold text-sm mb-4">{n}</div>
                  <h3 className={`text-lg font-bold mb-2 ${n === "04" ? "text-amber-300" : "text-white"}`}>{t}</h3><p className="text-slate-400 text-xs">{d}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Funnel */}
      <section id="funnel" className="py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal className="text-center max-w-3xl mx-auto mb-12 space-y-3"><h2 className="text-3xl sm:text-5xl font-extrabold text-white">Social Media Funnel to WhatsApp</h2><p className="text-slate-400">In Karachi, transactions happen on WhatsApp. We build seamless paths from paid ads to automated closing chats.</p></Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {funnel.map(([Icon, t, d], i) => (
              <Reveal key={t} delay={i * 150} className="relative">
                <Card className={`p-8 rounded-3xl text-center h-full ${i === 2 ? "!border-emerald-500/40" : ""}`}>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto grid place-items-center mb-5"><Icon size={30} /></div>
                  <div className="text-xs font-bold text-emerald-400 tracking-widest mb-1">STEP 0{i + 1}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{t}</h3><p className="text-slate-400 text-xs">{d}</p>
                </Card>
                {i < 2 && <div className="kbg-flow hidden md:block absolute top-1/2 -right-6 w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent z-10" />}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="py-20 bg-slate-950">
        <Reveal className="max-w-4xl mx-auto px-4">
          <Card className="p-8 sm:p-12 rounded-3xl space-y-6">
            <div className="text-center"><span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Instant WhatsApp Quote Generator</span><h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Build Your Custom Growth Plan</h2></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {quoteOptions.map((o) => (
                <label key={o} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${picked.includes(o) ? "border-emerald-500 bg-emerald-500/10" : "bg-slate-900 border-slate-800 hover:border-emerald-500"}`}>
                  <input type="checkbox" className="accent-emerald-500" checked={picked.includes(o)} onChange={() => setPicked((p) => p.includes(o) ? p.filter((x) => x !== o) : [...p, o])} />{o}
                </label>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <select value={objective} onChange={(e) => setObjective(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
                {["New Product Launch Strategy", "Flash Discount & Deal Campaign", "VIP Loyalty & Repeat Customers", "Continuous Monthly Lead Generation"].map((o) => <option key={o}>{o}</option>)}
              </select>
              <input value={biz} onChange={(e) => setBiz(e.target.value)} placeholder="Your business type in Karachi" className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500" />
            </div>
            <button onClick={sendQuote} className={`${btn} w-full bg-[#25D366] text-slate-950 py-4 text-sm`}><MessageCircle />Send Details to WhatsApp for Custom Proposal</button>
          </Card>
        </Reveal>
      </section>

      {/* VIP */}
      <section id="vip" className="py-16 border-t border-amber-500/20">
        <Reveal className="max-w-7xl mx-auto px-4">
          <Card className="p-8 sm:p-12 rounded-3xl !border-amber-500/30 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Crown size={12} />Karachi VIP Growth Program</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">High-Volume Business? Join Our VIP Club</h2>
              <p className="text-slate-400 text-sm">Priority optimizations, a dedicated account manager, custom AI video shoots and 24/7 WhatsApp strategy support.</p>
            </div>
            <a href={wa("I'd like to apply for the VIP Client Program.")} target="_blank" rel="noreferrer" className={`${btn} bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-8 py-4 text-sm`}><Crown size={16} />Apply for VIP Retainer</a>
          </Card>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="pt-14 pb-10 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 pb-10 border-b border-slate-800">
          <div className="space-y-2"><div className="font-extrabold text-white text-sm">KARACHI BUSINESS GROWTH</div><p>Karachi's AI-powered digital marketing agency.</p>
            <p className="flex items-center gap-2"><MapPin size={14} className="text-emerald-400" />Gulshan-e-Maymar, Karachi</p>
            <a href="tel:03142763051" className="flex items-center gap-2 hover:text-emerald-400"><Phone size={14} className="text-emerald-400" />+92 314 2763051</a>
            <a href="mailto:karachibussinessgrowth@gmail.com" className="flex items-center gap-2 hover:text-emerald-400"><Mail size={14} className="text-emerald-400" />karachibussinessgrowth@gmail.com</a></div>
          <div><h4 className="text-white font-bold mb-3">Services</h4><ul className="space-y-2"><li>Meta, TikTok & Google Ads</li><li>Web, Apps & UI/UX</li><li>Google Map SEO Karachi</li><li>QR Codes & Catalogs</li></ul></div>
          <div className="space-y-3"><h4 className="text-white font-bold">Instant WhatsApp Consultation</h4>
            <a href={wa("Hi! I'm reaching out from your website.")} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold py-3 rounded-xl transition-colors"><MessageCircle size={16} />Chat on WhatsApp</a></div>
        </div>
        <p className="text-center pt-6 text-slate-500">© 2026 Karachi Business Growth. All rights reserved.</p>
      </footer>

      <a href={wa("Hi, I'd like a quick quote!")} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="kbg-pulse fixed bottom-6 right-6 z-50 bg-[#25D366] text-slate-950 p-4 rounded-full hover:scale-110 transition-transform"><MessageCircle size={28} /></a>
    </div>
  );
}
