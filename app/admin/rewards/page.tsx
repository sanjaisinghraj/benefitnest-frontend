"use client";

import React, { useState, useEffect } from 'react';
import { 
  Gift, Award, Heart, Smile, Trophy, Globe, Smartphone, Shield, Zap, Users, 
  CheckCircle, TrendingUp, MessageCircle, Share2, Coffee, Briefcase, Calendar, 
  Star, Lock, BookOpen, ArrowRight, Menu, X, ChevronDown, ThumbsUp, Medal,
  CreditCard, Plane, GraduationCap, Sun, Wallet, Link as LinkIcon, Database,
  Layout, Activity, MessageSquare
} from 'lucide-react';

export default function RewardsPage() {
  const [showProblem, setShowProblem] = useState(true);
  const [activeMobileMenu, setActiveMobileMenu] = useState(false);

  // Animation loop for Problem vs Solution
  useEffect(() => {
    const interval = setInterval(() => {
      setShowProblem(prev => !prev);
    }, 4000); // Toggle every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-x-hidden">
      
      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <a href="/admin/dashboard" className="flex items-center gap-2">
            <img
              src="/images/marketing/logo.png"
              alt="BenefitNest"
              className="h-10"
            />
          </a>

          {/* MENU (Desktop) */}
          <nav className="hidden md:flex gap-8 font-semibold text-gray-800">
            {[
              { name: "Platform", items: ["Employee Portal", "Admin Dashboard", "Claims Engine"] },
              { name: "Features", items: ["Enrollments", "Claims", "Analytics", "AI Support"] },
              { name: "Services", items: ["Implementation", "Support", "Consulting"] },
              { name: "Customers", items: ["Mid-size Firms", "Large Enterprises"] },
              { name: "Resources", items: ["Guides", "Reports", "Blogs"] },
            ].map((menu) => (
              <div key={menu.name} className="relative group">
                <span className="cursor-pointer hover:text-blue-600 flex items-center gap-1">
                  {menu.name} <ChevronDown className="w-4 h-4" />
                </span>
                <div className="absolute left-0 mt-3 w-56 bg-white border rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                  {menu.items.map((i) => (
                    <a key={i} href="#" className="block px-4 py-3 text-sm hover:bg-blue-50 text-gray-700">
                      {i}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="hidden md:flex gap-3">
             <a href="/admin/dashboard" className="px-4 py-2 rounded-lg font-semibold border hover:bg-gray-100 transition">
              Back to Dashboard
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setActiveMobileMenu(!activeMobileMenu)}>
            {activeMobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* HERO SECTION: Problems vs Solutions */}
      <section className="relative py-24 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: Common Problems (Fades Out) / Intro Text */}
          <div className="relative z-10">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6">
              REWARDS & RECOGNITION
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-gray-900">
              Build a Culture of <br/>
              <span className="text-blue-600">Appreciation</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Transform how you recognize, reward, and retain your top talent with a platform employees actually love.
            </p>
            
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition">
                Start for Free
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" /> See it in action
              </button>
            </div>
          </div>

          {/* RIGHT: Animation Box */}
          <div className="relative h-[500px] w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 overflow-hidden flex flex-col justify-center">
            
            {/* PROBLEM STATE */}
            <div className={`absolute inset-0 p-10 flex flex-col justify-center transition-all duration-1000 ease-in-out ${showProblem ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}>
               <div className="mb-6 flex items-center gap-3 text-red-500">
                  <X className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">The Old Way</h3>
               </div>
               <ul className="space-y-6">
                 {[
                   "Employees feel unnoticed",
                   "Recognition is manual & inconsistent",
                   "Rewards are one-size-fits-all",
                   "No visibility into impact or ROI",
                   "Disconnected tools & spreadsheets"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-4 text-gray-500 text-lg">
                     <div className="w-2 h-2 rounded-full bg-red-300" />
                     {item}
                   </li>
                 ))}
               </ul>
            </div>

            {/* SOLUTION STATE */}
            <div className={`absolute inset-0 p-10 flex flex-col justify-center transition-all duration-1000 ease-in-out ${!showProblem ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
               <div className="mb-6 flex items-center gap-3 text-green-600">
                  <CheckCircle className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">The BenefitNest Way</h3>
               </div>
               <ul className="space-y-6">
                 {[
                   "Real-time recognition",
                   "Structured reward programs",
                   "Global & personalized rewards",
                   "Automated milestones",
                   "Engagement analytics"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-4 text-gray-800 font-medium text-lg">
                     <div className="p-1 rounded-full bg-green-100 text-green-600">
                       <CheckCircle className="w-4 h-4" />
                     </div>
                     {item}
                   </li>
                 ))}
               </ul>
            </div>

            {/* Progress Bar Animation */}
            <div className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-[4000ms] ease-linear" style={{ width: showProblem ? '0%' : '100%', opacity: showProblem ? 0 : 1 }}></div>
          </div>

        </div>
      </section>

      {/* 3. ALL-IN-ONE RECOGNITION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Recognition Experience</span>
            <h2 className="text-4xl font-bold mt-2 text-gray-900">Recognition That’s Instant, Social & Meaningful</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              { icon: <Users className="w-6 h-6" />, title: "Peer-to-Peer Recognition", desc: "Empower employees to celebrate each other's wins instantly." },
              { icon: <Award className="w-6 h-6" />, title: "Manager Recognition", desc: "Enable leaders to spot and reward high performance." },
              { icon: <Medal className="w-6 h-6" />, title: "Value-Based Badges", desc: "Align recognition with your core company values." },
              { icon: <MessageSquare className="w-6 h-6" />, title: "Public Feed", desc: "A social wall where celebrations happen in real-time." },
              { icon: <Smile className="w-6 h-6" />, title: "Emojis & GIFs", desc: "Make recognition fun and expressive." },
              { icon: <Lock className="w-6 h-6" />, title: "Private Appreciation", desc: "Option for 1-on-1 feedback when discretion is needed." },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 border border-gray-100 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition bg-gray-50/50">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* UX Detail / Mobile */}
          <div className="mt-20 grid md:grid-cols-2 gap-12 items-center bg-blue-600 rounded-3xl p-12 text-white overflow-hidden relative">
            <div className="relative z-10">
               <h3 className="text-3xl font-bold mb-6">Designed for the Modern Workforce</h3>
               <ul className="space-y-4">
                 <li className="flex items-center gap-3"><Smartphone className="w-5 h-5 opacity-80" /> Mobile-first swipeable feed</li>
                 <li className="flex items-center gap-3"><Zap className="w-5 h-5 opacity-80" /> One-tap instant recognition</li>
                 <li className="flex items-center gap-3"><MessageCircle className="w-5 h-5 opacity-80" /> Voice-to-text messages</li>
                 <li className="flex items-center gap-3"><Users className="w-5 h-5 opacity-80" /> Filter by team, value, or location</li>
               </ul>
            </div>
            <div className="relative z-10 flex justify-center">
               <div className="w-64 bg-white rounded-3xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
                  <div className="h-4 bg-gray-100 rounded-full w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-20 bg-blue-50 rounded-xl p-3">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                           <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                           <div className="h-2 bg-blue-100 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                    <div className="h-20 bg-gray-50 rounded-xl p-3">
                       <div className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                           <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                           <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
               <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REWARDS THAT PEOPLE ACTUALLY WANT */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
            <span className="text-green-600 font-bold tracking-wider uppercase text-sm">Global Rewards Marketplace</span>
            <h2 className="text-4xl font-bold mt-2 text-gray-900">Rewards Without Limits</h2>
            <p className="mt-4 text-xl text-gray-600">Let employees choose what matters to them.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { icon: <CreditCard className="w-8 h-8" />, label: "Digital Gift Cards", color: "bg-purple-100 text-purple-600" },
               { icon: <Wallet className="w-8 h-8" />, label: "Cash / Payroll", color: "bg-green-100 text-green-600" },
               { icon: <Gift className="w-8 h-8" />, label: "Merchandise", color: "bg-red-100 text-red-600" },
               { icon: <Plane className="w-8 h-8" />, label: "Experiences", color: "bg-blue-100 text-blue-600" },
               { icon: <GraduationCap className="w-8 h-8" />, label: "Learning", color: "bg-yellow-100 text-yellow-600" },
               { icon: <Sun className="w-8 h-8" />, label: "Extra PTO", color: "bg-orange-100 text-orange-600" },
               { icon: <Heart className="w-8 h-8" />, label: "Charity", color: "bg-pink-100 text-pink-600" },
               { icon: <Award className="w-8 h-8" />, label: "Custom Swag", color: "bg-teal-100 text-teal-600" },
             ].map((reward, i) => (
               <div key={i} className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition group cursor-pointer">
                 <div className={`p-4 rounded-full mb-4 ${reward.color} group-hover:scale-110 transition`}>
                   {reward.icon}
                 </div>
                 <span className="font-semibold text-gray-800 text-center">{reward.label}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 5. PROGRAMS FOR EVERY MOMENT */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Programs for Every Moment</h2>
              <p className="text-gray-600 text-lg mb-8">
                From daily thank-yous to major career milestones, we cover the entire employee lifecycle.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-blue-600"/> Admin Superpowers</h4>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Rule-based automation</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Budget caps & wallets</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Approval workflows</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Country-wise policies</li>
                </ul>
              </div>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 "Spot Awards", "Performance Awards", "Sales Incentives", "Employee of the Month",
                 "Work Anniversaries", "Birthday Celebrations", "Leadership Awards", "Innovation Awards",
                 "Team Achievements", "Long Service Awards"
               ].map((program, i) => (
                 <div key={i} className="p-4 border border-gray-100 rounded-xl hover:bg-blue-50 transition flex items-center justify-between group cursor-default">
                    <span className="font-medium text-gray-800">{program}</span>
                    <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. BUILT FOR SCALE */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
             <h2 className="text-4xl font-bold">Built for Scale, Automation & Control</h2>
           </div>
           
           <div className="grid md:grid-cols-2 gap-16">
              {/* Capabilities */}
              <div>
                 <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                   <Lock className="w-6 h-6 text-blue-400" /> Enterprise Capabilities
                 </h3>
                 <div className="space-y-6">
                    {[
                      { title: "Automated Milestones", desc: "Never miss a birthday or anniversary again." },
                      { title: "Budget Management", desc: "Allocate and track budgets by department or manager." },
                      { title: "Tax & Compliance", desc: "Built-in handling of taxable vs non-taxable rewards." },
                      { title: "Role-Based Access", desc: "Granular permissions for admins, managers, and employees." }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-1 h-full bg-blue-600 rounded-full opacity-50"></div>
                        <div>
                          <h4 className="font-bold text-lg">{item.title}</h4>
                          <p className="text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Analytics */}
              <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700">
                 <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                   <Activity className="w-6 h-6 text-green-400" /> Deep Analytics
                 </h3>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-700 p-4 rounded-xl">
                       <span className="text-gray-400 text-sm">Participation</span>
                       <div className="text-3xl font-bold text-white mt-1">94%</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-xl">
                       <span className="text-gray-400 text-sm">Redemption</span>
                       <div className="text-3xl font-bold text-white mt-1">87%</div>
                    </div>
                 </div>
                 <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"/> Engagement score correlation</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"/> Department insights</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"/> Budget utilization trends</li>
                 </ul>
              </div>
           </div>
        </div>
      </section>

      {/* 7. INTEGRATIONS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-3xl font-bold mb-4">Integrates With Your Workday</h2>
           <p className="text-gray-600 mb-12">Recognition where your employees already work.</p>
           
           <div className="flex flex-wrap justify-center gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos */}
              {["Slack", "MS Teams", "Workday", "Outlook", "Gmail", "Okta", "Azure AD"].map((logo) => (
                <div key={logo} className="px-6 py-3 border rounded-full font-bold text-gray-500 hover:text-blue-600 hover:border-blue-600 transition cursor-default">
                  {logo}
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 8. GLOBAL & 9. TRUST */}
      <section className="py-24 bg-blue-50">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
            
            {/* GLOBAL */}
            <div>
               <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                 <Globe className="w-8 h-8 text-blue-600" /> Global, Mobile-First
               </h2>
               <div className="grid grid-cols-2 gap-6">
                 <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h4 className="font-bold mb-2">Multi-Currency</h4>
                    <p className="text-sm text-gray-600">Rewards converted to local purchasing power.</p>
                 </div>
                 <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h4 className="font-bold mb-2">Multi-Language</h4>
                    <p className="text-sm text-gray-600">Platform adapts to user's local language.</p>
                 </div>
                 <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h4 className="font-bold mb-2">Frontline Ready</h4>
                    <p className="text-sm text-gray-600">SMS & QR code access for deskless staff.</p>
                 </div>
                 <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h4 className="font-bold mb-2">Time-Zone Aware</h4>
                    <p className="text-sm text-gray-600">Notifications arrive at appropriate times.</p>
                 </div>
               </div>
            </div>

            {/* TRUST */}
            <div>
               <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                 <Shield className="w-8 h-8 text-blue-600" /> Trust & Security
               </h2>
               <div className="space-y-4">
                 {[
                   "GDPR & SOC2 Compliant",
                   "ISO 27001 Certified Data Centers",
                   "End-to-End Data Encryption",
                   "Comprehensive Audit Logs",
                   "SSO & MFA Support"
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                     <CheckCircle className="w-5 h-5 text-green-500" />
                     <span className="font-medium text-gray-800">{item}</span>
                   </div>
                 ))}
               </div>
            </div>

         </div>
      </section>

      {/* 10. KNOWLEDGE HUB */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <h2 className="text-3xl font-bold mb-10 text-center">Knowledge, Resources & Community</h2>
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "HR Glossary", desc: "Common terms and definitions." },
                { title: "Program Playbooks", desc: "Guides to launching successful programs." },
                { title: "Case Studies", desc: "How top companies improved retention." }
              ].map((item, i) => (
                <div key={i} className="group p-6 border rounded-2xl hover:border-blue-500 transition cursor-pointer">
                   <BookOpen className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-4 transition" />
                   <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                   <p className="text-gray-600 mb-4">{item.desc}</p>
                   <span className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Read More <ArrowRight className="w-4 h-4" /></span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="py-32 bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-center relative overflow-hidden">
         <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h2 className="text-5xl font-bold mb-6">Start Building a Culture of Appreciation Today</h2>
            <p className="text-xl text-blue-100 mb-10">Used by organizations that believe people are their greatest asset.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <button className="px-10 py-5 bg-white text-blue-800 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition">
                 Book a Demo
               </button>
               <button className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition">
                 Talk to an Expert
               </button>
            </div>
         </div>
         {/* Decorative Background */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl mix-blend-overlay"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-400 rounded-full blur-3xl mix-blend-overlay"></div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-8">
            <img src="/images/marketing/logo.png" alt="BenefitNest" className="h-8 opacity-80 grayscale" />
          </div>
          <p className="mb-4">© {new Date().getFullYear()} BenefitNest. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm">
             <a href="#" className="hover:text-white transition">Privacy Policy</a>
             <a href="#" className="hover:text-white transition">Terms of Service</a>
             <a href="#" className="hover:text-white transition">Security</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
