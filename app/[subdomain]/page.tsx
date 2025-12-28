'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://benefitnest-backend.onrender.com';

interface PortalConfig {
  tenant_id: string;
  company_name: string;
  subdomain: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  contact_email?: string;
  contact_phone?: string;
  status: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  border_color?: string;
  heading_font_family?: string;
  body_font_family?: string;
  heading_font_size?: number;
  body_font_size?: number;
  font_weight_heading?: number;
  line_height_multiplier?: number;
  portal_title?: string;
  portal_tagline?: string;
  hero_headline?: string;
  hero_subheadline?: string;
  hero_cta_button_text?: string;
  hero_cta_button_url?: string;
  show_header?: boolean;
  show_hero_section?: boolean;
  show_features_section?: boolean;
  show_contact_section?: boolean;
  show_footer?: boolean;
  custom_css?: string;
  logo_width?: number;
  logo_height?: number;
}

interface Customizations { [key: string]: any; }

export default function PortalPage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const [portalConfig, setPortalConfig] = useState<PortalConfig | null>(null);
  const [customizations, setCustomizations] = useState<Customizations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    const savedTenant = localStorage.getItem('portal_tenant');
    if (token && savedTenant) {
      try {
        const tenant = JSON.parse(savedTenant);
        if (tenant.subdomain === subdomain) setIsLoggedIn(true);
      } catch {}
    }
  }, [subdomain]);

  useEffect(() => {
    const fetchPortalConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/portal/config/${subdomain}`);
        if (!response.ok) throw new Error(`Portal not found: ${subdomain}`);
        const result = await response.json();
        if (result.success && result.data) {
          setPortalConfig(result.data);
          setCustomizations(result.data.customizations || null);
        } else throw new Error('Invalid portal data');
      } catch (err: any) {
        setError(err.message || 'Failed to load portal');
      } finally { setLoading(false); }
    };
    if (subdomain) fetchPortalConfig();
  }, [subdomain]);

  const theme = useMemo(() => {
    const c = customizations || {};
    return {
      primary: c.primary_color || portalConfig?.primary_color || '#db2777',
      secondary: c.secondary_color || portalConfig?.secondary_color || '#9333ea',
      accent: c.accent_color || '#f59e0b',
      background: c.background_color || '#ffffff',
      text: c.text_color || '#111827',
      border: c.border_color || '#e5e7eb',
      headingFont: c.heading_font_family || 'Segoe UI',
      bodyFont: c.body_font_family || 'Segoe UI',
      headingSize: c.heading_font_size || 42,
      bodySize: c.body_font_size || 16,
      headingWeight: c.font_weight_heading || 700,
      lineHeight: c.line_height_multiplier || 1.6,
      logoUrl: c.logo_url || portalConfig?.logo_url,
      logoWidth: c.logo_width || 150,
      logoHeight: c.logo_height || 50,
      portalTitle: c.portal_title || portalConfig?.company_name || 'Employee Portal',
      tagline: c.portal_tagline || 'To keep connected with us please login with your personal info',
      customCss: c.custom_css || '',
    };
  }, [customizations, portalConfig]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!employeeId || !password) { setLoginError('Please enter Employee ID and Password'); return; }
    setLoggingIn(true);
    try {
      const response = await fetch(`${API_URL}/api/portal/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: portalConfig?.tenant_id, subdomain: portalConfig?.subdomain, employee_id: employeeId, password, rememberMe, captchaToken })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('portal_token', data.token);
        localStorage.setItem('portal_user', JSON.stringify(data.user));
        localStorage.setItem('portal_tenant', JSON.stringify(portalConfig));
        if (rememberMe) document.cookie = `portal_token=${data.token}; path=/; max-age=2592000`;
        setIsLoggedIn(true);
      } else { setLoginError(data.message || 'Invalid credentials'); recaptchaRef.current?.reset(); setCaptchaToken(null); }
    } catch { setLoginError('Login failed. Please try again.'); recaptchaRef.current?.reset(); setCaptchaToken(null); }
    finally { setLoggingIn(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/portal/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: portalConfig?.tenant_id, email: forgotEmail })
      });
      const data = await response.json();
      if (data.success) setForgotSuccess(true); else setLoginError(data.message || 'Failed to send reset email');
    } catch { setLoginError('Failed to send reset email'); }
    finally { setForgotLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    localStorage.removeItem('portal_tenant');
    document.cookie = 'portal_token=; path=/; max-age=0';
    setIsLoggedIn(false);
  };

  // Loading State
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}>
        <div style={{ backgroundColor: 'white', padding: '40px 60px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTopColor: theme.primary, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: '#374151', margin: 0, fontSize: '16px' }}>Loading portal...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error State
  if (error || !portalConfig) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}>
        <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxWidth: '420px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏢</div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Portal Not Found</h1>
          <p style={{ color: '#6b7280', marginBottom: '28px', lineHeight: 1.6 }}>{error}</p>
          <a href="https://benefitnest.space" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: theme.primary, color: 'white', borderRadius: '50px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>Go to Main Site</a>
        </div>
      </div>
    );
  }

  // Dashboard (after login)
  if (isLoggedIn) return <PortalDashboard config={portalConfig} customizations={customizations} theme={theme} onLogout={handleLogout} />;

  // ==========================================
  // LOGIN PAGE - Inspired by GIF Design
  // ==========================================
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: theme.bodyFont, overflow: 'hidden' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        @keyframes blob { 0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .blob-shape { animation: blob 8s ease-in-out infinite; }
        .float-animation { animation: float 6s ease-in-out infinite; }
        .pulse-animation { animation: pulse 3s ease-in-out infinite; }
        input:focus { outline: none; border-color: ${theme.primary} !important; box-shadow: 0 0 0 4px ${theme.primary}20; }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 35px -10px ${theme.primary}60 !important; }
        .outline-btn:hover { background-color: rgba(255,255,255,0.1) !important; }
        ${theme.customCss}
      `}</style>

      {/* ========== LEFT SIDE - Gradient with Organic Blob Shapes ========== */}
      <div style={{ 
        flex: 1, 
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '60px', 
        overflow: 'hidden' 
      }}>
        
        {/* Organic Blob Shapes - Like in the GIF */}
        <div className="blob-shape" style={{ 
          position: 'absolute', 
          top: '-150px', 
          left: '-150px', 
          width: '400px', 
          height: '400px', 
          background: 'rgba(255,255,255,0.1)' 
        }} />
        <div className="blob-shape" style={{ 
          position: 'absolute', 
          bottom: '5%', 
          left: '0%', 
          width: '280px', 
          height: '280px', 
          background: 'rgba(255,255,255,0.08)', 
          animationDelay: '-4s' 
        }} />
        <div className="blob-shape" style={{ 
          position: 'absolute', 
          top: '15%', 
          right: '-80px', 
          width: '320px', 
          height: '320px', 
          background: 'rgba(0,0,0,0.12)', 
          animationDelay: '-2s' 
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '-120px', 
          right: '15%', 
          width: '350px', 
          height: '350px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '50%' 
        }} />
        
        {/* Decorative Elements */}
        <div style={{ 
          position: 'absolute', 
          top: '12%', 
          left: '15%', 
          width: '100px', 
          height: '100px', 
          border: '3px solid rgba(255,255,255,0.15)', 
          borderRadius: '50%' 
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '20%', 
          left: '8%', 
          width: '60px', 
          height: '60px', 
          border: '2px solid rgba(255,255,255,0.12)', 
          borderRadius: '10px', 
          transform: 'rotate(45deg)' 
        }} />
        <div className="pulse-animation" style={{ 
          position: 'absolute', 
          top: '40%', 
          left: '25%', 
          width: '10px', 
          height: '10px', 
          backgroundColor: 'rgba(255,255,255,0.4)', 
          borderRadius: '50%' 
        }} />
        
        {/* Floating Confetti Elements */}
        <div className="float-animation" style={{ position: 'absolute', top: '25%', right: '20%', width: '14px', height: '14px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '3px', transform: 'rotate(45deg)' }} />
        <div className="float-animation" style={{ position: 'absolute', top: '55%', left: '20%', width: '10px', height: '10px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', animationDelay: '-2s' }} />
        <div className="float-animation" style={{ position: 'absolute', bottom: '35%', right: '30%', width: '16px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '4px', animationDelay: '-4s' }} />
        <div className="float-animation" style={{ position: 'absolute', top: '70%', right: '15%', width: '8px', height: '8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', animationDelay: '-1s' }} />
        
        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'white', maxWidth: '480px' }}>
          {/* Logo */}
          {theme.logoUrl ? (
            <img 
              src={theme.logoUrl} 
              alt={theme.portalTitle} 
              style={{ maxWidth: `${theme.logoWidth}px`, maxHeight: `${theme.logoHeight}px`, marginBottom: '45px', objectFit: 'contain' }} 
              onError={(e: any) => { e.target.style.display = 'none'; }} 
            />
          ) : (
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 45px', 
              fontSize: '36px',
              backdropFilter: 'blur(10px)'
            }}>🏢</div>
          )}
          
          <h1 style={{ 
            fontSize: `${theme.headingSize}px`, 
            fontWeight: theme.headingWeight, 
            marginBottom: '24px', 
            fontFamily: theme.headingFont, 
            lineHeight: 1.1,
            textShadow: '0 2px 20px rgba(0,0,0,0.2)'
          }}>
            Welcome Back
          </h1>
          
          <p style={{ 
            fontSize: '18px', 
            opacity: 0.9, 
            lineHeight: 1.7, 
            marginBottom: '55px',
            maxWidth: '350px',
            margin: '0 auto 55px'
          }}>
            {theme.tagline}
          </p>

          {/* Sign In Button */}
          <button 
            className="outline-btn"
            onClick={() => document.getElementById('login-form')?.querySelector('input')?.focus()}
            style={{ 
              padding: '18px 55px', 
              backgroundColor: 'transparent', 
              color: 'white', 
              border: '2px solid rgba(255,255,255,0.5)', 
              borderRadius: '50px', 
              fontSize: '15px', 
              fontWeight: 600, 
              cursor: 'pointer', 
              transition: 'all 0.3s', 
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}
          >
            SIGN IN
          </button>
        </div>
      </div>

      {/* ========== RIGHT SIDE - Login Form ========== */}
      <div id="login-form" style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '60px', 
        backgroundColor: theme.background, 
        position: 'relative' 
      }}>
        
        {/* Decorative Background Blurs */}
        <div style={{ 
          position: 'absolute', 
          top: '8%', 
          right: '8%', 
          width: '250px', 
          height: '250px', 
          background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}10 100%)`, 
          borderRadius: '50%', 
          filter: 'blur(50px)' 
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '12%', 
          left: '3%', 
          width: '180px', 
          height: '180px', 
          background: `${theme.primary}08`, 
          borderRadius: '50%', 
          filter: 'blur(40px)' 
        }} />

        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
          
          {showForgotPassword ? (
            /* ===== FORGOT PASSWORD FORM ===== */
            <div>
              <h2 style={{ fontSize: '30px', fontWeight: theme.headingWeight, color: theme.text, marginBottom: '12px', fontFamily: theme.headingFont }}>
                Reset Password
              </h2>
              <p style={{ color: theme.text, opacity: 0.5, marginBottom: '35px', fontSize: '15px', lineHeight: 1.6 }}>
                Enter your email address and we'll send you a link to reset your password
              </p>

              {forgotSuccess ? (
                <div style={{ textAlign: 'center', padding: '35px 0' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: `linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)`, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 25px', 
                    fontSize: '36px' 
                  }}>✓</div>
                  <p style={{ color: theme.text, marginBottom: '35px', lineHeight: 1.7, opacity: 0.8 }}>
                    If your email is registered, you will receive a password reset link shortly.
                  </p>
                  <button 
                    onClick={() => { setShowForgotPassword(false); setForgotSuccess(false); setForgotEmail(''); }} 
                    className="login-btn"
                    style={{ 
                      width: '100%', 
                      padding: '18px', 
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '14px', 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: theme.text, marginBottom: '10px' }}>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={forgotEmail} 
                      onChange={(e) => setForgotEmail(e.target.value)} 
                      placeholder="Enter your registered email" 
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '18px 22px', 
                        border: `2px solid ${theme.border}`, 
                        borderRadius: '14px', 
                        fontSize: '15px', 
                        boxSizing: 'border-box', 
                        backgroundColor: theme.background, 
                        transition: 'all 0.3s' 
                      }} 
                    />
                  </div>

                  {loginError && (
                    <div style={{ 
                      backgroundColor: '#fef2f2', 
                      color: '#991b1b', 
                      padding: '16px 20px', 
                      borderRadius: '12px', 
                      fontSize: '14px', 
                      marginBottom: '22px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px' 
                    }}>
                      ⚠️ {loginError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={forgotLoading} 
                    className="login-btn"
                    style={{ 
                      width: '100%', 
                      padding: '18px', 
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '14px', 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      cursor: forgotLoading ? 'not-allowed' : 'pointer', 
                      opacity: forgotLoading ? 0.7 : 1, 
                      marginBottom: '16px',
                      transition: 'all 0.3s'
                    }}
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setShowForgotPassword(false); setLoginError(''); }} 
                    style={{ 
                      width: '100%', 
                      padding: '18px', 
                      backgroundColor: 'transparent', 
                      color: theme.text, 
                      border: `2px solid ${theme.border}`, 
                      borderRadius: '14px', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    ← Back to Login
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ===== LOGIN FORM ===== */
            <div>
              <h2 style={{ fontSize: '30px', fontWeight: theme.headingWeight, color: theme.text, marginBottom: '12px', fontFamily: theme.headingFont }}>
                Sign In
              </h2>
              <p style={{ color: theme.text, opacity: 0.5, marginBottom: '40px', fontSize: '15px' }}>
                Access your employee benefits portal
              </p>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: theme.text, marginBottom: '10px' }}>
                    Employee ID / Email
                  </label>
                  <input 
                    type="text" 
                    value={employeeId} 
                    onChange={(e) => setEmployeeId(e.target.value)} 
                    placeholder="Enter your employee ID or email" 
                    style={{ 
                      width: '100%', 
                      padding: '18px 22px', 
                      border: `2px solid ${theme.border}`, 
                      borderRadius: '14px', 
                      fontSize: '15px', 
                      boxSizing: 'border-box', 
                      backgroundColor: theme.background, 
                      transition: 'all 0.3s' 
                    }} 
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: theme.text, marginBottom: '10px' }}>
                    Password
                  </label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter your password" 
                    style={{ 
                      width: '100%', 
                      padding: '18px 22px', 
                      border: `2px solid ${theme.border}`, 
                      borderRadius: '14px', 
                      fontSize: '15px', 
                      boxSizing: 'border-box', 
                      backgroundColor: theme.background, 
                      transition: 'all 0.3s' 
                    }} 
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: theme.text, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                      style={{ width: '18px', height: '18px', accentColor: theme.primary, cursor: 'pointer' }} 
                    />
                    Remember me
                  </label>
                  <button 
                    type="button" 
                    onClick={() => { setShowForgotPassword(true); setLoginError(''); }} 
                    style={{ background: 'none', border: 'none', color: theme.primary, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* ReCAPTCHA */}
                <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center' }}>
                  <ReCAPTCHA 
                    ref={recaptchaRef} 
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'} 
                    onChange={(token) => setCaptchaToken(token)} 
                  />
                </div>

                {loginError && (
                  <div style={{ 
                    backgroundColor: '#fef2f2', 
                    color: '#991b1b', 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    marginBottom: '22px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px' 
                  }}>
                    ⚠️ {loginError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loggingIn} 
                  className="login-btn"
                  style={{ 
                    width: '100%', 
                    padding: '20px', 
                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    cursor: loggingIn ? 'not-allowed' : 'pointer', 
                    opacity: loggingIn ? 0.7 : 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '12px', 
                    boxShadow: `0 12px 35px -12px ${theme.primary}70`,
                    transition: 'all 0.3s'
                  }}
                >
                  {loggingIn ? (
                    <>
                      <span style={{ width: '22px', height: '22px', border: '3px solid transparent', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '45px', color: theme.text, opacity: 0.35, fontSize: '13px' }}>
            <p>Powered by <strong style={{ opacity: 0.8 }}>BenefitNest</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PORTAL DASHBOARD (After Login)
// ============================================
interface PortalDashboardProps { 
  config: PortalConfig; 
  customizations: Customizations | null; 
  theme: any; 
  onLogout: () => void; 
}

function PortalDashboard({ config, customizations, theme, onLogout }: PortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'contact'>('overview');
  const finalConfig = useMemo(() => customizations ? { ...config, ...customizations } : config, [config, customizations]);

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
        ${theme.customCss}
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
          {finalConfig.show_header !== false && (
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
                    <img src={theme.logoUrl} alt={config.company_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
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
                  <p style={{ fontSize: '14px', color: theme.text, margin: 0, opacity: 0.55 }}>Employee Benefits Portal</p>
                </div>
              </div>
              <button 
                onClick={onLogout} 
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
          )}

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
                This is your dedicated employee benefits portal for {config.company_name}. Here you can manage your benefits, view policy details, and access important documents.
              </p>
            </div>
          )}

          {activeTab === 'features' && finalConfig.show_features_section !== false && (
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

          {activeTab === 'contact' && finalConfig.show_contact_section !== false && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '22px' }}>
              {(finalConfig.contact_email || config.contact_email) && (
                <div style={{ 
                  padding: '28px', 
                  background: `linear-gradient(135deg, ${theme.primary}08 0%, ${theme.secondary}08 100%)`, 
                  borderRadius: '18px' 
                }}>
                  <div style={{ fontSize: '12px', color: theme.text, marginBottom: '10px', opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>EMAIL</div>
                  <a 
                    href={`mailto:${finalConfig.contact_email || config.contact_email}`} 
                    style={{ fontSize: '17px', fontWeight: 600, color: theme.primary, textDecoration: 'none' }}
                  >
                    {finalConfig.contact_email || config.contact_email}
                  </a>
                </div>
              )}
              {(finalConfig.contact_phone || config.contact_phone) && (
                <div style={{ 
                  padding: '28px', 
                  background: `linear-gradient(135deg, ${theme.secondary}08 0%, ${theme.primary}08 100%)`, 
                  borderRadius: '18px' 
                }}>
                  <div style={{ fontSize: '12px', color: theme.text, marginBottom: '10px', opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>PHONE</div>
                  <a 
                    href={`tel:${finalConfig.contact_phone || config.contact_phone}`} 
                    style={{ fontSize: '17px', fontWeight: 600, color: theme.secondary, textDecoration: 'none' }}
                  >
                    {finalConfig.contact_phone || config.contact_phone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {finalConfig.show_footer !== false && (
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
          )}
        </div>
      </div>
    </div>
  );
}
