'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'https://benefitnest-backend.onrender.com';

interface WellnessConfig {
  wellness_enabled: boolean;
  health_risk_assessment_enabled: boolean;
  mental_wellbeing_enabled: boolean;
  ai_wellness_coach_enabled: boolean;
  personalized_plans_enabled: boolean;
  knowledge_hub_enabled: boolean;
  preventive_care_enabled: boolean;
  financial_wellbeing_enabled: boolean;
  habit_tracking_enabled: boolean;
  journaling_enabled: boolean;
}

interface UserConsent {
  consent_given: boolean;
  consent_date: string;
}

const wellnessModules = [
  {
    key: 'health_risk_assessment_enabled',
    name: 'Health Risk Assessment',
    description: 'Complete a comprehensive health questionnaire to understand your health profile and get personalized insights.',
    icon: '🏥',
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-50',
    route: 'hra'
  },
  {
    key: 'mental_wellbeing_enabled',
    name: 'Mental Wellbeing',
    description: 'Track your mood, assess stress levels, and access mental wellness resources.',
    icon: '🧠',
    color: 'from-purple-400 to-violet-500',
    bgColor: 'bg-purple-50',
    route: 'mental-wellbeing'
  },
  {
    key: 'ai_wellness_coach_enabled',
    name: 'AI Wellness Coach',
    description: 'Chat with your personal AI wellness coach for guidance on health, fitness, and lifestyle.',
    icon: '🤖',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50',
    route: 'coach'
  },
  {
    key: 'personalized_plans_enabled',
    name: 'My Wellness Plan',
    description: 'View and manage your personalized wellness plan with daily tasks and milestones.',
    icon: '📋',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    route: 'plan'
  },
  {
    key: 'knowledge_hub_enabled',
    name: 'Knowledge Hub',
    description: 'Explore curated articles, tips, and resources on nutrition, exercise, sleep, and more.',
    icon: '📚',
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-50',
    route: 'articles'
  },
  {
    key: 'preventive_care_enabled',
    name: 'Preventive Care',
    description: 'Stay on top of your health with reminders for checkups, vaccinations, and screenings.',
    icon: '🩺',
    color: 'from-teal-400 to-cyan-500',
    bgColor: 'bg-teal-50',
    route: 'preventive-care'
  },
  {
    key: 'financial_wellbeing_enabled',
    name: 'Financial Wellbeing',
    description: 'Learn about budgeting, emergency funds, insurance literacy, and financial planning.',
    icon: '💰',
    color: 'from-emerald-400 to-green-500',
    bgColor: 'bg-emerald-50',
    route: 'financial'
  },
  {
    key: 'habit_tracking_enabled',
    name: 'Habit Tracker',
    description: 'Build healthy habits with daily tracking, streaks, and fun challenges.',
    icon: '✅',
    color: 'from-orange-400 to-amber-500',
    bgColor: 'bg-orange-50',
    route: 'habits'
  },
  {
    key: 'journaling_enabled',
    name: 'Private Journal',
    description: 'Reflect on your day with a private, encrypted journal. Track moods and thoughts.',
    icon: '📔',
    color: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50',
    route: 'journal'
  }
];

