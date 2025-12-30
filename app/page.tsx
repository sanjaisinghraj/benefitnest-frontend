"use client";

import React, { useEffect, useState } from "react";

export default function Page() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2500);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const modules = [
    { icon: "🏢", title: "Corporate Management" },
    { icon: "👥", title: "Employee & HR" },
    { icon: "📋", title: "Policy & Product" },
    { icon: "📝", title: "Enrollment" },
    { icon: "📄", title: "Claims Admin" },
    { icon: "💳", title: "E-Cards" },
    { icon: "🏥", title: "Network Hospitals" },
    { icon: "🧘", title: "Wellness" },
    { icon: "🏆", title: "Rewards" },
    { icon: "📊", title: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* GLOBAL ANIMATIONS */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes zoomFade {
          0% { transform: scale(0.6); opacity: 0; }
          40% { transform: scale(1); opacity: 1; }
          80% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }

        /* SCROLL REVEAL ANIMATIONS */
        .reveal-on-scroll {
          opacity: 0;
          transition: all 1s cubic-bezier(0.5, 0, 0, 1);
        }
        
        .reveal-flip {
          transform: perspective(1000px) rotateY(30deg) translateY(50px);
        }
        
        .reveal-flip.in-view {
          opacity: 1;
          transform: perspective(1000px) rotateY(0deg) translateY(0);
        }

        .reveal-pop {
          transform: scale(0.8) translateY(30px);
        }
        
        .reveal-pop.in-view {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .card-3d-hover {
          transition: transform 0.5s;
          transform-style: preserve-3d;
        }
        .card-3d-hover:hover {
          transform: translateY(-10px) rotateX(5deg);
        }
      `}</style>

      {/* BACKGROUND BLOBS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* WELCOME OVERLAY */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
          <h1
            className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"
            style={{ animation: "zoomFade 2.5s ease-in-out forwards" }}
          >
            BenefitNest
          </h1>
        </div>
      )}

      {/* NAVBAR */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md shadow-lg py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur opacity-20 group-hover:opacity-40 transition rounded-full"></div>
              <img
                src="/images/marketing/logo.png"
                alt="BenefitNest"
                className="h-10 relative z-10"
              />
            </div>
          </a>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              {
                name: "Platform",
                items: [
                  { label: "Employee Portal", emoji: "💻", desc: "Self-service hub" },
                  { label: "Admin Dashboard", emoji: "🎛️", desc: "Central control" },
                  { label: "Claims Engine", emoji: "⚙️", desc: "Automated processing" },
                ]
              },
              {
                name: "Features",
                items: [
                  { label: "Enrollments", emoji: "📝", desc: "Easy onboarding" },
                  { label: "Claims", emoji: "🏥", desc: "Fast settlements" },
                  { label: "Analytics", emoji: "📊", desc: "Data insights" },
                  { label: "AI Support", emoji: "🤖", desc: "24/7 assistance" },
                ]
              },
              {
                name: "Services",
                items: [
                  { label: "Implementation", emoji: "🚀", desc: "Quick setup" },
                  { label: "Support", emoji: "🤝", desc: "Expert help" },
                ]
              },
              {
                name: "Resources",
                items: [
                  { label: "Guides", emoji: "📚", desc: "Best practices" },
                  { label: "Reports", emoji: "📑", desc: "Industry trends" },
                ]
              },
            ].map((menu) => (
              <div key={menu.name} className="relative group">
                <button className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-blue-600 transition-all duration-300 py-2 group-hover:scale-105">
                  {menu.name}
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* MEGA MENU DROPDOWN */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-white/60 p-3 opacity-0 translate-y-4 scale-95 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-top z-50">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/80 backdrop-blur-2xl rotate-45 border-t border-l border-white/60"></div>
                  <div className="relative flex flex-col gap-1">
                    {menu.items.map((item, idx) => (
                      <a
                        key={item.label}
                        href="#"
                        className="group/item flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 border border-transparent hover:border-blue-50"
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        <span className="text-2xl filter drop-shadow-sm group-hover/item:scale-110 transition-transform duration-300">{item.emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover/item:text-blue-600 transition-colors">{item.label}</p>
                          <p className="text-[11px] font-medium text-slate-400 group-hover/item:text-slate-500 transition-colors">{item.desc}</p>
                        </div>
                        <div className="ml-auto opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">
                           <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                           </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://admin.benefitnest.space/admin"
              className="hidden sm:inline-block px-5 py-2.5 rounded-full font-semibold text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
            >
              Admin Login
            </a>
            <a
              href="#"
              className="px-6 py-2.5 rounded-full font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </header>

      <main className={`relative z-10 transition-opacity duration-[2000ms] ${showWelcome ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* HERO SECTION */}
        <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold shadow-sm animate-float">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Enterprise Employee Benefits Platform
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
                Run benefits <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  like never before.
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
                BenefitNest helps organisations manage employee insurance,
                benefits enrolment, claims, and analytics through a single
                secure, AI-powered platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href="#"
                  className="px-8 py-4 rounded-full bg-slate-900 text-white font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-center"
                >
                  Start Free Trial
                </a>
                <a
                  href="#features"
                  className="px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-center flex items-center justify-center gap-2 group"
                >
                  Explore Features
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>

            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-[3rem] transform rotate-6 scale-90 opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-pink-100 to-indigo-100 rounded-[3rem] transform -rotate-3 scale-95 opacity-60"></div>
              <img
                src="/images/marketing/hero-illustration.jpg"
                className="relative rounded-[2rem] shadow-2xl border-4 border-white transform hover:scale-[1.02] transition duration-500 object-cover w-full h-full"
                alt="Dashboard Preview"
              />
              
              {/* Floating Badge 1 */}
              <div className="absolute -left-8 bottom-1/4 bg-white/80 backdrop-blur p-3 rounded-xl shadow-xl border border-white/60 animate-float" style={{ animationDelay: '3s' }}>
                <p className="text-sm font-semibold text-slate-700">Innovation, perfectly packed.</p>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute -right-8 bottom-1/4 bg-white/80 backdrop-blur p-3 rounded-xl shadow-xl border border-white/60 animate-float" style={{ animationDelay: '4s' }}>
                <p className="text-sm font-semibold text-slate-700">Efficiency within.</p>
              </div>

              {/* Floating Messaging Boxes */}
              <div className="absolute -left-6 top-6 bg-white/80 backdrop-blur p-3 rounded-xl shadow-xl border border-white/60 animate-float" style={{ animationDelay: '1.1s' }}>
                <p className="text-sm font-semibold text-slate-700">Global quality. Local touch.</p>
              </div>
              <div className="absolute right-6 top-6 bg-white/80 backdrop-blur p-3 rounded-xl shadow-xl border border-white/60 animate-float" style={{ animationDelay: '1.7s' }}>
                <p className="text-sm font-semibold text-slate-700">Your brand, elegantly boxed.</p>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-white/80 backdrop-blur p-3 rounded-xl shadow-xl border border-white/60 animate-float" style={{ animationDelay: '2.9s' }}>
                <p className="text-sm font-semibold text-slate-700">Scalable in every detail.</p>
              </div>
            </div>
          </div>
        </section>

        {/* INFINITE SCROLLING MODULES */}
        <section className="py-10 bg-white border-y border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
             <p className="text-base md:text-lg font-extrabold text-slate-700 uppercase tracking-wider">ENGINEERED TO IMPRESS</p>
          </div>
          <div className="relative w-full overflow-hidden">
             <div className="flex animate-ticker w-[200%]">
               {[...modules, ...modules, ...modules].map((m, i) => (
                 <div key={i} className="flex items-center gap-3 px-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-lg font-bold text-slate-700 whitespace-nowrap">{m.title}</span>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* BENTO GRID FEATURES */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                All employee benefits. <br />
                <span className="text-blue-600">One secure platform.</span>
              </h2>
              <p className="text-xl text-slate-600">
                Centralise insurance, benefits, reimbursements, and engagement tools so HR teams and employees operate from one system of record.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 (Large - Total Reward) */}
              <div className="md:col-span-2 group relative bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 grid md:grid-cols-2 h-full">
                  <div className="p-10 flex flex-col justify-center">
                    <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-100 text-blue-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-slate-900 tracking-tight">Total Reward Statement</h3>
                    <p className="text-slate-600 mb-8 text-lg leading-relaxed">Give employees a complete view of their compensation package including salary, benefits, insurance, and perks.</p>
                    <a href="#" className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      Learn more <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </a>
                  </div>
                  <div className="relative h-full min-h-[320px] bg-slate-50 overflow-hidden">
                    <img 
                      src="/images/marketing/Dashboard showing salary, insurance, perks, and benefits.jpg" 
                      className="absolute inset-0 w-full h-full object-cover object-left-top transform group-hover:scale-105 transition-transform duration-700" 
                      alt="Total Reward Dashboard" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Feature 2 (HR Analytics) */}
              <div className="group relative bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-8 pt-10 relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 text-purple-600">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">HR Analytics</h3>
                  <p className="text-slate-600 text-base mb-6 leading-relaxed">Real-time insights into utilization, costs, and engagement.</p>
                </div>
                <div className="mt-auto relative h-64 w-full overflow-hidden bg-slate-50">
                  <img src="/images/marketing/feature-insights.jpg" className="w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-700" alt="Analytics" />
                </div>
              </div>

              {/* Feature 3 (Claims) */}
              <div className="group relative bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col">
                 <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="p-8 pt-10 relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-pink-100 text-pink-600">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">Claims & Reimbursements</h3>
                  <p className="text-slate-600 text-base mb-6 leading-relaxed">Paperless submission with AI-powered fraud detection.</p>
                </div>
                 <div className="mt-auto relative h-64 w-full overflow-hidden bg-slate-50">
                    <img src="/images/marketing/feature-reimbursement.jpg" className="w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-700" alt="Claims" />
                  </div>
              </div>

               {/* Feature 4 (Large - One Place) */}
               <div className="md:col-span-2 group relative bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 grid md:grid-cols-2 h-full">
                  <div className="p-10 flex flex-col justify-center">
                     <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                     </div>
                    <h3 className="text-3xl font-bold mb-4 text-slate-900 tracking-tight">One Place for Everything</h3>
                    <p className="text-slate-600 mb-8 text-lg leading-relaxed">From health insurance to gym memberships, manage it all in one unified dashboard.</p>
                    <ul className="space-y-4">
                      {['Unified Login', 'Mobile App Access', '24/7 Support'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-slate-700 font-medium text-lg">
                          <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative h-full min-h-[350px] bg-slate-50 overflow-hidden">
                    <img 
                      src="/images/marketing/feature-oneplace.jpg" 
                      className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700" 
                      alt="One Place Dashboard" 
                    />
                     <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE CARDS GRID */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">More features and services</h2>
            
            <div className="grid md:grid-cols-5 gap-6">
              {[
                { img: "platform-overview.jpg", title: "Plans & Flexibility", desc: "Configurable benefit structures with modular options across insurance, wellness, and rewards. Designed to adapt to every corporate need with seamless plan setup." },
                { img: "enterprise-analytics.jpg", title: "HR Analytics & Insights", desc: "Robust dashboards and reporting that turn employee data into actionable intelligence. Measure engagement, wellness, and program impact with clarity." },
                { img: "feature-comms.jpg", title: "Employee Support & Experience", desc: "Integrated surveys, communication tools, and a dedicated helpdesk for quick resolutions. Recognition, rewards, and feedback loops keep employees connected and valued." },
                { img: "overview-ai.jpg", title: "Technology & AI Assistance", desc: "Smart automation with AI‑driven recommendations, e‑cards, and guided workflows. Secure integrations with TPAs, vendors, and APIs ensure smooth operations." },
                { img: "enterprise-security.jpg", title: "Security & Integration", desc: "Enterprise‑grade data protection with SSO and compliance at the core. Unified access across marketplace, claims, and network hospitals — all in one trusted platform." },
              ].map((item, index) => (
                <div 
                  key={item.title} 
                  className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group reveal-on-scroll reveal-flip"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="h-40 mb-6 overflow-hidden rounded-xl">
                    <img src={`/images/marketing/${item.img}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-32 px-6 bg-slate-50">
           <div className="max-w-7xl mx-auto text-center">
             <h2 className="text-4xl font-bold mb-4 text-slate-900">How BenefitNest Works</h2>
             <p className="text-xl text-slate-600 mb-16">Everything connected — one employee benefits ecosystem.</p>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
               {[
                  { img: "overview-benefits.jpg", title: "Benefits" },
                  { img: "overview-wallet.jpg", title: "Wallet" },
                  { img: "overview-discounts.jpg", title: "Discounts" },
                  { img: "overview-recognition.jpg", title: "Recognition" },
                  { img: "overview-mobile.jpg", title: "Mobile" },
                  { img: "overview-ai.jpg", title: "AI Assistant" },
               ].map((item, index) => (
                 <div 
                   key={item.title} 
                   className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col items-center group card-3d-hover reveal-on-scroll reveal-pop"
                   style={{ transitionDelay: `${index * 100}ms` }}
                 >
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                      <img src={`/images/marketing/${item.img}`} className="h-16 w-auto object-contain relative z-10 transform group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                    </div>
                    <h5 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.title}</h5>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-800"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
              Ready to simplify employee benefits?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Built for modern enterprises. Scalable globally. Join thousands of happy employees today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="px-10 py-5 bg-white text-blue-700 rounded-full font-bold text-lg shadow-2xl hover:scale-105 hover:shadow-white/20 transition-all duration-300"
              >
                Book a Demo
              </a>
              <a
                href="#"
                className="px-10 py-5 bg-transparent border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src="/images/marketing/logo.png" alt="BenefitNest" className="h-8 grayscale opacity-50" />
              </div>
              <p className="text-sm leading-relaxed">
                The most comprehensive employee benefits platform for modern organizations.
              </p>
            </div>
            
            {[
              { title: "Company", links: ["Contact", "About Us"] },
              { title: "Legal", links: ["Privacy Policy", "Terms & Conditions", "Security"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-slate-200 font-bold mb-6">{col.title}</h4>
                <ul className="space-y-4 text-sm">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="hover:text-blue-400 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900 text-center text-sm">
            © {new Date().getFullYear()} BenefitNest. All rights reserved.
          </div>
        </footer>

      </main>
    </div>
  );
}
