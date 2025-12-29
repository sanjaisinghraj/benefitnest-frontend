"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://benefitnest-backend.onrender.com";

// Default Dashboard Cards Configuration
const DEFAULT_CARDS = [
  {
    id: "corporate",
    title: "Corporate Management",
    description: "Onboard corporates, configure subdomains, branding, organizational hierarchy (global → location), and relationship mapping.",
    icon: "🏢",
    link: "/admin/corporates",
    color: "#2563eb",
  },
  {
    id: "masters",
    title: "Master Data Management",
    description: "Configure insurers, TPAs, policy types, job grades, business units, cities, states, relationships, gender, and network hospital types.",
    icon: "⚙️",
    link: "/admin/masters",
    color: "#0ea5e9",
  },
  {
    id: "portal",
    title: "Portal Customization",
    description: "Design client portals with logos, colors, fonts, landing page tiles, login branding, and preview before publish (web + mobile).",
    icon: "🎨",
    link: "/admin/portal-customization",
    color: "#ec4899",
  },
  {
    id: "employees",
    title: "Employee & HR Management",
    description: "Bulk upload, edit, delete employees. Configure HR roles (Global, Country, Location HR), dependent mapping, and eligibility rules.",
    icon: "👥",
    link: "/admin/employees",
    color: "#10b981",
  },
  {
    id: "policy",
    title: "Policy & Product Setup",
    description: "Configure GMC, GPA, GTL, OPD, parental, keyman, workmen comp, voluntary, top-up, riders. Manage SI slabs, premium matrix, and EMI options.",
    icon: "📋",
    link: "/admin/plan-config",
    color: "#f59e0b",
  },
  {
    id: "enrollment",
    title: "Enrollment Management",
    description: "Control enrollment windows (inception, new joiners, special), grace periods, eligibility filters, trade-off logic, and wallet panel setup.",
    icon: "📝",
    link: "/admin/enrollment",
    color: "#8b5cf6",
  },
  {
    id: "claims",
    title: "Claims Administration",
    description: "Configure intimation, reimbursement workflows, TPA API/SSO integration, document rules, escalation matrix, and live status tracking.",
    icon: "📄",
    link: "/admin/claims",
    color: "#dc2626",
  },
  {
    id: "ecards",
    title: "E-Card Management",
    description: "Manage e-card templates (template-based, API-based, upload-based), member/family downloads, alerts, daily sync, and failure reports.",
    icon: "💳",
    link: "/admin/ecards",
    color: "#06b6d4",
  },
  {
    id: "hospitals",
    title: "Network Hospital Management",
    description: "Configure hospital data via manual upload or API sync, filters by insurer/TPA/location, map integration (distance, ETA), blacklist sync.",
    icon: "🏥",
    link: "/admin/hospitals",
    color: "#059669",
  },
  {
    id: "wellness",
    title: "Wellness & Wellbeing",
    description: "Health assessments, mental wellbeing, AI coaching, financial literacy, budget calculators, retirement tips, and wellness partner integrations.",
    icon: "🧘",
    link: "/admin/wellness",
    color: "#14b8a6",
  },
  {
    id: "rewards",
    title: "Recognition & Rewards",
    description: "Peer-to-peer recognition wall, manager badges, points system, meal cards, vouchers, travel perks, redemption catalog, and engagement analytics.",
    icon: "🏆",
    link: "/admin/rewards",
    color: "#f97316",
  },
  {
    id: "incentives",
    title: "Sales Incentives",
    description: "Automated incentive programs for sales teams & brokers, leaderboards, gamified KPIs, contest creation, and mobile-first dashboards.",
    icon: "🎯",
    link: "/admin/incentives",
    color: "#ef4444",
  },
  {
    id: "loyalty",
    title: "Loyalty Programs",
    description: "Tiered loyalty for employees (Bronze/Silver/Gold), broker loyalty rewards for servicing & claims efficiency, insurer performance dashboards.",
    icon: "⭐",
    link: "/admin/loyalty",
    color: "#eab308",
  },
  {
    id: "surveys",
    title: "Surveys & Feedback",
    description: "Mood-o-meters, quick polls, anonymous feedback channels, AI sentiment analysis, and employee engagement analytics for HR.",
    icon: "📣",
    link: "/admin/surveys",
    color: "#a855f7",
  },
  {
    id: "communities",
    title: "Communities & Clubs",
    description: "Employee Resource Groups (ERGs), hobby clubs (fitness, books, travel), mentor-mentee matching, and gamified wellness communities.",
    icon: "👋",
    link: "/admin/communities",
    color: "#22c55e",
  },
  {
    id: "learning",
    title: "Learning & Development",
    description: "Micro-learning modules, insurance literacy, gamified skill challenges, compliance training, and LMS integrations (Workday, SAP, Darwinbox).",
    icon: "🎓",
    link: "/admin/learning",
    color: "#3b82f6",
  },
  {
    id: "csr",
    title: "CSR & Volunteering",
    description: "Corporate Social Responsibility initiatives, employee volunteering programs, donation matching, impact tracking, and CSR dashboards.",
    icon: "💚",
    link: "/admin/csr",
    color: "#16a34a",
  },
  {
    id: "marketplace",
    title: "Marketplace Settings",
    description: "Manage vendor onboarding, pricing tiers, catalog setup, API/SSO integrations, and corporate-specific visibility rules.",
    icon: "🛒",
    link: "/admin/marketplace-settings",
    color: "#7c3aed",
  },
  {
    id: "reports",
    title: "Reports & AI Insights",
    description: "Claims analytics, predictive attrition, fraud detection, personalized nudges, engagement metrics, compliance alerts. Export CSV, PDF, API.",
    icon: "📊",
    link: "/admin/reports",
    color: "#ec4899",
  },
  {
    id: "audit",
    title: "Audit & Compliance",
    description: "Immutable audit logs, privacy policy, terms & disclaimers, consent templates, GDPR/HIPAA toggles, versioning, and regulatory exports.",
    icon: "⚖️",
    link: "/admin/audit",
    color: "#6366f1",
  },
  {
    id: "system",
    title: "System Configuration",
    description: "Configure email/SMS templates, notification preferences, API keys, SSO providers, and feature toggles per tenant.",
    icon: "🔧",
    link: "/admin/system",
    color: "#64748b",
  },
  {
    id: "mailer",
    title: "Mailer & Communications",
    description: "Configure enrollment reminders, claim alerts, custom templates per tenant, test-send logs, and delivery status tracking.",
    icon: "📧",
    link: "/admin/mailer",
    color: "#0284c7",
  },
  {
    id: "roles",
    title: "Roles & Permissions",
    description: "Define module-level permissions, create roles (Admin, Broker, HR, Insurer), configure MFA, login expiry, and OTP rules.",
    icon: "🔐",
    link: "/admin/roles",
    color: "#9333ea",
  },
  {
    id: "partners",
    title: "Broker & Insurer Panel",
    description: "Enable broker dashboards for client servicing, insurer dashboards for policy/claims, controlled tenant access, partner branding.",
    icon: "🤝",
    link: "/admin/partners",
    color: "#0891b2",
  },
  {
    id: "retention",
    title: "Data Retention",
    description: "Configure retention rules for claims, enrollments, logs. Set auto-archive logic and GDPR/HIPAA compliance toggles.",
    icon: "🗄️",
    link: "/admin/retention",
    color: "#78716c",
  },
];

