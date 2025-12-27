'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://benefitnest-backend.onrender.com';

// =====================================================
// DESIGN SYSTEM COLORS
// =====================================================
const colors = {
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  primaryLight: '#e0e7ff',
  secondary: '#8b5cf6',
  secondaryLight: '#ede9fe',
  success: '#10b981',
  successHover: '#059669',
  successLight: '#d1fae5',
  danger: '#ef4444',
  dangerHover: '#dc2626',
  dangerLight: '#fee2e2',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  info: '#0ea5e9',
  infoLight: '#e0f2fe',
  pink: '#ec4899',
  pinkLight: '#fce7f3',
  gray: {
    50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db',
    400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151',
    800: '#1f2937', 900: '#111827'
  }
};

// =====================================================
// FONT DATABASE WITH AI SUGGESTIONS
// =====================================================
const FONT_DATABASE = {
  professional: [
    { name: 'Inter', category: 'Sans-serif', mood: 'Modern, Clean', pairing: 'Playfair Display' },
    { name: 'Roboto', category: 'Sans-serif', mood: 'Versatile, Friendly', pairing: 'Roboto Slab' },
    { name: 'Open Sans', category: 'Sans-serif', mood: 'Neutral, Readable', pairing: 'Lora' },
    { name: 'Lato', category: 'Sans-serif', mood: 'Warm, Stable', pairing: 'Merriweather' },
    { name: 'Montserrat', category: 'Sans-serif', mood: 'Geometric, Bold', pairing: 'Source Serif Pro' },
    { name: 'Poppins', category: 'Sans-serif', mood: 'Geometric, Modern', pairing: 'Lora' },
    { name: 'Nunito', category: 'Sans-serif', mood: 'Rounded, Friendly', pairing: 'Nunito Sans' },
  ],
  elegant: [
    { name: 'Playfair Display', category: 'Serif', mood: 'Elegant, Classic', pairing: 'Source Sans Pro' },
    { name: 'Merriweather', category: 'Serif', mood: 'Readable, Traditional', pairing: 'Open Sans' },
    { name: 'Lora', category: 'Serif', mood: 'Contemporary, Balanced', pairing: 'Lato' },
    { name: 'Source Serif Pro', category: 'Serif', mood: 'Editorial, Clear', pairing: 'Source Sans Pro' },
    { name: 'Crimson Text', category: 'Serif', mood: 'Book-like, Refined', pairing: 'Work Sans' },
    { name: 'Libre Baskerville', category: 'Serif', mood: 'Classic, Authoritative', pairing: 'Source Sans Pro' },
  ],
  creative: [
    { name: 'Raleway', category: 'Sans-serif', mood: 'Elegant, Stylish', pairing: 'Lora' },
    { name: 'Josefin Sans', category: 'Sans-serif', mood: 'Vintage, Geometric', pairing: 'Playfair Display' },
    { name: 'Quicksand', category: 'Sans-serif', mood: 'Rounded, Friendly', pairing: 'EB Garamond' },
    { name: 'Comfortaa', category: 'Sans-serif', mood: 'Rounded, Fun', pairing: 'Roboto' },
  ],
  system: [
    { name: 'Segoe UI', category: 'System', mood: 'Windows Native', pairing: 'Georgia' },
    { name: 'SF Pro Display', category: 'System', mood: 'Apple Native', pairing: 'New York' },
    { name: 'Arial', category: 'System', mood: 'Universal, Safe', pairing: 'Times New Roman' },
    { name: 'Helvetica', category: 'System', mood: 'Swiss, Clean', pairing: 'Georgia' },
    { name: 'Georgia', category: 'Serif', mood: 'Web Classic', pairing: 'Verdana' },
  ]
};

const ALL_FONTS = [...FONT_DATABASE.professional, ...FONT_DATABASE.elegant, ...FONT_DATABASE.creative, ...FONT_DATABASE.system];

// =====================================================
// COLOR PALETTES FOR AI SUGGESTIONS
// =====================================================
const COLOR_PALETTES = {
  corporate: [
    { name: 'Navy Professional', primary: '#1e3a8a', secondary: '#3b82f6', accent: '#f59e0b' },
    { name: 'Forest Trust', primary: '#166534', secondary: '#22c55e', accent: '#eab308' },
    { name: 'Royal Purple', primary: '#581c87', secondary: '#a855f7', accent: '#f97316' },
  ],
  modern: [
    { name: 'Electric Blue', primary: '#2563eb', secondary: '#06b6d4', accent: '#f43f5e' },
    { name: 'Sunset Gradient', primary: '#dc2626', secondary: '#f97316', accent: '#fbbf24' },
    { name: 'Ocean Breeze', primary: '#0891b2', secondary: '#14b8a6', accent: '#8b5cf6' },
  ],
  healthcare: [
    { name: 'Medical Blue', primary: '#0284c7', secondary: '#22d3ee', accent: '#10b981' },
    { name: 'Wellness Green', primary: '#059669', secondary: '#34d399', accent: '#3b82f6' },
    { name: 'Care Purple', primary: '#7c3aed', secondary: '#a78bfa', accent: '#ec4899' },
  ],
  finance: [
    { name: 'Trust Blue', primary: '#1e40af', secondary: '#60a5fa', accent: '#fbbf24' },
    { name: 'Wealth Green', primary: '#047857', secondary: '#34d399', accent: '#f59e0b' },
    { name: 'Premium Black', primary: '#18181b', secondary: '#52525b', accent: '#eab308' },
  ]
};

