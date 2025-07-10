"use client";

// apps/web/app/page.tsx

import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import IdeaPickerDemo from "./components/IdeaPickerDemo";
import TrendingIdeas from "./components/TrendingIdeas";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Achievements from "./components/Achievements";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";

const features = [
  {
    title: "AI-Powered Market Research",
    description: "Analyze market gaps, competitor landscapes, and revenue potential using real-time data from 50+ sources.",
    icon: "📊",
    metric: "50+ data sources",
  },
  {
    title: "Intelligent Code Generation",
    description: "Generate production-ready SaaS applications with modern tech stacks, automated testing, and deployment pipelines.",
    icon: "⚡",
    metric: "15 min to MVP",
  },
  {
    title: "Automated Growth Engine",
    description: "Deploy, market, and optimize your SaaS with AI-driven analytics, A/B testing, and conversion optimization.",
    icon: "🚀",
    metric: "95% automation",
  },
];

const processSteps = [
  { step: "Market Analysis", time: "5 min", status: "completed", detail: "Analyzing market size, competition, and revenue potential" },
  { step: "Product Strategy", time: "10 min", status: "completed", detail: "Defining feature set, pricing, and go-to-market strategy" },
  { step: "MVP Development", time: "45 min", status: "in-progress", detail: "Generating codebase with React, Node.js, and PostgreSQL" },
  { step: "Deployment", time: "15 min", status: "pending", detail: "Deploying to AWS with CI/CD pipeline" },
  { step: "Launch & Optimize", time: "Ongoing", status: "pending", detail: "Marketing automation and performance optimization" },
];

const testimonials = [
  {
    name: "David Chen",
    role: "CTO",
    company: "TechFlow Solutions",
    quote: "We reduced our MVP development time from 6 months to 2 weeks. The code quality is production-ready.",
    avatar: "D",
    metrics: { time: "2 weeks", cost: "80% less", quality: "Production-ready" },
  },
  {
    name: "Sarah Williams",
    role: "Product Manager",
    company: "DataViz Analytics",
    quote: "The market research capabilities are incredible. We identified a $50M opportunity we missed.",
    avatar: "S",
    metrics: { opportunity: "$50M", accuracy: "94%", speed: "5x faster" },
  },
  {
    name: "Michael Rodriguez",
    role: "Founder",
    company: "CloudSync",
    quote: "From idea to $25K MRR in 3 months. The automation handles everything we can't.",
    avatar: "M",
    metrics: { mrr: "$25K", time: "3 months", automation: "90%" },
  },
];

const achievements = [
  { name: "First Deployment", description: "Successfully deploy your first SaaS product", icon: "🚀", unlocked: true, progress: 100 },
  { name: "Market Validation", description: "Achieve product-market fit with 100+ users", icon: "✅", unlocked: true, progress: 100 },
  { name: "Revenue Milestone", description: "Generate $1K+ monthly recurring revenue", icon: "💰", unlocked: true, progress: 85 },
  { name: "Scale Ready", description: "Optimize for 10x growth and expansion", icon: "📈", unlocked: false, progress: 60 },
  { name: "Enterprise Ready", description: "Deploy enterprise-grade infrastructure", icon: "🏢", unlocked: false, progress: 0 },
];

