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
  warningLight: '#fef3c7',
  info: '#8b5cf6',
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
}

interface Customizations {
  [key: string]: any;
}

const Button = ({ children, variant = 'primary', onClick, disabled, loading, style = {} }: { children: React.ReactNode; variant?: string; onClick?: () => void; disabled?: boolean; loading?: boolean; style?: React.CSSProperties }) => {
  const variants = {
    primary: { bg: colors.primary, color: 'white' },
    success: { bg: colors.success, color: 'white' },
    danger: { bg: colors.danger, color: 'white' },
    warning: { bg: colors.warning, color: 'white' },
    outline: { bg: 'white', color: colors.gray[700], border: `1px solid ${colors.gray[300]}` },
    ghost: { bg: 'transparent', color: colors.gray[700] }
  };
  const v = variants[variant as keyof typeof variants] || variants.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: '600',
        color: v.color,
        backgroundColor: v.bg,
        border: 'border' in v ? v.border : 'none',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style
      }}
    >
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = 'text', placeholder, hint, step }: { label?: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; hint?: string; step?: string }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: '600',
        color: colors.gray[700]
      }}>
        {label}
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
        boxSizing: 'border-box'
      }}
    />
    {hint && (
      <div style={{ fontSize: '11px', color: colors.gray[500], marginTop: '4px' }}>
        {hint}
      </div>
    )}
  </div>
);

const Select = ({ label, value, onChange, options, placeholder }: { label?: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; placeholder?: string }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: '600',
        color: colors.gray[700]
      }}>
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
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: '600',
        color: colors.gray[700]
      }}>
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
          cursor: 'pointer'
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
          outline: 'none'
        }}
      />
    </div>
  </div>
);