// =====================================================
// INTERFACES
// =====================================================
interface Corporate {
  tenant_id: string;
  corporate_legal_name: string;
  subdomain: string;
  company_name?: string;
  primary_color?: string;
  secondary_color?: string;
  status?: string;
  industry?: string;
}

interface Customizations {
  [key: string]: any;
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
// AI HELPER FUNCTIONS
// =====================================================
const getAIFontSuggestion = (industry?: string, mood?: string): { heading: string; body: string; reason: string } => {
  const suggestions: Record<string, { heading: string; body: string; reason: string }> = {
    healthcare: { heading: 'Nunito', body: 'Open Sans', reason: 'Friendly and readable - builds patient trust' },
    finance: { heading: 'Playfair Display', body: 'Source Sans Pro', reason: 'Classic elegance conveys stability and trust' },
    technology: { heading: 'Inter', body: 'Inter', reason: 'Modern and clean - reflects innovation' },
    retail: { heading: 'Poppins', body: 'Lato', reason: 'Approachable and modern - great for consumer brands' },
    legal: { heading: 'Libre Baskerville', body: 'Source Serif Pro', reason: 'Authoritative and traditional - conveys expertise' },
    education: { heading: 'Merriweather', body: 'Open Sans', reason: 'Readable and scholarly - promotes learning' },
    default: { heading: 'Montserrat', body: 'Open Sans', reason: 'Versatile combination that works for most industries' }
  };
  return suggestions[industry?.toLowerCase() || 'default'] || suggestions.default;
};

const getAIColorSuggestion = (industry?: string): { primary: string; secondary: string; accent: string; reason: string } => {
  const suggestions: Record<string, { primary: string; secondary: string; accent: string; reason: string }> = {
    healthcare: { primary: '#0891b2', secondary: '#14b8a6', accent: '#f59e0b', reason: 'Calming blues and greens inspire trust and health' },
    finance: { primary: '#1e40af', secondary: '#3b82f6', accent: '#eab308', reason: 'Deep blue conveys stability, gold suggests prosperity' },
    technology: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4', reason: 'Vibrant purples feel innovative and forward-thinking' },
    retail: { primary: '#dc2626', secondary: '#f97316', accent: '#fbbf24', reason: 'Warm colors create urgency and excitement' },
    legal: { primary: '#1f2937', secondary: '#4b5563', accent: '#b91c1c', reason: 'Dark neutrals convey authority and professionalism' },
    education: { primary: '#059669', secondary: '#10b981', accent: '#3b82f6', reason: 'Green represents growth and learning' },
    default: { primary: '#2563eb', secondary: '#10b981', accent: '#f59e0b', reason: 'Balanced palette works across industries' }
  };
  return suggestions[industry?.toLowerCase() || 'default'] || suggestions.default;
};

// =====================================================
// REUSABLE COMPONENTS
// =====================================================
const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, disabled, loading, style = {} }: any) => {
  const variants: Record<string, any> = {
    primary: { bg: colors.primary, hoverBg: colors.primaryHover, color: 'white' },
    secondary: { bg: colors.secondary, hoverBg: '#7c3aed', color: 'white' },
    success: { bg: colors.success, hoverBg: colors.successHover, color: 'white' },
    danger: { bg: colors.danger, hoverBg: colors.dangerHover, color: 'white' },
    warning: { bg: colors.warning, hoverBg: '#d97706', color: 'white' },
    outline: { bg: 'white', hoverBg: colors.gray[50], color: colors.gray[700], border: `1px solid ${colors.gray[300]}` },
    ghost: { bg: 'transparent', hoverBg: colors.gray[100], color: colors.gray[700] },
    gradient: { bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', hoverBg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white' }
  };
  const sizes: Record<string, any> = {
    xs: { padding: '4px 8px', fontSize: '11px' },
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 16px', fontSize: '14px' },
    lg: { padding: '14px 24px', fontSize: '16px' }
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
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: s.padding, fontSize: s.fontSize, fontWeight: '600',
        color: v.color,
        background: hover && !disabled ? v.hoverBg : v.bg,
        border: v.border || 'none',
        borderRadius: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        boxShadow: variant === 'gradient' ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
        ...style
      }}
    >
      {loading ? <span className="spinner" /> : icon ? <span>{icon}</span> : null}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default' }: any) => {
  const variants: Record<string, any> = {
    default: { bg: colors.gray[100], color: colors.gray[700] },
    success: { bg: colors.successLight, color: '#065f46' },
    danger: { bg: colors.dangerLight, color: '#991b1b' },
    warning: { bg: colors.warningLight, color: '#92400e' },
    info: { bg: colors.infoLight, color: '#0369a1' },
    primary: { bg: colors.primaryLight, color: '#3730a3' },
    pink: { bg: colors.pinkLight, color: '#9d174d' }
  };
  const v = variants[variant] || variants.default;
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', backgroundColor: v.bg, color: v.color }}>{children}</span>;
};

