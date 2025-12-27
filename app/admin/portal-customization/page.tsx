'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://benefitnest-backend.onrender.com';

const colors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryLight: '#dbeafe',
  success: '#10b981',
  successHover: '#059669',
  successLight: '#d1fae5',
  danger: '#ef4444',
  dangerHover: '#dc2626',
  dangerLight: '#fee2e2',
  warning: '#f59e0b',
  warningHover: '#d97706',
  warningLight: '#fef3c7',
  info: '#8b5cf6',
  infoHover: '#7c3aed',
  infoLight: '#ede9fe',
  cyan: '#0ea5e9',
  cyanLight: '#e0f2fe',
  pink: '#ec4899',
  pinkLight: '#fce7f3',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

interface Corporate {
  tenant_id: string;
  corporate_legal_name: string;
  subdomain: string;
  company_name?: string;
  primary_color?: string;
  secondary_color?: string;
  status?: string;
}

interface Customizations {
  [key: string]: any;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// =====================================================
// AUTH HELPERS
// =====================================================
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token');
};
const getAuthHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

const Modal = ({ isOpen, onClose, title, icon, children, size = 'md' }: { isOpen: boolean; onClose: () => void; title: string; icon?: string; children: React.ReactNode; size?: string }) => {
  if (!isOpen) return null;
  const sizeStyles: Record<string, string> = { sm: '440px', md: '600px', lg: '900px', xl: '1200px' };
  return (
    <div 
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: sizeStyles[size], maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && <span style={{ fontSize: '22px' }}>{icon}</span>}
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: colors.gray[900], margin: 0 }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: colors.gray[100], cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, disabled, loading, style = {} }: { children: React.ReactNode; variant?: string; size?: string; icon?: string; onClick?: () => void; disabled?: boolean; loading?: boolean; style?: React.CSSProperties }) => {
  const variants: Record<string, { bg: string; hoverBg: string; color: string; border?: string }> = {
    primary: { bg: colors.primary, hoverBg: colors.primaryHover, color: 'white' },
    success: { bg: colors.success, hoverBg: colors.successHover, color: 'white' },
    danger: { bg: colors.danger, hoverBg: colors.dangerHover, color: 'white' },
    warning: { bg: colors.warning, hoverBg: colors.warningHover, color: 'white' },
    cyan: { bg: colors.cyan, hoverBg: '#0284c7', color: 'white' },
    info: { bg: colors.info, hoverBg: colors.infoHover, color: 'white' },
    pink: { bg: colors.pink, hoverBg: '#db2777', color: 'white' },
    outline: { bg: 'white', hoverBg: colors.gray[50], color: colors.gray[700], border: `1px solid ${colors.gray[300]}` },
    ghost: { bg: 'transparent', hoverBg: colors.gray[100], color: colors.gray[700] }
  };
  const sizes: Record<string, { padding: string; fontSize: string }> = {
    xs: { padding: '4px 8px', fontSize: '11px' },
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 16px', fontSize: '14px' },
    lg: { padding: '12px 20px', fontSize: '15px' }
  };
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: '600',
        color: v.color,
        backgroundColor: hover && !disabled ? v.hoverBg : v.bg,
        border: v.border || 'none',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {loading ? (
        <span style={{ width: '14px', height: '14px', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => {
  const variants: Record<string, { bg: string; color: string }> = {
    default: { bg: colors.gray[100], color: colors.gray[700] },
    success: { bg: colors.successLight, color: '#065f46' },
    danger: { bg: colors.dangerLight, color: '#991b1b' },
    warning: { bg: colors.warningLight, color: '#92400e' },
    info: { bg: colors.infoLight, color: '#5b21b6' },
    cyan: { bg: colors.cyanLight, color: '#0369a1' },
    pink: { bg: colors.pinkLight, color: '#9d174d' }
  };
  const v = variants[variant] || variants.default;
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', backgroundColor: v.bg, color: v.color }}>{children}</span>;
};

const Toast = ({ message, type = 'info', onClose }: { message: string; type?: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const types: Record<string, { bg: string; color: string; icon: string }> = {
    success: { bg: colors.successLight, color: '#065f46', icon: '✓' },
    error: { bg: colors.dangerLight, color: '#991b1b', icon: '✕' },
    warning: { bg: colors.warningLight, color: '#92400e', icon: '⚠' },
    info: { bg: colors.primaryLight, color: colors.primary, icon: 'ℹ' }
  };
  const t = types[type] || types.info;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: t.bg,
      color: t.color,
      padding: '14px 20px',
      borderRadius: '10px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 2000,
      maxWidth: '400px'
    }}>
      <span style={{ fontWeight: '700' }}>{t.icon}</span>
      <span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.color, cursor: 'pointer', fontSize: '18px', marginLeft: '8px' }}>×</button>
    </div>
  );
};

const StatsCard = ({ value, label, icon, color, active, onClick }: { value: number | string; label: string; icon: string; color: string; active?: boolean; onClick?: () => void }) => (
  <div
    onClick={onClick}
    style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid ${active ? color : colors.gray[200]}`,
      flex: 1,
      minWidth: '140px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      boxShadow: active ? `0 0 0 2px ${color}20` : 'none'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: colors.gray[900] }}>{value}</div>
        <div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>{label}</div>
      </div>
      <div style={{ fontSize: '28px' }}>{icon}</div>
    </div>
  </div>
);

const SectionHeader = ({ title, icon, action }: { title: string; icon: string; action?: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${colors.pink}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.gray[900], margin: 0 }}>{title}</h3>
    </div>
    {action}
  </div>
);

const Input = ({ label, value, onChange, type = 'text', placeholder, hint, step, required }: { label?: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; hint?: string; step?: string; required?: boolean }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>
        {label}{required && <span style={{ color: colors.danger }}>*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${colors.gray[300]}`,
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      }}
    />
    {hint && <div style={{ fontSize: '11px', color: colors.gray[500], marginTop: '4px' }}>{hint}</div>}
  </div>
);