// Quick stats for the wellness dashboard
const QuickStats = () => {
  const stats = [
    { label: 'Streak', value: '5 days', icon: '🔥', color: 'text-orange-500' },
    { label: 'Habits Today', value: '3/5', icon: '✅', color: 'text-green-500' },
    { label: 'Mood', value: '😊', icon: '', color: '' },
    { label: 'Articles Read', value: '12', icon: '📖', color: 'text-blue-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{stat.label}</span>
            <span className="text-lg">{stat.icon}</span>
          </div>
          <div className={`text-2xl font-bold mt-1 ${stat.color || 'text-gray-800'}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

// Daily tip component
const DailyTip = () => {
  const tips = [
    { icon: '💧', text: 'Stay hydrated! Aim to drink at least 8 glasses of water today.' },
    { icon: '🚶', text: 'Try to take a short walk every hour to stay active.' },
    { icon: '🍎', text: 'Add an extra serving of vegetables to your lunch today.' },
    { icon: '😴', text: 'Wind down 30 minutes before bed for better sleep quality.' },
    { icon: '🧘', text: 'Take 5 minutes to practice deep breathing when you feel stressed.' }
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-5 text-white mb-8">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{tip.icon}</div>
        <div>
          <h3 className="font-semibold text-lg">Daily Wellness Tip</h3>
          <p className="text-teal-100">{tip.text}</p>
        </div>
      </div>
    </div>
  );
};

// Consent Modal
const ConsentModal = ({ 
  consentText, 
  onAccept, 
  loading 
}: { 
  consentText: string; 
  onAccept: () => void;
  loading: boolean;
}) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🧘</div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Wellness Portal</h2>
          <p className="text-gray-600 mt-2">Please review and accept the terms to continue</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto text-sm text-gray-700 mb-6">
          {consentText || 'I consent to participate in the Corporate Wellness Program. I understand that my wellness data will be used to provide personalized recommendations and aggregated (anonymized) reports to my employer.'}
        </div>

        <div className="flex items-start gap-3 mb-6">
          <input
            type="checkbox"
            id="consent"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
          />
          <label htmlFor="consent" className="text-sm text-gray-700">
            I have read and agree to the wellness program terms and conditions. I understand my data will be kept confidential.
          </label>
        </div>

        <button
          onClick={onAccept}
          disabled={!agreed || loading}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Accept & Continue'}
        </button>
      </div>
    </div>
  );
};

export default function WellnessPortalPage() {
  const router = useRouter();
  const [config, setConfig] = useState<WellnessConfig | null>(null);
  const [consent, setConsent] = useState<UserConsent | null>(null);
  const [consentText, setConsentText] = useState('');
  const [requireConsent, setRequireConsent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [consentLoading, setConsentLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [portalTheme, setPortalTheme] = useState<any>(null);

  useEffect(() => {
    fetchWellnessData();
  }, []);

  const fetchWellnessData = async () => {
    try {
      const token = localStorage.getItem('employeeToken') || localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId');

      if (!token || !tenantId) {
        router.push('/');
        return;
      }

      // Fetch wellness config
      const configRes = await fetch(`${API_URL}/api/wellness/employee/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data.config);
        setConsentText(data.consent_text || '');
        setRequireConsent(data.require_consent ?? true);
      }

      // Fetch consent status
      const consentRes = await fetch(`${API_URL}/api/wellness/employee/consent`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (consentRes.ok) {
        const data = await consentRes.json();
        setConsent(data.consent);
      }

      // Fetch portal theme
      const themeRes = await fetch(`${API_URL}/api/portal/branding/${tenantId}`);
      if (themeRes.ok) {
        const data = await themeRes.json();
        setPortalTheme(data.branding);
      }
    } catch (error) {
      console.error('Error fetching wellness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConsent = async () => {
    try {
      setConsentLoading(true);
      const token = localStorage.getItem('employeeToken') || localStorage.getItem('token');

      const res = await fetch(`${API_URL}/api/wellness/employee/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ consent_given: true })
      });

      if (res.ok) {
        setConsent({ consent_given: true, consent_date: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error saving consent:', error);
    } finally {
      setConsentLoading(false);
    }
  };

  const handleModuleClick = (route: string) => {
    setSelectedModule(route);
    // Navigate to the specific wellness module page
    // For now, we'll show a placeholder
  };

  const enabledModules = wellnessModules.filter(
    m => config && config[m.key as keyof WellnessConfig]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wellness portal...</p>
        </div>
      </div>
    );
  }

  if (!config?.wellness_enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🧘</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Wellness Portal</h2>
          <p className="text-gray-600">
            The wellness portal is not currently available for your organization.
            Please check back later or contact your HR department.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show consent modal if required and not yet given
  const showConsentModal = requireConsent && (!consent || !consent.consent_given);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {showConsentModal && (
        <ConsentModal
          consentText={consentText}
          onAccept={handleAcceptConsent}
          loading={consentLoading}
        />
      )}

      {/* Header */}
      <header 
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10"
        style={portalTheme?.primary_color ? {
          background: `linear-gradient(135deg, ${portalTheme.primary_color}10, white)`
        } : {}}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🧘 Wellness Portal
                </h1>
                <p className="text-sm text-gray-600">Your personal health and wellbeing hub</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                  <path d="M10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800">Welcome back! 👋</h2>
          <p className="text-gray-600">Here&apos;s your wellness overview for today</p>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Daily Tip */}
        <DailyTip />

        {/* Wellness Modules Grid */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Wellness Modules</h3>
          
          {enabledModules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-gray-600">No wellness modules are currently enabled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enabledModules.map((module) => (
                <div
                  key={module.key}
                  onClick={() => handleModuleClick(module.route)}
                  className="group bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                        {module.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {module.description}
                      </p>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Challenges */}
        {config.habit_tracking_enabled && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>🏆</span> Active Challenges
              </h3>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View All
              </button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                🚶
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">10K Steps Challenge</h4>
                <p className="text-sm text-gray-600">Week 2 of 4 • 45 participants</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">65%</div>
                <div className="text-xs text-gray-500">complete</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Articles */}
        {config.knowledge_hub_enabled && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>📖</span> Recommended Reading
              </h3>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Browse All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: '10 Simple Habits for Better Sleep', category: 'Sleep', readTime: '5 min', icon: '😴' },
                { title: 'Managing Workplace Stress', category: 'Mental Health', readTime: '7 min', icon: '🧘' }
              ].map((article, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                    {article.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-1">{article.title}</h4>
                    <p className="text-xs text-gray-500">{article.category} • {article.readTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Module Detail Modal Placeholder */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {wellnessModules.find(m => m.route === selectedModule)?.name}
              </h2>
              <button
                onClick={() => setSelectedModule(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">
                {wellnessModules.find(m => m.route === selectedModule)?.icon}
              </div>
              <p className="text-gray-600">
                This module will be fully implemented with the backend integration.
              </p>
              <button
                onClick={() => setSelectedModule(null)}
                className="mt-6 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