const Toast = ({ message, type = 'info', onClose }: any) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const types: Record<string, any> = {
    success: { bg: colors.successLight, color: '#065f46', icon: '✓' },
    error: { bg: colors.dangerLight, color: '#991b1b', icon: '✕' },
    warning: { bg: colors.warningLight, color: '#92400e', icon: '⚠' },
    info: { bg: colors.primaryLight, color: colors.primary, icon: 'ℹ' },
    ai: { bg: '#e0e7ff', color: '#4338ca', icon: '🤖' }
  };
  const t = types[type] || types.info;
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: t.bg, color: t.color, padding: '16px 20px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2000, maxWidth: '400px', animation: 'slideIn 0.3s ease' }}>
      <span style={{ fontSize: '18px' }}>{t.icon}</span>
      <span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.color, cursor: 'pointer', fontSize: '18px', marginLeft: '8px', opacity: 0.7 }}>×</button>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, icon, children, size = 'md' }: any) => {
  if (!isOpen) return null;
  const sizeStyles: Record<string, string> = { sm: '480px', md: '640px', lg: '900px', xl: '1200px', full: '95vw' };
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: sizeStyles[size], maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', animation: 'modalIn 0.3s ease' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.gray[900], margin: 0 }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', backgroundColor: colors.gray[100], cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>×</button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

// Smart Font Selector with AI
const FontSelector = ({ label, value, onChange, onAISuggest, aiSuggestion }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  
  const filteredFonts = useMemo(() => {
    let fonts = ALL_FONTS;
    if (category !== 'all') {
      fonts = FONT_DATABASE[category as keyof typeof FONT_DATABASE] || ALL_FONTS;
    }
    if (search) {
      fonts = fonts.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    }
    return fonts;
  }, [category, search]);

  return (
    <div style={{ marginBottom: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}</label>
        {onAISuggest && (
          <button onClick={onAISuggest} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🤖</span> AI Suggest
          </button>
        )}
      </div>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px 14px',
          border: `2px solid ${isOpen ? colors.primary : colors.gray[200]}`,
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          transition: 'all 0.2s'
        }}
      >
        <span style={{ fontFamily: value || 'inherit', fontSize: '14px' }}>{value || 'Select font...'}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </div>
      
      {aiSuggestion && (
        <div style={{ marginTop: '6px', padding: '8px 12px', backgroundColor: colors.primaryLight, borderRadius: '8px', fontSize: '12px', color: colors.primary }}>
          <strong>🤖 AI:</strong> {aiSuggestion}
        </div>
      )}
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: `1px solid ${colors.gray[200]}`, borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 100, marginTop: '4px', maxHeight: '300px', overflow: 'hidden' }}>
          <div style={{ padding: '12px', borderBottom: `1px solid ${colors.gray[100]}` }}>
            <input
              type="text"
              placeholder="🔍 Search fonts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '8px', fontSize: '13px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {['all', 'professional', 'elegant', 'creative', 'system'].map(cat => (
                <button
                  key={cat}
                  onClick={(e) => { e.stopPropagation(); setCategory(cat); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: category === cat ? colors.primary : colors.gray[100],
                    color: category === cat ? 'white' : colors.gray[600],
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredFonts.map(font => (
              <div
                key={font.name}
                onClick={() => { onChange(font.name); setIsOpen(false); }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: `1px solid ${colors.gray[50]}`,
                  backgroundColor: value === font.name ? colors.primaryLight : 'white',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.gray[50])}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = value === font.name ? colors.primaryLight : 'white')}
              >
                <div style={{ fontFamily: font.name, fontSize: '15px', fontWeight: '600', marginBottom: '2px' }}>{font.name}</div>
                <div style={{ fontSize: '11px', color: colors.gray[500] }}>{font.category} • {font.mood}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Color Picker with Palettes
const ColorPicker = ({ label, value, onChange, onAISuggest, showPalettes = true }: any) => {
  const [showPalette, setShowPalette] = useState(false);
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}</label>
        {onAISuggest && (
          <button onClick={onAISuggest} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🤖</span> AI Suggest
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="color"
            value={value || '#2563eb'}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '48px', height: '48px', border: `2px solid ${colors.gray[200]}`, borderRadius: '10px', cursor: 'pointer', padding: '2px' }}
          />
        </div>
        <input
          type="text"
          value={value || '#2563eb'}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, padding: '12px 14px', border: `2px solid ${colors.gray[200]}`, borderRadius: '10px', fontSize: '14px', fontFamily: 'monospace', outline: 'none' }}
        />
        {showPalettes && (
          <button
            onClick={() => setShowPalette(!showPalette)}
            style={{ padding: '12px', border: `2px solid ${colors.gray[200]}`, borderRadius: '10px', backgroundColor: 'white', cursor: 'pointer' }}
            title="Color Palettes"
          >
            🎨
          </button>
        )}
      </div>
      {showPalette && (
        <div style={{ marginTop: '8px', padding: '12px', backgroundColor: colors.gray[50], borderRadius: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: colors.gray[500], marginBottom: '8px' }}>QUICK COLORS</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9', '#1f2937', '#6366f1', '#059669'].map(c => (
              <div
                key={c}
                onClick={() => { onChange(c); setShowPalette(false); }}
                style={{ width: '28px', height: '28px', backgroundColor: c, borderRadius: '6px', cursor: 'pointer', border: value === c ? '3px solid white' : 'none', boxShadow: value === c ? `0 0 0 2px ${c}` : '0 1px 3px rgba(0,0,0,0.1)' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Input with Label
const Input = ({ label, value, onChange, type = 'text', placeholder, hint, icon, required }: any) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>
        {label}{required && <span style={{ color: colors.danger }}>*</span>}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: icon ? '12px 14px 12px 42px' : '12px 14px',
          border: `2px solid ${colors.gray[200]}`,
          borderRadius: '10px',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box'
        }}
      />
    </div>
    {hint && <div style={{ fontSize: '11px', color: colors.gray[500], marginTop: '4px' }}>{hint}</div>}
  </div>
);

// Toggle Switch
const Toggle = ({ label, value, onChange, description }: any) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', padding: '12px', backgroundColor: value ? colors.primaryLight : colors.gray[50], borderRadius: '10px', transition: 'all 0.2s' }}>
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '48px',
        height: '26px',
        borderRadius: '13px',
        border: 'none',
        backgroundColor: value ? colors.primary : colors.gray[300],
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s',
        flexShrink: 0
      }}
    >
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'absolute',
        top: '2px',
        left: value ? '24px' : '2px',
        transition: 'all 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
    <div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: colors.gray[800] }}>{label}</div>
      {description && <div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '2px' }}>{description}</div>}
    </div>
  </div>
);