const Select = ({ label, value, onChange, options, placeholder }: { label?: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; placeholder?: string }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${colors.gray[300]}`,
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'white',
        cursor: 'pointer',
        outline: 'none'
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>
        {label}
      </label>
    )}
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="color"
        value={value || '#2563eb'}
        onChange={onChange}
        style={{
          width: '50px',
          height: '40px',
          border: `1px solid ${colors.gray[300]}`,
          borderRadius: '8px',
          cursor: 'pointer',
          padding: '2px'
        }}
      />
      <input
        type="text"
        value={value || '#2563eb'}
        onChange={onChange}
        style={{
          flex: 1,
          padding: '10px 12px',
          border: `1px solid ${colors.gray[300]}`,
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          fontFamily: 'monospace'
        }}
      />
    </div>
  </div>
);

const Checkbox = ({ label, value, onChange }: { label?: string; value: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: colors.gray[700], cursor: 'pointer', marginBottom: '12px' }}>
    <input
      type="checkbox"
      checked={value || false}
      onChange={onChange}
      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: colors.primary }}
    />
    {label}
  </label>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function PortalCustomizationPage() {
  const router = useRouter();

  // State
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
  const [customizations, setCustomizations] = useState<Customizations>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin User',
    email: 'admin@benefitnest.space',
    role: 'Super Admin'
  });

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, customized: 0 });

  // Fetch corporates on mount
  useEffect(() => {
    fetchCorporates();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/profile`, { headers: getAuthHeaders() });
      if (response.data.success && response.data.data) {
        setUserProfile(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const fetchCorporates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/corporates?limit=1000`, { headers: getAuthHeaders() });
      const data = response.data.data || [];
      setCorporates(data);
      
      // Calculate stats
      const activeCount = data.filter((c: Corporate) => c.status === 'ACTIVE').length;
      setStats({
        total: data.length,
        active: activeCount,
        customized: data.filter((c: Corporate) => c.primary_color || c.secondary_color).length
      });
    } catch (err) {
      showToast('Failed to load corporates', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCorporateSelect = async (corporate: Corporate) => {
    setSelectedCorporate(corporate);
    await fetchCustomizations(corporate);
  };

  const fetchCustomizations = async (corporate: Corporate) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/admin/corporates/${corporate.tenant_id}/customizations`,
        { headers: getAuthHeaders() }
      );
      setCustomizations(response.data.data || {});
    } catch (err) {
      console.error('Failed to fetch customizations:', err);
      setCustomizations({});
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomizations = async () => {
    if (!selectedCorporate) {
      showToast('Please select a corporate', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        `${API_URL}/api/admin/corporates/${selectedCorporate.tenant_id}/customize-portal`,
        customizations,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        showToast('Customizations saved successfully!', 'success');
        setCustomizations(response.data.data || {});
      }
    } catch (err) {
      showToast('Failed to save customizations', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      document.cookie = 'admin_token=; path=/; max-age=0';
      window.location.href = 'https://www.benefitnest.space';
    }
  };

  const handleBack = () => {
    router.push('/admin/dashboard');
  };

  const showToast = (message: string, type: string) => {
    setToast({ message, type });
  };

  const updateCustomization = (key: string, value: any) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Filter corporates
  const filteredCorporates = corporates.filter(corp => {
    const matchesSearch = corp.corporate_legal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      corp.subdomain.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'active') return matchesSearch && corp.status === 'ACTIVE';
    if (activeTab === 'customized') return matchesSearch && (corp.primary_color || corp.secondary_color);
    return matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.gray[50] }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: `1px solid ${colors.gray[200]}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Left Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Logo */}
            <img
              src="/images/marketing/logo.png"
              alt="BenefitNest"
              style={{ height: '36px', objectFit: 'contain' }}
            />

            {/* Back Button */}
            <Button variant="ghost" size="sm" icon="←" onClick={handleBack}>
              Dashboard
            </Button>

            {/* Page Title */}
            <div style={{ borderLeft: `1px solid ${colors.gray[200]}`, paddingLeft: '16px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '700', color: colors.gray[900], margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎨</span> Portal Customization
              </h1>
              <p style={{ fontSize: '12px', color: colors.gray[500], margin: 0 }}>
                Customize appearance & branding for corporate portals
              </p>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Save Button */}
            {selectedCorporate && (
              <Button variant="success" icon="✓" onClick={handleSaveCustomizations} loading={saving}>
                Save Changes
              </Button>
            )}

            {/* Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: `2px solid ${colors.gray[200]}`,
                backgroundColor: colors.primaryLight,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                transition: 'all 0.2s'
              }}
              title="Profile"
            >
              👤
            </button>

            {/* Logout Button */}
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Stats Cards */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <StatsCard
            value={stats.total}
            label="Total Corporates"
            icon="🏢"
            color={colors.primary}
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
          />
          <StatsCard
            value={stats.active}
            label="Active Corporates"
            icon="✅"
            color={colors.success}
            active={activeTab === 'active'}
            onClick={() => setActiveTab('active')}
          />
          <StatsCard
            value={stats.customized}
            label="Customized Portals"
            icon="🎨"
            color={colors.pink}
            active={activeTab === 'customized'}
            onClick={() => setActiveTab('customized')}
          />
        </div>

        {/* Corporate Selector Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${colors.gray[200]}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <SectionHeader title="Select Corporate" icon="🏢" />
          
          {/* Search Input */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="🔍 Search corporates by name or subdomain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Corporate Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '4px'
          }}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: colors.gray[500] }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                Loading corporates...
              </div>
            ) : filteredCorporates.length === 0 ? (
              <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: colors.gray[500] }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                No corporates found
              </div>
            ) : (
              filteredCorporates.map(corp => (
                <div
                  key={corp.tenant_id}
                  onClick={() => handleCorporateSelect(corp)}
                  style={{
                    padding: '16px',
                    border: selectedCorporate?.tenant_id === corp.tenant_id
                      ? `2px solid ${colors.pink}`
                      : `1px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: selectedCorporate?.tenant_id === corp.tenant_id
                      ? colors.pinkLight
                      : 'white',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {/* Status Badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <Badge variant={corp.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {corp.status || 'UNKNOWN'}
                    </Badge>
                  </div>

                  <div style={{ fontWeight: '600', color: colors.gray[900], marginBottom: '8px', paddingRight: '70px' }}>
                    {corp.corporate_legal_name}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.gray[600], marginBottom: '4px' }}>
                    🌐 <strong>{corp.subdomain}</strong>.benefitnest.space
                  </div>
                  <div style={{ fontSize: '11px', color: colors.gray[400] }}>
                    ID: {corp.tenant_id.substring(0, 8)}...
                  </div>

                  {/* Color Preview */}
                  {(corp.primary_color || corp.secondary_color) && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                      {corp.primary_color && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: corp.primary_color, border: `1px solid ${colors.gray[300]}` }} title="Primary Color" />
                      )}
                      {corp.secondary_color && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: corp.secondary_color, border: `1px solid ${colors.gray[300]}` }} title="Secondary Color" />
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Selected Corporate Info */}
          {selectedCorporate && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: colors.pinkLight,
              borderRadius: '8px',
              border: `1px solid ${colors.pink}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: colors.pink }}>
                  ✓ Editing: {selectedCorporate.corporate_legal_name}
                </div>
                <div style={{ fontSize: '12px', color: colors.pink, marginTop: '2px', opacity: 0.8 }}>
                  {selectedCorporate.subdomain}.benefitnest.space
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://${selectedCorporate.subdomain}.benefitnest.space`, '_blank')}
              >
                🔗 Preview Portal
              </Button>
            </div>
          )}
        </div>

        {/* Customization Form */}
        {selectedCorporate && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.gray[200]}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'grid', gap: '32px' }}>
              {/* VISUAL IDENTITY */}
              <section>
                <SectionHeader title="Visual Identity" icon="🎨" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <ColorInput label="Primary Color" value={customizations.primary_color} onChange={(e) => updateCustomization('primary_color', e.target.value)} />
                  <ColorInput label="Secondary Color" value={customizations.secondary_color} onChange={(e) => updateCustomization('secondary_color', e.target.value)} />
                  <ColorInput label="Accent Color" value={customizations.accent_color} onChange={(e) => updateCustomization('accent_color', e.target.value)} />
                  <ColorInput label="Background Color" value={customizations.background_color} onChange={(e) => updateCustomization('background_color', e.target.value)} />
                  <ColorInput label="Text Color" value={customizations.text_color} onChange={(e) => updateCustomization('text_color', e.target.value)} />
                  <ColorInput label="Border Color" value={customizations.border_color} onChange={(e) => updateCustomization('border_color', e.target.value)} />
                </div>
              </section>

              {/* TYPOGRAPHY */}
              <section>
                <SectionHeader title="Typography" icon="📝" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <Input label="Heading Font Family" value={customizations.heading_font_family || ''} onChange={(e) => updateCustomization('heading_font_family', e.target.value)} placeholder="e.g., Segoe UI, Georgia, Arial" />
                  <Input label="Body Font Family" value={customizations.body_font_family || ''} onChange={(e) => updateCustomization('body_font_family', e.target.value)} placeholder="e.g., Segoe UI, Open Sans" />
                  <Input label="Heading Font Size (px)" type="number" value={customizations.heading_font_size || 32} onChange={(e) => updateCustomization('heading_font_size', parseInt(e.target.value))} />
                  <Input label="Body Font Size (px)" type="number" value={customizations.body_font_size || 16} onChange={(e) => updateCustomization('body_font_size', parseInt(e.target.value))} />
                  <Input label="Line Height" type="number" step="0.1" value={customizations.line_height_multiplier || 1.6} onChange={(e) => updateCustomization('line_height_multiplier', parseFloat(e.target.value))} />
                  <Input label="Heading Font Weight" type="number" value={customizations.font_weight_heading || 700} onChange={(e) => updateCustomization('font_weight_heading', parseInt(e.target.value))} hint="400, 500, 600, 700, 800" />
                </div>
              </section>

              {/* LOGO & BRANDING */}
              <section>
                <SectionHeader title="Logo & Branding" icon="🏢" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Input label="Logo URL" value={customizations.logo_url || ''} onChange={(e) => updateCustomization('logo_url', e.target.value)} placeholder="https://example.com/logo.png" />
                  </div>
                  <Input label="Logo Width (px)" type="number" value={customizations.logo_width || 150} onChange={(e) => updateCustomization('logo_width', parseInt(e.target.value))} />
                  <Input label="Logo Height (px)" type="number" value={customizations.logo_height || 60} onChange={(e) => updateCustomization('logo_height', parseInt(e.target.value))} />
                  <Checkbox label="Sticky Header" value={customizations.header_sticky} onChange={(e) => updateCustomization('header_sticky', e.target.checked)} />
                </div>
              </section>

              {/* LAYOUT & SPACING */}
              <section>
                <SectionHeader title="Layout & Spacing" icon="📐" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <Input label="Container Max Width (px)" type="number" value={customizations.container_max_width || 1200} onChange={(e) => updateCustomization('container_max_width', parseInt(e.target.value))} />
                  <Input label="Container Padding X (px)" type="number" value={customizations.container_padding_x || 20} onChange={(e) => updateCustomization('container_padding_x', parseInt(e.target.value))} />
                  <Input label="Container Padding Y (px)" type="number" value={customizations.container_padding_y || 20} onChange={(e) => updateCustomization('container_padding_y', parseInt(e.target.value))} />
                  <Input label="Section Gap (px)" type="number" value={customizations.section_gap || 40} onChange={(e) => updateCustomization('section_gap', parseInt(e.target.value))} />
                </div>
              </section>

              {/* CONTENT MANAGEMENT */}
              <section>
                <SectionHeader title="Content Management" icon="✍️" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Input label="Portal Title" value={customizations.portal_title || ''} onChange={(e) => updateCustomization('portal_title', e.target.value)} placeholder="e.g., Our Employee Benefits" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Input label="Portal Tagline" value={customizations.portal_tagline || ''} onChange={(e) => updateCustomization('portal_tagline', e.target.value)} placeholder="Short tagline for the portal" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>
                      Portal Description
                    </label>
                    <textarea
                      value={customizations.portal_description || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateCustomization('portal_description', e.target.value)}
                      placeholder="Detailed description of your portal"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        minHeight: '100px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <Input label="Hero Headline" value={customizations.hero_headline || ''} onChange={(e) => updateCustomization('hero_headline', e.target.value)} placeholder="Main headline for hero section" />
                  <Input label="Hero Subheadline" value={customizations.hero_subheadline || ''} onChange={(e) => updateCustomization('hero_subheadline', e.target.value)} placeholder="Supporting text for hero" />
                  <Input label="Hero Background Image URL" value={customizations.hero_background_image_url || ''} onChange={(e) => updateCustomization('hero_background_image_url', e.target.value)} placeholder="https://example.com/hero-bg.jpg" />
                  <Input label="Hero CTA Button Text" value={customizations.hero_cta_button_text || ''} onChange={(e) => updateCustomization('hero_cta_button_text', e.target.value)} placeholder="e.g., Explore Benefits" />
                  <Input label="Hero CTA Button URL" value={customizations.hero_cta_button_url || ''} onChange={(e) => updateCustomization('hero_cta_button_url', e.target.value)} placeholder="https://example.com/benefits" />
                </div>
              </section>

              {/* COMPONENT VISIBILITY */}
              <section>
                <SectionHeader title="Component Visibility" icon="👁️" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {[
                    { key: 'show_header', label: 'Show Header' },
                    { key: 'show_hero_section', label: 'Show Hero Section' },
                    { key: 'show_benefits_section', label: 'Show Benefits Section' },
                    { key: 'show_features_section', label: 'Show Features Section' },
                    { key: 'show_contact_section', label: 'Show Contact Section' },
                    { key: 'show_faq_section', label: 'Show FAQ Section' },
                    { key: 'show_employee_directory', label: 'Show Employee Directory' },
                    { key: 'show_footer', label: 'Show Footer' }
                  ].map(item => (
                    <Checkbox
                      key={item.key}
                      label={item.label}
                      value={customizations[item.key] !== false}
                      onChange={(e) => updateCustomization(item.key, e.target.checked)}
                    />
                  ))}
                </div>
              </section>

              {/* REGIONAL SETTINGS */}
              <section>
                <SectionHeader title="Regional Settings" icon="🌍" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <Input label="Default Currency" value={customizations.default_currency || 'USD'} onChange={(e) => updateCustomization('default_currency', e.target.value)} placeholder="USD, EUR, INR" />
                  <Input label="Timezone" value={customizations.timezone || 'UTC'} onChange={(e) => updateCustomization('timezone', e.target.value)} placeholder="UTC, IST, EST" />
                  <Input label="Date Format" value={customizations.date_format || 'MM/DD/YYYY'} onChange={(e) => updateCustomization('date_format', e.target.value)} placeholder="MM/DD/YYYY or DD/MM/YYYY" />
                  <Input label="Default Language" value={customizations.default_language || 'en'} onChange={(e) => updateCustomization('default_language', e.target.value)} placeholder="en, es, fr, de" />
                </div>
              </section>

              {/* ADVANCED SETTINGS */}
              <section>
                <SectionHeader title="Advanced Settings" icon="⚙️" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  <Checkbox label="Dark Mode Enabled" value={customizations.dark_mode_enabled} onChange={(e) => updateCustomization('dark_mode_enabled', e.target.checked)} />
                  <Checkbox label="SSO Enabled" value={customizations.sso_enabled} onChange={(e) => updateCustomization('sso_enabled', e.target.checked)} />
                  <Checkbox label="GDPR Enabled" value={customizations.gdpr_enabled} onChange={(e) => updateCustomization('gdpr_enabled', e.target.checked)} />
                  <Checkbox label="Show Cookie Consent" value={customizations.show_cookie_consent} onChange={(e) => updateCustomization('show_cookie_consent', e.target.checked)} />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>
                    Custom CSS
                  </label>
                  <textarea
                    value={customizations.custom_css || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateCustomization('custom_css', e.target.value)}
                    placeholder="/* Add custom CSS rules here... */"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      minHeight: '150px',
                      fontFamily: 'Monaco, Consolas, monospace',
                      backgroundColor: colors.gray[50],
                      resize: 'vertical'
                    }}
                  />
                </div>
              </section>
            </div>

            {/* Action Buttons */}
            <div style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: `1px solid ${colors.gray[200]}`,
              display: 'flex',
              gap: '12px',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Button
                variant="outline"
                onClick={() => window.open(`https://${selectedCorporate.subdomain}.benefitnest.space`, '_blank')}
              >
                🔗 Preview Portal
              </Button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="outline" onClick={() => setSelectedCorporate(null)}>
                  Cancel
                </Button>
                <Button variant="success" icon="✓" onClick={handleSaveCustomizations} loading={saving}>
                  Save Customizations
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedCorporate && !loading && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '80px 24px',
            textAlign: 'center',
            border: `1px solid ${colors.gray[200]}`
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎨</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: colors.gray[900], marginBottom: '8px' }}>
              Select a Corporate to Customize
            </div>
            <div style={{ fontSize: '14px', color: colors.gray[500], maxWidth: '400px', margin: '0 auto' }}>
              Choose a corporate from the list above to customize their portal appearance, branding, and settings.
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: `1px solid ${colors.gray[200]}`,
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '13px', color: colors.gray[500], margin: 0 }}>
            🔒 Portal Customization · Changes are logged · Role-based access enforced
          </p>
        </div>
      </main>

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Admin Profile" icon="👤" size="sm">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {/* Avatar */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: colors.primaryLight,
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            border: `3px solid ${colors.primary}`
          }}>
            👤
          </div>

          {/* Name */}
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.gray[900], margin: '0 0 4px 0' }}>
            {userProfile.name}
          </h3>

          {/* Role Badge */}
          <div style={{ marginBottom: '16px' }}>
            <Badge variant="info">{userProfile.role}</Badge>
          </div>

          {/* Email */}
          <p style={{ fontSize: '14px', color: colors.gray[600], margin: '0 0 24px 0' }}>
            📧 {userProfile.email}
          </p>

          {/* Info Cards */}
          <div style={{
            backgroundColor: colors.gray[50],
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
              <div>
                <div style={{ fontSize: '11px', color: colors.gray[500], marginBottom: '4px' }}>STATUS</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: colors.success }}>● Active</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.gray[500], marginBottom: '4px' }}>LAST LOGIN</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: colors.gray[700] }}>Today</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="outline" onClick={() => setShowProfileModal(false)}>
              Close
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Global Styles */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { 
          border-color: ${colors.primary} !important; 
          box-shadow: 0 0 0 3px ${colors.primaryLight}; 
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${colors.gray[100]}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: ${colors.gray[300]}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.gray[400]}; }
      `}</style>
    </div>
  );
}
