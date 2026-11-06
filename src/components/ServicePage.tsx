import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Phone,
  MessageCircle,
  MapPin,
  Mail,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Zap,
} from "lucide-react";
import logoKbg from "../assets/logo-kbg-a.png";
import { servicePages, type ServicePageConfig } from "@/lib/service-pages";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const WA = "923142763051";
const wa = (t: string) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;

export default function ServicePage({ config }: { config: ServicePageConfig }) {
  const [menu, setMenu] = useState(false);
  const btn =
    "kbg-shine relative overflow-hidden inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-transform hover:scale-105";

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 antialiased overflow-x-hidden font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 backdrop-blur-xl bg-[#0B0F17]/85">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoKbg}
              alt="Karachi Business Growth"
              width={40}
              height={40}
              loading="lazy"
              className="w-10 h-10 rounded-xl shrink-0"
            />
            <div className="leading-tight">
              <div className="font-extrabold text-white">
                KARACHI <span className="text-emerald-400">BUSINESS GROWTH</span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-widest uppercase">
                Gulshan-e-Maymar • AI Agency
              </div>
            </div>
          </Link>
          <nav className="hidden lg:flex gap-6 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-emerald-400 transition-colors">
              Home
            </Link>
            {servicePages.map((s) => (
              <Link
                key={s.slug}
                to={s.slug}
                className={`transition-colors hover:text-emerald-400 ${
                  s.slug === config.slug ? "text-emerald-400" : ""
                }`}
              >
                {s.navLabel}
              </Link>
            ))}
          </nav>
          <div className="hidden sm:flex gap-3">
            <a
              href="tel:03142763051"
              className="border border-slate-700 hover:border-emerald-500 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Phone size={14} className="text-emerald-400" />
              0314 2763051
            </a>
            <a
              href={wa(config.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} bg-[#25D366] text-slate-950 px-5 py-2.5 !rounded-full text-xs`}
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
          <button className="lg:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <div className="lg:hidden px-6 py-4 space-y-3 bg-[#151C2C] border-t border-slate-800 animate-in slide-in-from-top-2">
            <Link to="/" onClick={() => setMenu(false)} className="block py-2 border-b border-slate-800">
              Home
            </Link>
            {servicePages.map((s) => (
              <Link
                key={s.slug}
                to={s.slug}
                onClick={() => setMenu(false)}
                className={`block py-2 border-b border-slate-800 ${
                  s.slug === config.slug ? "text-emerald-400" : ""
                }`}
              >
                {s.navLabel}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        <div className="kbg-float absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="kbg-float2 absolute top-1/3 right-10 w-[400px] h-[300px] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-6">
          <span className="inline-flex gap-2 items-center px-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-xs text-emerald-300">
            <Zap size={12} />
            {config.badge}
            <span className="text-slate-500">•</span>
            <MapPin size={12} className="text-red-400" />
            Karachi
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {config.h1Prefix} <span className="kbg-gradient">{config.h1Highlight}</span>
            {config.h1Suffix ? ` ${config.h1Suffix}` : ""}
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">{config.intro}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a
              href={wa(config.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-8 py-4`}
            >
              <MessageCircle />
              WhatsApp Quick Strategy
            </a>
            <a
              href="tel:03142763051"
              className={`${btn} bg-slate-900 border border-slate-700 text-white px-8 py-4`}
            >
              <Phone size={18} className="text-emerald-400" />
              Call 0314 2763051
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
              Why Karachi Businesses Choose Us
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">Benefits That Grow Your Business</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.benefits.map((b) => (
              <div key={b.title} className="kbg-card p-6 rounded-3xl h-full">
                <CheckCircle2 size={22} className="text-emerald-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                <p className="text-slate-400 text-sm">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="kbg-card p-8 sm:p-12 rounded-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-8">
              What's Included
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {config.included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-10">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {config.process.map((p, i) => (
              <div key={p.step} className="kbg-card p-8 rounded-3xl text-center h-full">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center font-bold text-sm mx-auto mb-4">
                  0{i + 1}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{p.step}</h3>
                <p className="text-slate-400 text-sm">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
              Common Questions
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Frequently Asked Questions
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {config.faqs.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`faq-${i}`}
                className="kbg-card rounded-2xl border-none px-6"
              >
                <AccordionTrigger className="text-left text-white font-bold hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 text-sm leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">{config.ctaTitle}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">{config.ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a
              href={wa(config.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} bg-[#25D366] text-slate-950 px-8 py-4`}
            >
              <MessageCircle />
              Chat on WhatsApp
            </a>
            <Link
              to="/"
              className={`${btn} bg-slate-900 border border-slate-700 text-white px-8 py-4`}
            >
              Explore All Services
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-14 pb-10 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 pb-10 border-b border-slate-800">
          <div className="space-y-2">
            <div className="font-extrabold text-white text-sm">KARACHI BUSINESS GROWTH</div>
            <p>Karachi's AI-powered digital marketing agency.</p>
            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-emerald-400" />
              Gulshan-e-Maymar, Karachi
            </p>
            <a href="tel:03142763051" className="flex items-center gap-2 hover:text-emerald-400">
              <Phone size={14} className="text-emerald-400" />
              +92 314 2763051
            </a>
            <a
              href="mailto:karachibussinessgrowth@gmail.com"
              className="flex items-center gap-2 hover:text-emerald-400"
            >
              <Mail size={14} className="text-emerald-400" />
              karachibussinessgrowth@gmail.com
            </a>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Services</h4>
            <ul className="space-y-2">
              {servicePages.map((s) => (
                <li key={s.slug}>
                  <Link to={s.slug} className="hover:text-emerald-400">
                    {s.schemaName}
                  </Link>
                </li>
              ))}
              <li>Web, Apps & UI/UX</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-bold">Instant WhatsApp Consultation</h4>
            <a
              href={wa("Hi! I'm reaching out from your website.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold py-3 rounded-xl transition-colors"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
        <p className="text-center pt-6 text-slate-500">© 2026 Karachi Business Growth. All rights reserved.</p>
      </footer>

      <a
        href={wa(config.waMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="kbg-pulse fixed bottom-6 right-6 z-50 bg-[#25D366] text-slate-950 p-4 rounded-full hover:scale-110 transition-transform"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