const Checkbox = ({ label, value, onChange }: { label?: string; value: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <input
      type="checkbox"
      checked={value || false}
      onChange={onChange}
      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
    />
    {label && (
      <label style={{
        fontSize: '14px',
        color: colors.gray[700],
        cursor: 'pointer'
      }}>
        {label}
      </label>
    )}
  </div>
);

export default function PortalCustomizationPage() {
  const router = useRouter();
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
  const [customizations, setCustomizations] = useState<Customizations>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  // Fetch corporates on mount
  useEffect(() => {
    fetchCorporates();
  }, []);

 const fetchCorporates = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token'); // Add this line
    const response = await axios.get(`${API_URL}/api/admin/corporates?limit=1000`, {
      headers: {
        Authorization: `Bearer ${token}`  // Add this header
      }
    });
    setCorporates(response.data.data || []);
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
    const token = localStorage.getItem('token'); // Add this line
    const response = await axios.get(
      `${API_URL}/api/admin/corporates/${corporate.tenant_id}/customizations`,
      {
        headers: {
          Authorization: `Bearer ${token}`  // Add this header
        }
      }
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
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`  // Add this header
    }
  }
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

  const showToast = (message: string, type: string) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateCustomization = (key: string, value: any) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.gray[50] }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: `1px solid ${colors.gray[200]}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: colors.gray[900],
              margin: 0
            }}>
              🎨 Portal Customization
            </h1>
            <p style={{ fontSize: '12px', color: colors.gray[500], margin: 0, marginTop: '2px' }}>
              Customize the look and feel of your portal
            </p>
          </div>
        </div>
        {selectedCorporate && (
          <Button
            variant="success"
            onClick={handleSaveCustomizations}
            loading={saving}
          >
            ✓ Save Customizations
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 20px',
            backgroundColor: toast.type === 'success' ? colors.success : colors.danger,
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {toast.message}
          </div>
        )}

        {/* Corporate Selector */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${colors.gray[200]}`
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.gray[900]
            }}>
              Select Corporate
            </label>
            <div style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {loading ? (
                <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: colors.gray[500] }}>
                  Loading corporates...
                </div>
              ) : corporates.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: colors.gray[500] }}>
                  No corporates found
                </div>
              ) : (
                corporates.map(corp => (
                  <div
                    key={corp.tenant_id}
                    onClick={() => handleCorporateSelect(corp)}
                    style={{
                      padding: '16px',
                      border: selectedCorporate?.tenant_id === corp.tenant_id
                        ? `2px solid ${colors.primary}`
                        : `1px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backgroundColor: selectedCorporate?.tenant_id === corp.tenant_id
                        ? colors.primaryLight
                        : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: colors.gray[900], marginBottom: '4px' }}>
                      {corp.corporate_legal_name}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.gray[500] }}>
                      Subdomain: <strong>{corp.subdomain}.benefitnest.space</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>
                      ID: {corp.tenant_id.substring(0, 8)}...
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Corporate Info */}
          {selectedCorporate && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: colors.primaryLight,
              borderRadius: '8px',
              border: `1px solid ${colors.primary}`
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>
                ✓ Selected: {selectedCorporate.corporate_legal_name}
              </div>
              <div style={{ fontSize: '12px', color: colors.primary, marginTop: '4px', opacity: 0.8 }}>
                {selectedCorporate.subdomain}.benefitnest.space
              </div>
            </div>
          )}
        </div>

        {/* Customization Form */}
        {selectedCorporate && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.gray[200]}`
          }}>
            {/* Sections */}
            <div style={{
              display: 'grid',
              gap: '32px'
            }}>
              {/* VISUAL IDENTITY */}
              <section>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.gray[200]}`
                }}>
                  🎨 Visual Identity
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <ColorInput
                    label="Primary Color"
                    value={customizations.primary_color}
                    onChange={(e) => updateCustomization('primary_color', e.target.value)}
                  />
                  <ColorInput
                    label="Secondary Color"
                    value={customizations.secondary_color}
                    onChange={(e) => updateCustomization('secondary_color', e.target.value)}
                  />
                  <ColorInput
                    label="Accent Color"
                    value={customizations.accent_color}
                    onChange={(e) => updateCustomization('accent_color', e.target.value)}
                  />
                  <ColorInput
                    label="Background Color"
                    value={customizations.background_color}
                    onChange={(e) => updateCustomization('background_color', e.target.value)}
                  />
                  <ColorInput
                    label="Text Color"
                    value={customizations.text_color}
                    onChange={(e) => updateCustomization('text_color', e.target.value)}
                  />
                  <ColorInput
                    label="Border Color"
                    value={customizations.border_color}
                    onChange={(e) => updateCustomization('border_color', e.target.value)}
                  />
                </div>
              </section>

              {/* TYPOGRAPHY */}
              <section>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.gray[200]}`
                }}>
                  📝 Typography
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <Input
                    label="Heading Font Family"
                    value={customizations.heading_font_family || ''}
                    onChange={(e) => updateCustomization('heading_font_family', e.target.value)}
                    placeholder="e.g., Segoe UI, Georgia, Arial"
                  />
                  <Input
                    label="Body Font Family"
                    value={customizations.body_font_family || ''}
                    onChange={(e) => updateCustomization('body_font_family', e.target.value)}
                    placeholder="e.g., Segoe UI, Open Sans"
                  />
                  <Input
                    label="Heading Font Size (px)"
                    type="number"
                    value={customizations.heading_font_size || 32}
                    onChange={(e) => updateCustomization('heading_font_size', parseInt(e.target.value))}
                  />
                  <Input
                    label="Body Font Size (px)"
                    type="number"
                    value={customizations.body_font_size || 16}
                    onChange={(e) => updateCustomization('body_font_size', parseInt(e.target.value))}
                  />
                  <Input
                    label="Line Height (multiplier)"
                    type="number"
                    step="0.1"
                    value={customizations.line_height_multiplier || 1.6}
                    onChange={(e) => updateCustomization('line_height_multiplier', parseFloat(e.target.value))}
                  />
                  <Input
                    label="Font Weight - Heading"
                    type="number"
                    value={customizations.font_weight_heading || 700}
                    onChange={(e) => updateCustomization('font_weight_heading', parseInt(e.target.value))}
                    hint="400, 500, 600, 700, 800"
                  />
                </div>
              </section>

              {/* LOGO & BRANDING */}
              <section>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.gray[200]}`
                }}>
                  🏢 Logo & Branding
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Input
                      label="Logo URL"
                      value={customizations.logo_url || ''}
                      onChange={(e) => updateCustomization('logo_url', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <Input
                    label="Logo Width (px)"
                    type="number"
                    value={customizations.logo_width || 150}
                    onChange={(e) => updateCustomization('logo_width', parseInt(e.target.value))}
                  />
                  <Input
                    label="Logo Height (px)"
                    type="number"
                    value={customizations.logo_height || 60}
                    onChange={(e) => updateCustomization('logo_height', parseInt(e.target.value))}
                  />
                  <Checkbox
                    label="Sticky Header"
                    value={customizations.header_sticky}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCustomization('header_sticky', e.target.checked)}
                  />
                </div>
              </section>

              {/* LAYOUT & SPACING */}
              <section>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.gray[200]}`
                }}>
                  📐 Layout & Spacing
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <Input
                    label="Container Max Width (px)"
                    type="number"
                    value={customizations.container_max_width || 1200}
                    onChange={(e) => updateCustomization('container_max_width', parseInt(e.target.value))}
                  />
                  <Input
                    label="Container Padding X (px)"
                    type="number"
                    value={customizations.container_padding_x || 20}
                    onChange={(e) => updateCustomization('container_padding_x', parseInt(e.target.value))}
                  />
                  <Input
                    label="Container Padding Y (px)"
                    type="number"
                    value={customizations.container_padding_y || 20}
                    onChange={(e) => updateCustomization('container_padding_y', parseInt(e.target.value))}
                  />
                  <Input
                    label="Section Gap (px)"
                    type="number"
                    value={customizations.section_gap || 40}
                    onChange={(e) => updateCustomization('section_gap', parseInt(e.target.value))}
                  />
                </div>
              </section>

              {/* CONTENT MANAGEMENT */}
              <section>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.gray[200]}`
                }}>
                  ✍️ Content Management
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Input
                      label="Portal Title"
                      value={customizations.portal_title || ''}
                      onChange={(e) => updateCustomization('portal_title', e.target.value)}
                      placeholder="e.g., Our Employee Benefits"
                    />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Input
                      label="Portal Tagline"
                      value={customizations.portal_tagline || ''}
                      onChange={(e) => updateCustomization('portal_tagline', e.target.value)}
                      placeholder="Short tagline for the portal"
                    />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: colors.gray[700]
                    }}>
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
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <Input
                    label="Hero Headline"
                    value={customizations.hero_headline || ''}
                    onChange={(e) => updateCustomization('hero_headline', e.target.value)}
                    placeholder="Main headline for hero section"
                  />
                  <Input
                    label="Hero Subheadline"
                    value={customizations.hero_subheadline || ''}
                    onChange={(e) => updateCustomization('hero_subheadline', e.target.value)}
                    placeholder="Supporting text for hero"
                  />
                  <Input
                    label="Hero Background Image URL"
                    value={customizations.hero_background_image_url || ''}
                    onChange={(e) => updateCustomization('hero_background_image_url', e.target.value)}
                    placeholder="https://example.com/hero-bg.jpg"
                  />
                  <Input
                    label="Hero CTA Button Text"
                    value={customizations.hero_cta_button_text || ''}
                    onChange={(e) => updateCustomization('hero_cta_button_text', e.target.value)}
                    placeholder="e.g., Explore Benefits"
                  />
                  <Input
                    label="Hero CTA Button URL"
                    value={customizations.hero_cta_button_url || ''}
                    onChange={(e) => updateCustomization('hero_cta_button_url', e.target.value)}
                    placeholder="https://example.com/benefits"
                  />
                </div>
              </section>

              {/* COMPONENT VISIBILITY */}
              <section>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.gray[200]}`
                }}>
                  👁️ Component Visibility
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
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
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.gray[200]}`
                }}>
                  🌍 Regional Settings
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <Input
                    label="Default Currency"
                    value={customizations.default_currency || 'USD'}
                    onChange={(e) => updateCustomization('default_currency', e.target.value)}
                    placeholder="USD, EUR, INR"
                  />
                  <Input
                    label="Timezone"
                    value={customizations.timezone || 'UTC'}
                    onChange={(e) => updateCustomization('timezone', e.target.value)}
                    placeholder="UTC, IST, EST"
                  />
                  <Input
                    label="Date Format"
                    value={customizations.date_format || 'MM/DD/YYYY'}
                    onChange={(e) => updateCustomization('date_format', e.target.value)}
                    placeholder="MM/DD/YYYY or DD/MM/YYYY"
                  />
                  <Input
                    label="Default Language"
                    value={customizations.default_language || 'en'}
                    onChange={(e) => updateCustomization('default_language', e.target.value)}
                    placeholder="en, es, fr, de"
                  />
                </div>
              </section>

              {/* ADVANCED SETTINGS */}
              <section>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.gray[200]}`
                }}>
                  ⚙️ Advanced Settings
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '16px'
                }}>
                  <Checkbox
                    label="Dark Mode Enabled"
                    value={customizations.dark_mode_enabled}
                    onChange={(e) => updateCustomization('dark_mode_enabled', e.target.checked)}
                  />
                  <Checkbox
                    label="SSO Enabled"
                    value={customizations.sso_enabled}
                    onChange={(e) => updateCustomization('sso_enabled', e.target.checked)}
                  />
                  <Checkbox
                    label="GDPR Enabled"
                    value={customizations.gdpr_enabled}
                    onChange={(e) => updateCustomization('gdpr_enabled', e.target.checked)}
                  />
                  <Checkbox
                    label="Show Cookie Consent"
                    value={customizations.show_cookie_consent}
                    onChange={(e) => updateCustomization('show_cookie_consent', e.target.checked)}
                  />
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: colors.gray[700]
                    }}>
                      Custom CSS
                    </label>
                    <textarea
                      value={customizations.custom_css || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateCustomization('custom_css', e.target.value)}
                      placeholder="Add custom CSS rules here..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        minHeight: '150px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Save Button */}
            <div style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: `1px solid ${colors.gray[200]}`,
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleSaveCustomizations}
                loading={saving}
              >
                ✓ Save Customizations
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedCorporate && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 24px',
            textAlign: 'center',
            border: `1px solid ${colors.gray[200]}`
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👆</div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.gray[900],
              marginBottom: '8px'
            }}>
              Select a Corporate to Customize
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.gray[500]
            }}>
              Choose a corporate from the list above to customize their portal appearance and settings.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
