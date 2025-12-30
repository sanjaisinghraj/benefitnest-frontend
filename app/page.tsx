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

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
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
            <span className={`font-bold text-xl tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
              BenefitNest
            </span>
          </a>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              {
                name: "Platform",
                items: ["Employee Portal", "Admin Dashboard", "Claims Engine"],
              },
              {
                name: "Features",
                items: ["Enrollments", "Claims", "Analytics", "AI Support"],
              },
              { name: "Services", items: ["Implementation", "Support"] },
              { name: "Resources", items: ["Guides", "Reports"] },
            ].map((menu) => (
              <div key={menu.name} className="relative group">
                <button className="flex items-center gap-1 font-medium text-slate-600 hover:text-blue-600 transition py-2">
                  {menu.name}
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* MEGA MENU DROPDOWN */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                  {menu.items.map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors"
                    >
                      {item}
                    </a>
                  ))}
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
              <div className="absolute -left-8 top-1/4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/50 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">🛡️</div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Claims Processed</p>
                    <p className="text-lg font-bold text-slate-900">98.5%</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute -right-8 bottom-1/3 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/50 animate-float" style={{ animationDelay: '2s' }}>
                 <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">👥</div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Active Employees</p>
                    <p className="text-lg font-bold text-slate-900">12,500+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INFINITE SCROLLING MODULES */}
        <section className="py-10 bg-white border-y border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
             <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Trusted by modern enterprises</p>
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
              {/* Feature 1 (Large) */}
              <div className="md:col-span-2 group relative bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-10 relative z-10">
                  <h3 className="text-2xl font-bold mb-4">Total Reward Statement</h3>
                  <p className="text-slate-600 mb-8 max-w-md">Give employees a complete view of their compensation package including salary, benefits, insurance, and perks.</p>
                  <img src="/images/marketing/feature-total-reward.jpg" className="w-full rounded-xl shadow-lg transform group-hover:scale-[1.02] transition-transform duration-500" alt="Total Reward" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-10 relative z-10 h-full flex flex-col">
                  <h3 className="text-2xl font-bold mb-4">HR Analytics</h3>
                  <p className="text-slate-600 mb-8">Real-time insights into utilization, costs, and engagement.</p>
                  <div className="mt-auto">
                    <img src="/images/marketing/feature-insights.jpg" className="w-full rounded-xl shadow-lg transform group-hover:scale-[1.02] transition-transform duration-500" alt="Analytics" />
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100">
                 <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="p-10 relative z-10 h-full flex flex-col">
                  <h3 className="text-2xl font-bold mb-4">Claims & Reimbursements</h3>
                  <p className="text-slate-600 mb-8">Paperless submission with AI-powered fraud detection.</p>
                  <div className="mt-auto">
                    <img src="/images/marketing/feature-reimbursement.jpg" className="w-full rounded-xl shadow-lg transform group-hover:scale-[1.02] transition-transform duration-500" alt="Claims" />
                  </div>
                </div>
              </div>

               {/* Feature 4 (Large) */}
               <div className="md:col-span-2 group relative bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-10 relative z-10 grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">One Place for Everything</h3>
                    <p className="text-slate-600 mb-6">From health insurance to gym memberships, manage it all in one unified dashboard.</p>
                    <ul className="space-y-3">
                      {['Unified Login', 'Mobile App Access', '24/7 Support'].map(item => (
                        <li key={item} className="flex items-center gap-2 text-slate-700 font-medium">
                          <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <img src="/images/marketing/feature-oneplace.jpg" className="w-full rounded-xl shadow-lg transform group-hover:scale-[1.02] transition-transform duration-500" alt="One Place" />
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
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { img: "feature-integrations.jpg", title: "Integrations", desc: "Seamlessly connect with HRMS, Payroll, and Insurer systems." },
                { img: "feature-comms.jpg", title: "Communications", desc: "Automated emails, WhatsApp alerts, and push notifications." },
                { img: "feature-support.jpg", title: "Expert Support", desc: "Dedicated account managers and 24/7 helpdesk." },
                { img: "feature-consulting.jpg", title: "Consulting", desc: "Strategic benefits advisory and plan design." },
              ].map((item) => (
                <div key={item.title} className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group">
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
               ].map((item) => (
                 <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col items-center">
                    <img src={`/images/marketing/${item.img}`} className="h-16 w-auto object-contain mb-4" alt={item.title} />
                    <h5 className="font-bold text-slate-700">{item.title}</h5>
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
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src="/images/marketing/logo.png" alt="BenefitNest" className="h-8 grayscale opacity-50" />
                <span className="font-bold text-slate-200 text-lg">BenefitNest</span>
              </div>
              <p className="text-sm leading-relaxed">
                The most comprehensive employee benefits platform for modern organizations.
              </p>
            </div>
            
            {[
              { title: "Platform", links: ["Employee Portal", "Admin Dashboard", "Claims Engine", "Analytics"] },
              { title: "Company", links: ["About Us", "Careers", "Press", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "Compliance"] },
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