// --- Sortable Item Component ---
const SortableItem = ({ id, card, onClick, darkMode }: { id: string, card: any, onClick: () => void, darkMode: boolean }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-xl border p-6 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1
        ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500'}
      `}
    >
      {/* Top Color Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: card.color }}
      />

      <div className="mb-4 text-4xl">{card.icon}</div>
      <h3 className={`mb-2 text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {card.title}
      </h3>
      <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {card.description}
      </p>
    </div>
  );
};

const AdminDashboard = () => {
  const router = useRouter();
  
  // State
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [hiddenCardIds, setHiddenCardIds] = useState<string[]>([]);
  const [showTileMenu, setShowTileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // User Profile State
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Load Preferences
  useEffect(() => {
    const savedOrder = localStorage.getItem("admin_dashboard_order");
    const savedHidden = localStorage.getItem("admin_dashboard_hidden");
    const savedTheme = localStorage.getItem("admin_theme");

    if (savedOrder) {
      const orderIds = JSON.parse(savedOrder);
      // Sort DEFAULT_CARDS based on saved order
      const sortedCards = [...DEFAULT_CARDS].sort((a, b) => {
        const indexA = orderIds.indexOf(a.id);
        const indexB = orderIds.indexOf(b.id);
        // If id not found (new card added), put at end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      setCards(sortedCards);
    }

    if (savedHidden) {
      setHiddenCardIds(JSON.parse(savedHidden));
    }

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save Preferences
  useEffect(() => {
    localStorage.setItem("admin_dashboard_order", JSON.stringify(cards.map(c => c.id)));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem("admin_dashboard_hidden", JSON.stringify(hiddenCardIds));
  }, [hiddenCardIds]);

  useEffect(() => {
    localStorage.setItem("admin_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth & Profile Logic (Existing)
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAdminProfile({
          name: payload.name || payload.username || "Administrator",
          email: payload.email || "admin@benefitnest.space",
          role: payload.role || "Super Admin",
        });
      } catch {
        setAdminProfile({
          name: "Administrator",
          email: "admin@benefitnest.space",
          role: "Super Admin",
        });
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      document.cookie = "admin_token=; path=/; max-age=0";
      window.location.href = "https://www.benefitnest.space";
    }
  };

  // Drag & Drop Handlers
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Require 8px movement to start drag (allows clicking)
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleCardVisibility = (id: string) => {
    setHiddenCardIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const visibleCards = cards.filter(c => !hiddenCardIds.includes(c.id));

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* Background Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <div className={`absolute top-20 left-10 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${darkMode ? 'bg-purple-900' : 'bg-purple-300'}`}></div>
         <div className={`absolute top-40 right-10 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${darkMode ? 'bg-blue-900' : 'bg-blue-300'}`}></div>
         <div className={`absolute -bottom-8 left-20 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${darkMode ? 'bg-pink-900' : 'bg-pink-300'}`}></div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 border-b shadow-sm backdrop-blur-md ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'}`}>
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <img
                src="/images/marketing/logo.png"
                alt="BenefitNest"
                className="h-10 object-contain"
              />
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
              title="Toggle Theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <span className="text-xl">👤</span>
                <span>Admin</span>
                <span className="text-xs">▼</span>
              </button>

              {showProfileMenu && (
                <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                   <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{adminProfile?.name}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{adminProfile?.email}</p>
                   </div>
                   <div className="p-2">
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md font-medium transition-colors">
                        Logout
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-10 z-10">
        
        {/* Page Title & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your platform settings and configurations</p>
          </div>

          {/* Manage Tiles Dropdown */}
          <div className="relative">
             <button
                onClick={() => setShowTileMenu(!showTileMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium shadow-sm transition-all ${
                  darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
             >
               <span>⚙️ Customize Tiles</span>
               <span>{showTileMenu ? '▲' : '▼'}</span>
             </button>

             {showTileMenu && (
                <div className={`absolute top-full right-0 mt-2 w-72 rounded-xl shadow-2xl border z-50 max-h-[400px] overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                   <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Manage Visibility</h3>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Check/Uncheck to show/hide tiles</p>
                   </div>
                   <div className="p-2 space-y-1">
                      {cards.map(card => (
                        <label key={card.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                           <input 
                              type="checkbox" 
                              checked={!hiddenCardIds.includes(card.id)} 
                              onChange={() => toggleCardVisibility(card.id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                           />
                           <span className="text-xl">{card.icon}</span>
                           <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{card.title}</span>
                        </label>
                      ))}
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* Draggable Grid */}
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={visibleCards.map(c => c.id)} 
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleCards.map((card) => (
                <SortableItem 
                   key={card.id} 
                   id={card.id} 
                   card={card} 
                   onClick={() => router.push(card.link)}
                   darkMode={darkMode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

      </main>

      {/* Tailwind Animations for Blob */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
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
      `}</style>
    </div>
  );
};

export default AdminDashboard;