const faqs = [
  {
    q: "How does CommandCore differ from no-code platforms?",
    a: "Unlike no-code tools, CommandCore generates production-ready code with modern tech stacks, automated testing, and enterprise-grade infrastructure. You own your codebase and can customize everything.",
  },
  {
    q: "What tech stack do you generate?",
    a: "React/Next.js frontend, Node.js/Express backend, PostgreSQL database, AWS deployment, Docker containers, and automated CI/CD pipelines. All code is production-ready and follows industry best practices.",
  },
  {
    q: "Can I customize the generated applications?",
    a: "Absolutely. You have full access to the source code and can modify everything from UI components to business logic. Our AI can also help you extend functionality based on your requirements.",
  },
  {
    q: "How do you ensure code quality and security?",
    a: "All generated code follows industry standards with automated testing, security scanning, and best practices. We use enterprise-grade patterns and frameworks that scale to millions of users.",
  },
  {
    q: "What's your pricing model?",
    a: "Free during beta with full feature access. Future pricing will be usage-based with enterprise options for high-volume deployments.",
  },
];

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Demo", href: "#demo" },
  { label: "Features", href: "#features" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const saasIdeas = [
  {
    name: "AI Analytics Dashboard",
    description: "A real-time dashboard for business metrics powered by AI.",
    previewImg: "/public/globe.svg",
    code: `// Next.js + Chart.js\nexport default function Dashboard() {\n  return <Chart data={...} />;\n}`,
  },
  {
    name: "Subscription Billing",
    description: "Automated billing and invoicing for SaaS products.",
    previewImg: "/public/window.svg",
    code: `// Node.js + Stripe\napp.post('/charge', ...);`,
  },
  {
    name: "Team Collaboration Tool",
    description: "A Slack-like chat and project management suite.",
    previewImg: "/public/file.svg",
    code: `// React + Socket.io\n<ChatRoom users={...} />`,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    description: "Full access during beta",
    features: ["Unlimited ideas", "Community support", "Deployment automation"],
    cta: "Join Free Beta",
  },
  {
    name: "Pro",
    price: "$99/mo",
    description: "For growing startups",
    features: ["Up to 3 active projects", "100k API calls", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "Contact Us",
    description: "Scale without limits",
    features: ["Unlimited projects", "Custom infrastructure", "Dedicated support"],
    cta: "Contact Sales",
  },
];

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("#home");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Section refs for smooth scroll and reveal
  const sectionRefs = {
    home: useRef<HTMLElement>(null),
    demo: useRef<HTMLElement>(null),
    features: useRef<HTMLElement>(null),
    process: useRef<HTMLElement>(null),
    pricing: useRef<HTMLElement>(null),
    faq: useRef<HTMLElement>(null),
  };

  // Smooth scroll to section
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    sectionRefs[id as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Active tab highlighting based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const offsets = Object.entries(sectionRefs).map(([id, ref]) => ({
        id: `#${id}`,
        top: ref.current?.getBoundingClientRect().top ?? 9999,
      }));
      const found = offsets.reduce((acc, curr) => (curr.top <= 80 ? curr.id : acc), "#home");
      setActiveTab(found);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section reveal on scroll
  useEffect(() => {
    const revealSections = () => {
      Object.values(sectionRefs).forEach(ref => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          ref.current.classList.add("section-visible");
        }
      });
    };
    window.addEventListener("scroll", revealSections, { passive: true });
    revealSections();
    return () => window.removeEventListener("scroll", revealSections);
  }, []);

  // Modal: close on ESC or background click, focus trap
  useEffect(() => {
    if (!showAuth) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowAuth(false);
    };
    document.addEventListener("keydown", handleKey);
    // Focus trap
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !focusable) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", trap);
    first?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("keydown", trap);
    };
  }, [showAuth]);

  // Modal: close on background click
  const handleModalBg = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setShowAuth(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Sticky Navbar */}
      <Navbar navLinks={navLinks} activeTab={activeTab} handleNav={handleNav} />

      {/* Mobile nav */}
      <div className="flex md:hidden justify-center gap-4 py-2 bg-black bg-opacity-70 sticky top-[64px] z-40" aria-label="Mobile Navigation">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={e => handleNav(e, link.href)}
            className={`hover:text-blue-400 transition-colors cursor-pointer text-base px-2 py-1 rounded ${activeTab === link.href ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white" : ""}`}
            aria-current={activeTab === link.href ? "page" : undefined}
            aria-label={link.label}
          >
            {link.label}
          </a>
        ))}
        <a
          href="/dashboard"
          className="hover:text-blue-400 transition-colors cursor-pointer text-base px-2 py-1 rounded"
          aria-label="Dashboard"
        >
          Dashboard
        </a>
      </div>

      {/* Hero Section */}
      <Hero
        ref={sectionRefs.home}
        onStart={() => setShowOnboarding(true)}
        onWatchDemo={() => sectionRefs.demo.current?.scrollIntoView({ behavior: "smooth" })}
      />

      {/* Interactive Demo Section */}
      <IdeaPickerDemo ref={sectionRefs.demo} ideas={saasIdeas} processSteps={processSteps} processRef={sectionRefs.process} />

      {/* Trending Ideas fetched live */}
      <TrendingIdeas />

      {/* Features */}
      <Features ref={sectionRefs.features} features={features} />

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />

      {/* Achievements */}
      <Achievements achievements={achievements} />

      {/* Pricing */}
      <Pricing ref={sectionRefs.pricing} plans={pricingPlans} />

      {/* FAQ */}
      <FAQ ref={sectionRefs.faq} faqs={faqs} />
    </div>
  );
}