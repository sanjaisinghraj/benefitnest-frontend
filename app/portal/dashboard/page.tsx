'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://benefitnest-backend.onrender.com';

interface PortalConfig {
  tenant_id: string;
  company_name: string;
  subdomain: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  contact_email?: string;
  contact_phone?: string;
  branding_config?: {
    primary_color?: string;
    secondary_color?: string;
    heading_font_family?: string;
    body_font_family?: string;
    logo_url?: string;
    portal_title?: string;
    portal_tagline?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  full_name?: string;
}

export default function PortalDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [portalConfig, setPortalConfig] = useState<PortalConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'contact'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('portal_token');
    const savedUser = localStorage.getItem('portal_user');
    const savedTenant = localStorage.getItem('portal_tenant');

    if (!token || !savedUser || !savedTenant) {
      // Not logged in, redirect to login
      router.push('/portal');
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
      setPortalConfig(JSON.parse(savedTenant));
    } catch {
      router.push('/portal');
      return;
    }
    
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    localStorage.removeItem('portal_tenant');
    document.cookie = 'portal_token=; path=/; max-age=0';
    router.push('/portal');
  };

  const theme = useMemo(() => {
    const branding = portalConfig?.branding_config || {};
    return {
      primary: portalConfig?.primary_color || branding.primary_color || '#2563eb',
      secondary: portalConfig?.secondary_color || branding.secondary_color || '#10b981',
      background: '#ffffff',
      text: '#111827',
      border: '#e5e7eb',
      headingFont: branding.heading_font_family || 'Segoe UI',
      bodyFont: branding.body_font_family || 'Segoe UI',
      headingWeight: 700,
      bodySize: 15,
      logoUrl: portalConfig?.logo_url || branding.logo_url,
      portalTitle: branding.portal_title || portalConfig?.company_name || 'Benefits Portal',
    };
  }, [portalConfig]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: `linear-gradient(135deg, #2563eb 0%, #10b981 100%)` 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px 60px', 
          borderRadius: '20px', 
          textAlign: 'center', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' 
        }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #e5e7eb', 
            borderTopColor: '#2563eb', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 20px' 
          }} />
          <p style={{ color: '#374151', margin: 0, fontSize: '16px' }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, 
      padding: '25px', 
      fontFamily: theme.bodyFont 
    }}>
      <style>{`
        * { font-family: ${theme.bodyFont}, sans-serif; } 
        h1, h2, h3, h4, h5, h6 { font-family: ${theme.headingFont}, sans-serif; font-weight: ${theme.headingWeight}; } 
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.1) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: theme.background, 
          borderRadius: '24px', 
          padding: '40px', 
          boxShadow: '0 25px 60px rgba(0,0,0,0.15)', 
          color: theme.text 
        }}>
          
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '40px', 
            paddingBottom: '30px', 
            borderBottom: `1px solid ${theme.border}` 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
              <div style={{ 
                width: '75px', 
                height: '75px', 
                borderRadius: '18px', 
                background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden' 
              }}>
                {theme.logoUrl ? (
                  <img src={theme.logoUrl} alt={portalConfig?.company_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '36px' }}>🏢</span>
                )}
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '26px', 
                  fontWeight: theme.headingWeight, 
                  margin: '0 0 6px 0', 
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
                }}>
                  {theme.portalTitle}
                </h1>
                <p style={{ fontSize: '14px', color: theme.text, margin: 0, opacity: 0.55 }}>
                  Welcome, {user?.full_name || user?.name || user?.email?.split('@')[0]}!
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: '14px 28px', 
                backgroundColor: '#fef2f2', 
                color: '#991b1b', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: '14px', 
                fontWeight: 600, 
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Logout
            </button>
          </div>

          {/* Status Badge */}
          <div style={{ 
            display: 'inline-block', 
            padding: '12px 24px', 
            background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)', 
            color: '#166534', 
            borderRadius: '10px', 
            fontSize: '14px', 
            fontWeight: 600, 
            marginBottom: '28px' 
          }}>
            ✓ Portal Active
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: `1px solid ${theme.border}`, marginBottom: '40px' }}>
            {(['overview', 'features', 'contact'] as const).map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                style={{ 
                  padding: '16px 28px', 
                  border: 'none', 
                  background: activeTab === tab ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` : 'transparent', 
                  color: activeTab === tab ? 'white' : theme.text, 
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  borderRadius: '10px 10px 0 0', 
                  fontFamily: theme.headingFont,
                  transition: 'all 0.3s'
                }}
              >
                {tab === 'overview' && '📋 Overview'}
                {tab === 'features' && '⭐ Features'}
                {tab === 'contact' && '📞 Contact'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: theme.headingWeight, 
                marginBottom: '18px', 
                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>
                Welcome to Your Benefits Portal
              </h3>
              <p style={{ fontSize: `${theme.bodySize}px`, lineHeight: 1.8, color: theme.text, opacity: 0.75 }}>
                This is your dedicated employee benefits portal for {portalConfig?.company_name}. Here you can manage your benefits, view policy details, and access important documents.
              </p>
              
              {/* Quick Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                <div style={{ padding: '24px', background: `${theme.primary}10`, borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: theme.primary }}>5</div>
                  <div style={{ fontSize: '14px', color: theme.text, opacity: 0.6, marginTop: '8px' }}>Active Benefits</div>
                </div>
                <div style={{ padding: '24px', background: `${theme.secondary}10`, borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: theme.secondary }}>12</div>
                  <div style={{ fontSize: '14px', color: theme.text, opacity: 0.6, marginTop: '8px' }}>Documents</div>
                </div>
                <div style={{ padding: '24px', background: '#fef3c710', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>2</div>
                  <div style={{ fontSize: '14px', color: theme.text, opacity: 0.6, marginTop: '8px' }}>Pending Actions</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '22px' }}>
              {[
                { icon: '📋', title: 'View Benefits', desc: 'See all your benefits' },
                { icon: '📄', title: 'Documents', desc: 'Download documents' },
                { icon: '📊', title: 'Claims', desc: 'Track claims' },
                { icon: '👤', title: 'Profile', desc: 'Manage your info' },
                { icon: '🔔', title: 'Alerts', desc: 'Get notifications' },
                { icon: '💬', title: 'Support', desc: 'Contact support' }
              ].map((f, i) => (
                <div 
                  key={i} 
                  className="feature-card"
                  style={{ 
                    padding: '28px', 
                    border: `1px solid ${theme.border}`, 
                    borderRadius: '18px', 
                    textAlign: 'center', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s',
                    backgroundColor: theme.background
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '14px' }}>{f.icon}</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: theme.primary }}>{f.title}</div>
                  <div style={{ fontSize: '13px', color: theme.text, opacity: 0.55 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '22px' }}>
              {portalConfig?.contact_email && (
                <div style={{ 
                  padding: '28px', 
                  background: `linear-gradient(135deg, ${theme.primary}08 0%, ${theme.secondary}08 100%)`, 
                  borderRadius: '18px' 
                }}>
                  <div style={{ fontSize: '12px', color: theme.text, marginBottom: '10px', opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>EMAIL</div>
                  <a 
                    href={`mailto:${portalConfig.contact_email}`} 
                    style={{ fontSize: '17px', fontWeight: 600, color: theme.primary, textDecoration: 'none' }}
                  >
                    {portalConfig.contact_email}
                  </a>
                </div>
              )}
              {portalConfig?.contact_phone && (
                <div style={{ 
                  padding: '28px', 
                  background: `linear-gradient(135deg, ${theme.secondary}08 0%, ${theme.primary}08 100%)`, 
                  borderRadius: '18px' 
                }}>
                  <div style={{ fontSize: '12px', color: theme.text, marginBottom: '10px', opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>PHONE</div>
                  <a 
                    href={`tel:${portalConfig.contact_phone}`} 
                    style={{ fontSize: '17px', fontWeight: 600, color: theme.secondary, textDecoration: 'none' }}
                  >
                    {portalConfig.contact_phone}
                  </a>
                </div>
              )}
              <div style={{ 
                padding: '28px', 
                background: `linear-gradient(135deg, #f59e0b08 0%, #f59e0b15 100%)`, 
                borderRadius: '18px' 
              }}>
                <div style={{ fontSize: '12px', color: theme.text, marginBottom: '10px', opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>SUPPORT</div>
                <a 
                  href="mailto:support@benefitnest.space" 
                  style={{ fontSize: '17px', fontWeight: 600, color: '#f59e0b', textDecoration: 'none' }}
                >
                  support@benefitnest.space
                </a>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ 
            marginTop: '50px', 
            paddingTop: '28px', 
            borderTop: `1px solid ${theme.border}`, 
            textAlign: 'center', 
            fontSize: '13px', 
            color: theme.text, 
            opacity: 0.4 
          }}>
            <p>Powered by BenefitNest © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