// Section Card
const SectionCard = ({ title, icon, children, collapsible = true, defaultOpen = true, aiAction }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: `1px solid ${colors.gray[200]}`, marginBottom: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div
        onClick={() => collapsible && setIsOpen(!isOpen)}
        style={{
          padding: '16px 20px',
          backgroundColor: colors.gray[50],
          borderBottom: isOpen ? `1px solid ${colors.gray[200]}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: collapsible ? 'pointer' : 'default'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.gray[900], margin: 0 }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {aiAction && (
            <button onClick={(e) => { e.stopPropagation(); aiAction(); }} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🤖 AI Fill
            </button>
          )}
          {collapsible && <span style={{ fontSize: '12px', color: colors.gray[400], transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>}
        </div>
      </div>
      {isOpen && <div style={{ padding: '20px' }}>{children}</div>}
    </div>
  );
};

// =====================================================
// LIVE PREVIEW COMPONENT
// =====================================================
const LivePreview = ({ customizations, companyName, subdomain }: any) => {
  const c = customizations;
  const primaryColor = c.primary_color || '#2563eb';
  const secondaryColor = c.secondary_color || '#10b981';
  const bgColor = c.background_color || '#ffffff';
  const textColor = c.text_color || '#111827';
  const headingFont = c.heading_font_family || 'Segoe UI';
  const bodyFont = c.body_font_family || 'Segoe UI';
  const logoUrl = c.logo_url;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#1f2937', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Browser Chrome */}
      <div style={{ backgroundColor: '#374151', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
        </div>
        <div style={{ flex: 1, backgroundColor: '#1f2937', borderRadius: '6px', padding: '6px 12px', marginLeft: '8px' }}>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>🔒 https://{subdomain || 'company'}.benefitnest.space</span>
        </div>
      </div>
      
      {/* Preview Content */}
      <div style={{ flex: 1, overflow: 'auto', backgroundColor: bgColor }}>
        {/* Mini Header */}
        <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ height: '32px', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🏢</div>
            )}
            <span style={{ color: 'white', fontWeight: '700', fontSize: '14px', fontFamily: headingFont }}>{c.portal_title || companyName || 'Company Portal'}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', color: 'white' }}>Login</div>
          </div>
        </div>

        {/* Hero Section */}
        {c.show_hero_section !== false && (
          <div style={{
            background: c.hero_background_image_url ? `url(${c.hero_background_image_url}) center/cover` : `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`,
            padding: '32px 20px',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: primaryColor, marginBottom: '8px', fontFamily: headingFont }}>
              {c.hero_headline || 'Welcome to Your Benefits'}
            </h1>
            <p style={{ fontSize: '12px', color: textColor, opacity: 0.7, marginBottom: '16px', fontFamily: bodyFont }}>
              {c.hero_subheadline || 'Access your employee benefits anytime, anywhere'}
            </p>
            {c.hero_cta_button_text && (
              <button style={{ backgroundColor: primaryColor, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                {c.hero_cta_button_text}
              </button>
            )}
          </div>
        )}

        {/* Features Grid */}
        {c.show_features_section !== false && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {['🏥 Health', '📋 Policies', '👨‍👩‍👧 Family'].map((item, i) => (
                <div key={i} style={{ backgroundColor: colors.gray[50], padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.split(' ')[0]}</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: textColor, fontFamily: bodyFont }}>{item.split(' ')[1]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {c.show_footer !== false && (
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${colors.gray[200]}`, textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: colors.gray[400] }}>Powered by BenefitNest</span>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function PortalCustomizationPage() {
  const router = useRouter();

  // State
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
  const [customizations, setCustomizations] = useState<Customizations>({});
  const [originalCustomizations, setOriginalCustomizations] = useState<Customizations>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // UI State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeDesignTab, setActiveDesignTab] = useState('branding');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});

  // Fetch corporates on mount
  useEffect(() => {
    fetchCorporates();
  }, []);

  // Track unsaved changes
  useEffect(() => {
    if (selectedCorporate) {
      const hasChanges = JSON.stringify(customizations) !== JSON.stringify(originalCustomizations);
      setHasUnsavedChanges(hasChanges);
    }
  }, [customizations, originalCustomizations, selectedCorporate]);

  const fetchCorporates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/corporates?limit=1000`, { headers: getAuthHeaders() });
      setCorporates(response.data.data || []);
    } catch (err) {
      showToast('Failed to load corporates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCorporateSelect = async (corporate: Corporate) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Discard them?')) return;
    }
    setSelectedCorporate(corporate);
    setActiveDesignTab('branding');
    await fetchCustomizations(corporate);
  };

  const fetchCustomizations = async (corporate: Corporate) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/corporates/${corporate.tenant_id}/customizations`, { headers: getAuthHeaders() });
      const data = response.data.data || {};
      setCustomizations(data);
      setOriginalCustomizations(data);
      setAiSuggestions({});
    } catch (err) {
      setCustomizations({});
      setOriginalCustomizations({});
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomizations = async () => {
    if (!selectedCorporate) return;
    try {
      setSaving(true);
      const response = await axios.post(`${API_URL}/api/admin/corporates/${selectedCorporate.tenant_id}/customize-portal`, customizations, { headers: getAuthHeaders() });
      if (response.data.success) {
        showToast('✨ Customizations saved successfully!', 'success');
        setOriginalCustomizations(customizations);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      showToast('Failed to save customizations', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; max-age=0';
    window.location.href = 'https://www.benefitnest.space';
  };

  const showToast = (message: string, type: string) => setToast({ message, type });

  const updateCustomization = (key: string, value: any) => {
    setCustomizations(prev => ({ ...prev, [key]: value }));
  };

  // AI Functions
  const applyAIColorSuggestion = () => {
    const suggestion = getAIColorSuggestion(selectedCorporate?.industry);
    setCustomizations(prev => ({
      ...prev,
      primary_color: suggestion.primary,
      secondary_color: suggestion.secondary,
      accent_color: suggestion.accent
    }));
    setAiSuggestions(prev => ({ ...prev, colors: suggestion.reason }));
    showToast(`🤖 ${suggestion.reason}`, 'ai');
  };

  const applyAIFontSuggestion = () => {
    const suggestion = getAIFontSuggestion(selectedCorporate?.industry);
    setCustomizations(prev => ({
      ...prev,
      heading_font_family: suggestion.heading,
      body_font_family: suggestion.body
    }));
    setAiSuggestions(prev => ({ ...prev, fonts: suggestion.reason }));
    showToast(`🤖 ${suggestion.reason}`, 'ai');
  };

  const applyFullAISuggestion = () => {
    const colorSuggestion = getAIColorSuggestion(selectedCorporate?.industry);
    const fontSuggestion = getAIFontSuggestion(selectedCorporate?.industry);
    setCustomizations(prev => ({
      ...prev,
      primary_color: colorSuggestion.primary,
      secondary_color: colorSuggestion.secondary,
      accent_color: colorSuggestion.accent,
      heading_font_family: fontSuggestion.heading,
      body_font_family: fontSuggestion.body,
      hero_headline: `Welcome to ${selectedCorporate?.corporate_legal_name || 'Your'} Benefits`,
      hero_subheadline: 'Access your complete benefits package anytime, anywhere',
      portal_title: selectedCorporate?.corporate_legal_name || 'Employee Portal',
      portal_tagline: 'Your Employee Benefits Hub'
    }));
    showToast('🤖 AI has configured optimal settings for your portal!', 'ai');
  };

  // Filtering & Pagination
  const filteredCorporates = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return corporates.filter(corp =>
      corp.corporate_legal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      corp.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [corporates, searchQuery]);

  const paginatedCorporates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCorporates.slice(start, start + itemsPerPage);
  }, [filteredCorporates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCorporates.length / itemsPerPage);

  // Design Tabs
  const designTabs = [
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '📝' },
    { id: 'content', label: 'Content', icon: '✍️' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'components', label: 'Components', icon: '🧩' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => router.push('/admin/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              ← Dashboard
            </button>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🎨</span> Portal Designer Studio
              </h1>
              <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>AI-Powered Customization Platform</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {hasUnsavedChanges && <Badge variant="warning">Unsaved Changes</Badge>}
            {selectedCorporate && (
              <>
                <Button variant="outline" size="sm" icon="👁️" onClick={() => setShowPreviewModal(true)} style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                  Full Preview
                </Button>
                <Button variant="gradient" size="sm" icon="✓" onClick={handleSaveCustomizations} loading={saving}>
                  Save Design
                </Button>
              </>
            )}
            <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.2)', border: 'none', color: '#fca5a5', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: selectedCorporate ? '1fr 400px' : '1fr', gap: '24px' }}>
        {/* Left Panel - Controls */}
        <div>
          {/* Corporate Search */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>🏢</span>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: colors.gray[900] }}>Select Corporate</h2>
                <p style={{ fontSize: '12px', color: colors.gray[500], margin: 0 }}>Search and select a company to customize</p>
              </div>
            </div>
            
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Type company name or subdomain to search..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div style={{ marginTop: '16px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: colors.gray[500] }}>Loading...</div>
                ) : filteredCorporates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: colors.gray[500] }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                    No companies found for "{searchQuery}"
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '12px', color: colors.gray[500], marginBottom: '12px' }}>
                      Found {filteredCorporates.length} compan{filteredCorporates.length === 1 ? 'y' : 'ies'}
                    </div>
                    
                    {/* Results List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {paginatedCorporates.map(corp => (
                        <div
                          key={corp.tenant_id}
                          onClick={() => handleCorporateSelect(corp)}
                          style={{
                            padding: '16px',
                            border: `2px solid ${selectedCorporate?.tenant_id === corp.tenant_id ? colors.primary : colors.gray[200]}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            backgroundColor: selectedCorporate?.tenant_id === corp.tenant_id ? colors.primaryLight : 'white',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: corp.primary_color || colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>
                              {corp.corporate_legal_name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: colors.gray[900], fontSize: '14px' }}>{corp.corporate_legal_name}</div>
                              <div style={{ fontSize: '12px', color: colors.gray[500] }}>{corp.subdomain}.benefitnest.space</div>
                            </div>
                          </div>
                          <Badge variant={corp.status === 'ACTIVE' ? 'success' : 'warning'}>{corp.status || 'UNKNOWN'}</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          style={{
                            padding: '8px 12px',
                            border: `1px solid ${colors.gray[200]}`,
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage === 1 ? 0.5 : 1,
                            fontSize: '13px'
                          }}
                        >
                          ← Previous
                        </button>
                        <span style={{ fontSize: '13px', color: colors.gray[600], padding: '0 12px' }}>
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          style={{
                            padding: '8px 12px',
                            border: `1px solid ${colors.gray[200]}`,
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            fontSize: '13px'
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Selected Corporate */}
            {selectedCorporate && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '12px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Currently Editing</div>
                    <div style={{ fontSize: '16px', fontWeight: '700' }}>{selectedCorporate.corporate_legal_name}</div>
                  </div>
                  <button
                    onClick={() => window.open(`https://${selectedCorporate.subdomain}.benefitnest.space`, '_blank')}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                  >
                    🔗 Visit Portal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Design Controls */}
          {selectedCorporate && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              {/* AI Quick Actions */}
              <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🤖</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>AI Design Assistant</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button size="sm" variant="warning" onClick={applyAIColorSuggestion}>Auto Colors</Button>
                    <Button size="sm" variant="warning" onClick={applyAIFontSuggestion}>Auto Fonts</Button>
                    <Button size="sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: 'white' }} onClick={applyFullAISuggestion}>✨ Full AI Setup</Button>
                  </div>
                </div>
                {aiSuggestions.colors && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#92400e', backgroundColor: 'rgba(255,255,255,0.5)', padding: '8px 12px', borderRadius: '6px' }}>
                    💡 {aiSuggestions.colors}
                  </div>
                )}
              </div>

              {/* Design Tabs */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${colors.gray[200]}`, overflowX: 'auto' }}>
                {designTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDesignTab(tab.id)}
                    style={{
                      padding: '14px 20px',
                      border: 'none',
                      borderBottom: `3px solid ${activeDesignTab === tab.id ? colors.primary : 'transparent'}`,
                      backgroundColor: activeDesignTab === tab.id ? colors.primaryLight : 'transparent',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: activeDesignTab === tab.id ? colors.primary : colors.gray[600],
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ padding: '20px', maxHeight: '600px', overflowY: 'auto' }}>
                {/* Branding Tab */}
                {activeDesignTab === 'branding' && (
                  <div>
                    <ColorPicker label="Primary Color" value={customizations.primary_color} onChange={(v: string) => updateCustomization('primary_color', v)} onAISuggest={applyAIColorSuggestion} />
                    <ColorPicker label="Secondary Color" value={customizations.secondary_color} onChange={(v: string) => updateCustomization('secondary_color', v)} />
                    <ColorPicker label="Accent Color" value={customizations.accent_color} onChange={(v: string) => updateCustomization('accent_color', v)} />
                    <ColorPicker label="Background Color" value={customizations.background_color} onChange={(v: string) => updateCustomization('background_color', v)} />
                    <ColorPicker label="Text Color" value={customizations.text_color} onChange={(v: string) => updateCustomization('text_color', v)} />
                    
                    <div style={{ marginTop: '24px' }}>
                      <Input label="Logo URL" value={customizations.logo_url || ''} onChange={(v: string) => updateCustomization('logo_url', v)} placeholder="https://example.com/logo.png" icon="🖼️" />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Input label="Logo Width (px)" type="number" value={customizations.logo_width || 150} onChange={(v: string) => updateCustomization('logo_width', parseInt(v))} />
                        <Input label="Logo Height (px)" type="number" value={customizations.logo_height || 60} onChange={(v: string) => updateCustomization('logo_height', parseInt(v))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Typography Tab */}
                {activeDesignTab === 'typography' && (
                  <div>
                    <FontSelector
                      label="Heading Font"
                      value={customizations.heading_font_family}
                      onChange={(v: string) => updateCustomization('heading_font_family', v)}
                      onAISuggest={applyAIFontSuggestion}
                      aiSuggestion={aiSuggestions.fonts}
                    />
                    <FontSelector
                      label="Body Font"
                      value={customizations.body_font_family}
                      onChange={(v: string) => updateCustomization('body_font_family', v)}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Input label="Heading Size (px)" type="number" value={customizations.heading_font_size || 32} onChange={(v: string) => updateCustomization('heading_font_size', parseInt(v))} />
                      <Input label="Body Size (px)" type="number" value={customizations.body_font_size || 16} onChange={(v: string) => updateCustomization('body_font_size', parseInt(v))} />
                      <Input label="Heading Weight" type="number" value={customizations.font_weight_heading || 700} onChange={(v: string) => updateCustomization('font_weight_heading', parseInt(v))} hint="400-900" />
                      <Input label="Line Height" type="number" value={customizations.line_height_multiplier || 1.6} onChange={(v: string) => updateCustomization('line_height_multiplier', parseFloat(v))} hint="1.0-2.0" />
                    </div>
                  </div>
                )}

                {/* Content Tab */}
                {activeDesignTab === 'content' && (
                  <div>
                    <Input label="Portal Title" value={customizations.portal_title || ''} onChange={(v: string) => updateCustomization('portal_title', v)} placeholder="Your Company Benefits" icon="📛" />
                    <Input label="Portal Tagline" value={customizations.portal_tagline || ''} onChange={(v: string) => updateCustomization('portal_tagline', v)} placeholder="Your Employee Benefits Hub" icon="💬" />
                    
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>Portal Description</label>
                      <textarea
                        value={customizations.portal_description || ''}
                        onChange={(e) => updateCustomization('portal_description', e.target.value)}
                        placeholder="A brief description of your benefits portal..."
                        style={{ width: '100%', padding: '12px 14px', border: `2px solid ${colors.gray[200]}`, borderRadius: '10px', fontSize: '14px', minHeight: '80px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: colors.gray[50], borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[700], marginBottom: '12px' }}>🦸 Hero Section</div>
                      <Input label="Headline" value={customizations.hero_headline || ''} onChange={(v: string) => updateCustomization('hero_headline', v)} placeholder="Welcome to Your Benefits" />
                      <Input label="Subheadline" value={customizations.hero_subheadline || ''} onChange={(v: string) => updateCustomization('hero_subheadline', v)} placeholder="Access everything in one place" />
                      <Input label="Background Image URL" value={customizations.hero_background_image_url || ''} onChange={(v: string) => updateCustomization('hero_background_image_url', v)} placeholder="https://example.com/hero.jpg" icon="🖼️" />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Input label="CTA Button Text" value={customizations.hero_cta_button_text || ''} onChange={(v: string) => updateCustomization('hero_cta_button_text', v)} placeholder="Get Started" />
                        <Input label="CTA Button URL" value={customizations.hero_cta_button_url || ''} onChange={(v: string) => updateCustomization('hero_cta_button_url', v)} placeholder="/benefits" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Layout Tab */}
                {activeDesignTab === 'layout' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Input label="Container Max Width (px)" type="number" value={customizations.container_max_width || 1200} onChange={(v: string) => updateCustomization('container_max_width', parseInt(v))} />
                      <Input label="Section Gap (px)" type="number" value={customizations.section_gap || 40} onChange={(v: string) => updateCustomization('section_gap', parseInt(v))} />
                      <Input label="Padding X (px)" type="number" value={customizations.container_padding_x || 20} onChange={(v: string) => updateCustomization('container_padding_x', parseInt(v))} />
                      <Input label="Padding Y (px)" type="number" value={customizations.container_padding_y || 20} onChange={(v: string) => updateCustomization('container_padding_y', parseInt(v))} />
                    </div>
                    
                    <div style={{ marginTop: '24px' }}>
                      <Toggle label="Sticky Header" value={customizations.header_sticky} onChange={(v: boolean) => updateCustomization('header_sticky', v)} description="Keep header visible while scrolling" />
                    </div>
                  </div>
                )}

                {/* Components Tab */}
                {activeDesignTab === 'components' && (
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[700], marginBottom: '16px' }}>Toggle which sections appear on the portal</div>
                    <Toggle label="Header" value={customizations.show_header !== false} onChange={(v: boolean) => updateCustomization('show_header', v)} description="Navigation header with logo" />
                    <Toggle label="Hero Section" value={customizations.show_hero_section !== false} onChange={(v: boolean) => updateCustomization('show_hero_section', v)} description="Welcome banner with headline" />
                    <Toggle label="Benefits Section" value={customizations.show_benefits_section !== false} onChange={(v: boolean) => updateCustomization('show_benefits_section', v)} description="Benefits overview cards" />
                    <Toggle label="Features Section" value={customizations.show_features_section !== false} onChange={(v: boolean) => updateCustomization('show_features_section', v)} description="Feature highlights grid" />
                    <Toggle label="Contact Section" value={customizations.show_contact_section !== false} onChange={(v: boolean) => updateCustomization('show_contact_section', v)} description="Contact information" />
                    <Toggle label="FAQ Section" value={customizations.show_faq_section !== false} onChange={(v: boolean) => updateCustomization('show_faq_section', v)} description="Frequently asked questions" />
                    <Toggle label="Employee Directory" value={customizations.show_employee_directory} onChange={(v: boolean) => updateCustomization('show_employee_directory', v)} description="Searchable employee list" />
                    <Toggle label="Footer" value={customizations.show_footer !== false} onChange={(v: boolean) => updateCustomization('show_footer', v)} description="Page footer with links" />
                  </div>
                )}

                {/* Advanced Tab */}
                {activeDesignTab === 'advanced' && (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[700], marginBottom: '16px' }}>🌍 Regional Settings</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Input label="Currency" value={customizations.default_currency || 'USD'} onChange={(v: string) => updateCustomization('default_currency', v)} placeholder="USD, EUR, INR" />
                        <Input label="Timezone" value={customizations.timezone || 'UTC'} onChange={(v: string) => updateCustomization('timezone', v)} placeholder="UTC, IST, EST" />
                        <Input label="Date Format" value={customizations.date_format || 'MM/DD/YYYY'} onChange={(v: string) => updateCustomization('date_format', v)} />
                        <Input label="Language" value={customizations.default_language || 'en'} onChange={(v: string) => updateCustomization('default_language', v)} placeholder="en, es, fr" />
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[700], marginBottom: '16px' }}>🔒 Security & Compliance</div>
                      <Toggle label="Dark Mode" value={customizations.dark_mode_enabled} onChange={(v: boolean) => updateCustomization('dark_mode_enabled', v)} description="Enable dark mode toggle" />
                      <Toggle label="SSO Enabled" value={customizations.sso_enabled} onChange={(v: boolean) => updateCustomization('sso_enabled', v)} description="Single sign-on authentication" />
                      <Toggle label="GDPR Compliance" value={customizations.gdpr_enabled} onChange={(v: boolean) => updateCustomization('gdpr_enabled', v)} description="EU data protection features" />
                      <Toggle label="Cookie Consent" value={customizations.show_cookie_consent} onChange={(v: boolean) => updateCustomization('show_cookie_consent', v)} description="Show cookie consent banner" />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>Custom CSS</label>
                      <textarea
                        value={customizations.custom_css || ''}
                        onChange={(e) => updateCustomization('custom_css', e.target.value)}
                        placeholder="/* Add custom CSS rules here... */"
                        style={{ width: '100%', padding: '12px', border: `2px solid ${colors.gray[200]}`, borderRadius: '10px', fontSize: '13px', minHeight: '150px', fontFamily: 'Monaco, Consolas, monospace', backgroundColor: '#1f2937', color: '#10b981', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedCorporate && !searchQuery && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '80px 40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎨</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.gray[900], marginBottom: '8px' }}>Welcome to Portal Designer</h2>
              <p style={{ fontSize: '14px', color: colors.gray[500], maxWidth: '400px', margin: '0 auto 24px' }}>
                Search for a company above to start customizing their employee benefits portal with AI-powered design suggestions.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Badge variant="primary">🤖 AI-Powered</Badge>
                <Badge variant="success">⚡ Real-time Preview</Badge>
                <Badge variant="info">🎨 Smart Palettes</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Live Preview */}
        {selectedCorporate && (
          <div style={{ position: 'sticky', top: '100px', height: 'calc(100vh - 140px)' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>👁️</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: colors.gray[700] }}>Live Preview</span>
                </div>
                <Button size="xs" variant="outline" onClick={() => setShowPreviewModal(true)}>
                  Expand ↗
                </Button>
              </div>
              <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden' }}>
                <LivePreview
                  customizations={customizations}
                  companyName={selectedCorporate.corporate_legal_name}
                  subdomain={selectedCorporate.subdomain}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Full Preview Modal */}
      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title="Full Portal Preview" icon="🖥️" size="xl">
        <div style={{ height: '70vh' }}>
          <LivePreview
            customizations={customizations}
            companyName={selectedCorporate?.corporate_legal_name || ''}
            subdomain={selectedCorporate?.subdomain || ''}
          />
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setShowPreviewModal(false)}>Close</Button>
          <Button variant="primary" onClick={() => window.open(`https://${selectedCorporate?.subdomain}.benefitnest.space`, '_blank')}>
            🔗 Open Live Portal
          </Button>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Global Styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes modalIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .spinner { width: 16px; height: 16px; border: 2px solid transparent; border-top-color: currentColor; border-radius: 50%; animation: spin 0.6s linear infinite; }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: ${colors.primary} !important; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${colors.gray[100]}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: ${colors.gray[300]}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.gray[400]}; }
      `}</style>
    </div>
  );
}
