'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface PortalConfig {
  tenant_id: string;
  company_name: string;
  subdomain: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  address?: any;
  contact_email?: string;
  contact_phone?: string;
  status: string;
  created_at: string;
}

interface Customizations {
  id: string;
  tenant_id: string;
  version: number;
  
  // Colors
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  border_color: string;
  
  // Dark mode
  dark_mode_enabled: boolean;
  dark_primary_color?: string;
  dark_secondary_color?: string;
  
  // Typography
  heading_font_family: string;
  body_font_family: string;
  heading_font_size: number;
  subheading_font_size: number;
  body_font_size: number;
  caption_font_size: number;
  font_weight_heading: number;
  font_weight_body: number;
  line_height_multiplier: number;
  
  // Layout
  layout_type: string;
  container_max_width: number;
  container_padding_x: number;
  container_padding_y: number;
  section_gap: number;
  
  // Content
  portal_title?: string;
  portal_tagline?: string;
  portal_description?: string;
  hero_headline?: string;
  hero_subheadline?: string;
  hero_background_image_url?: string;
  hero_cta_button_text?: string;
  hero_cta_button_url?: string;
  
  // Component visibility
  show_hero_section: boolean;
  show_benefits_section: boolean;
  show_features_section: boolean;
  show_contact_section: boolean;
  show_footer: boolean;
  show_employee_directory: boolean;
  
  // Custom CSS
  custom_css?: string;
  
  // Other settings
  custom_sections?: any[];
  documents?: any[];
  [key: string]: any;
}

interface PortalPageProps {
  params: {
    subdomain: string;
  };
}

export default function PortalPage({ params }: PortalPageProps) {
  const { subdomain } = params;
  const [portalConfig, setPortalConfig] = useState<PortalConfig | null>(null);
  const [customizations, setCustomizations] = useState<Customizations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortalConfig = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'}/api/portal/config/${subdomain}`
        );

        if (!response.ok) {
          throw new Error(`Portal not found for subdomain: ${subdomain}`);
        }

        const result = await response.json();
        setPortalConfig(result.data);
        setCustomizations(result.data.customizations);
        setError(null);
      } catch (err) {
        console.error('[PORTAL] Error fetching config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load portal');
        setPortalConfig(null);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchPortalConfig();
    }
  }, [subdomain]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
            Loading Portal...
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Please wait while we prepare your portal
          </div>
        </div>
      </div>
    );
  }

  if (error || !portalConfig) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', color: '#dc2626' }}>
            Portal Not Found
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            {error || 'This portal has not been created yet.'}
          </div>
          <a 
            href="https://benefitnest.space"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Go to Main Site
          </a>
        </div>
      </div>
    );
  }

  return (
    <PortalContent config={portalConfig} customizations={customizations} />
  );
}

interface PortalContentProps {
  config: PortalConfig;
  customizations: Customizations | null;
}

function PortalContent({ config, customizations }: PortalContentProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'features' | 'contact'>('overview');

  // Merge customizations with defaults
  const finalConfig = useMemo(() => {
    return customizations ? { ...config, ...customizations } : config;
  }, [config, customizations]);

  // Extract colors and styles
  const colors = {
    primary: finalConfig.primary_color || config.primary_color,
    secondary: finalConfig.secondary_color || config.secondary_color,
    accent: finalConfig.accent_color || '#f59e0b',
    background: finalConfig.background_color || '#ffffff',
    text: finalConfig.text_color || '#111827',
    border: finalConfig.border_color || '#e5e7eb',
  };

  const typography = {
    headingFont: finalConfig.heading_font_family || 'Segoe UI',
    bodyFont: finalConfig.body_font_family || 'Segoe UI',
    headingSize: finalConfig.heading_font_size || 32,
    subheadingSize: finalConfig.subheading_font_size || 24,
    bodySize: finalConfig.body_font_size || 16,
    lineHeight: finalConfig.line_height_multiplier || 1.6,
  };

  const layout = {
    containerMaxWidth: finalConfig.container_max_width || 1200,
    containerPaddingX: finalConfig.container_padding_x || 20,
    containerPaddingY: finalConfig.container_padding_y || 20,
    sectionGap: finalConfig.section_gap || 40,
  };

  // Global styles
  const globalStyle = `
    * {
      font-family: ${typography.bodyFont}, sans-serif;
      color: ${colors.text};
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: ${typography.headingFont}, sans-serif;
      font-weight: ${finalConfig.font_weight_heading || 700};
    }
    body {
      line-height: ${typography.lineHeight};
      background-color: ${colors.background};
    }
    ${finalConfig.custom_css || ''}
  `;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      padding: `${layout.containerPaddingY}px`,
      fontFamily: typography.bodyFont,
    }}>
      <style>{globalStyle}</style>

      <div style={{
        maxWidth: `${layout.containerMaxWidth}px`,
        margin: '0 auto',
        marginBottom: `${layout.sectionGap}px`
      }}>
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          color: colors.text
        }}>
          {/* Header */}
          {finalConfig.show_header !== false && (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {/* Logo */}
                <div style={{
                  width: finalConfig.logo_width || 150,
                  height: finalConfig.logo_height || 60,
                  borderRadius: '12px',
                  backgroundColor: `${colors.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {(finalConfig.logo_url || config.logo_url) ? (
                    <img 
                      src={finalConfig.logo_url || config.logo_url}
                      alt={config.company_name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: '32px' }}>🏢</span>
                  )}
                </div>
                
                {/* Company Info */}
                <div>
                  <h1 style={{
                    fontSize: `${typography.headingSize}px`,
                    fontWeight: finalConfig.font_weight_heading || 700,
                    margin: '0 0 5px 0',
                    color: colors.primary
                  }}>
                    {finalConfig.portal_title || config.company_name}
                  </h1>
                  <p style={{
                    fontSize: '14px',
                    color: colors.text,
                    margin: '0 0 5px 0',
                    opacity: 0.7
                  }}>
                    {finalConfig.portal_tagline || 'Employee Benefits Portal'}
                  </p>
                  {finalConfig.portal_description && (
                    <p style={{
                      fontSize: '12px',
                      color: colors.text,
                      margin: '0',
                      opacity: 0.6
                    }}>
                      {finalConfig.portal_description}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '20px'
              }}>
                ✓ Portal Active
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '10px',
            borderBottom: `1px solid ${colors.border}`,
            marginBottom: '30px'
          }}>
            {(['overview', 'features', 'contact'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                  color: activeTab === tab ? 'white' : colors.text,
                  cursor: 'pointer',
                  fontSize: `${typography.bodySize - 2}px`,
                  fontWeight: '600',
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.3s',
                  fontFamily: typography.headingFont,
                }}
              >
                {tab === 'overview' && '📋 Overview'}
                {tab === 'features' && '⭐ Features'}
                {tab === 'contact' && '📞 Contact'}
              </button>
            ))}
          </div>

          {/* Hero Section */}
          {finalConfig.show_hero_section !== false && (
            <div style={{
              padding: '30px',
              backgroundColor: `${colors.primary}10`,
              borderRadius: '8px',
              marginBottom: `${layout.sectionGap}px`,
              backgroundImage: finalConfig.hero_background_image_url ? `url(${finalConfig.hero_background_image_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {finalConfig.hero_headline && (
                <h2 style={{
                  fontSize: `${typography.subheadingSize}px`,
                  fontWeight: finalConfig.font_weight_heading || 700,
                  color: colors.primary,
                  margin: '0 0 10px 0'
                }}>
                  {finalConfig.hero_headline}
                </h2>
              )}
              {finalConfig.hero_subheadline && (
                <p style={{
                  fontSize: `${typography.bodySize}px`,
                  color: colors.text,
                  margin: '0 0 15px 0',
                  opacity: 0.8
                }}>
                  {finalConfig.hero_subheadline}
                </p>
              )}
              {finalConfig.hero_cta_button_text && finalConfig.hero_cta_button_url && (
                <a href={finalConfig.hero_cta_button_url} style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: colors.primary,
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginTop: '15px'
                }}>
                  {finalConfig.hero_cta_button_text}
                </a>
              )}
            </div>
          )}

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <div>
                {!finalConfig.hero_headline && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#fef3c7',
                    border: `1px solid ${colors.accent}`,
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ fontSize: '14px', color: '#92400e' }}>
                      <strong>⚠️ Portal Status:</strong> This portal is under development. 
                      Full features coming soon!
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{
                    fontSize: `${typography.subheadingSize}px`,
                    fontWeight: finalConfig.font_weight_heading || 600,
                    marginBottom: '15px',
                    color: colors.primary
                  }}>
                    Welcome to Your Benefits Portal
                  </h3>
                  <p style={{
                    fontSize: `${typography.bodySize}px`,
                    lineHeight: typography.lineHeight,
                    color: colors.text
                  }}>
                    This is your dedicated employee benefits portal for {config.company_name}. 
                    Here you can manage your benefits, view policy details, and access important documents.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'features' && finalConfig.show_features_section !== false && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: `${layout.sectionGap}px`
                }}>
                  {[
                    { icon: '📋', title: 'View Benefits', desc: 'See all your benefits at a glance' },
                    { icon: '📄', title: 'Documents', desc: 'Download important documents' },
                    { icon: '📊', title: 'Claims', desc: 'Track your submitted claims' },
                    { icon: '👤', title: 'Profile', desc: 'Manage your personal information' },
                    { icon: '🔔', title: 'Alerts', desc: 'Get important notifications' },
                    { icon: '💬', title: 'Support', desc: 'Contact support team' }
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '20px',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        backgroundColor: colors.background,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = colors.primary;
                        e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                        {feature.icon}
                      </div>
                      <div style={{
                        fontSize: `${typography.bodySize}px`,
                        fontWeight: '600',
                        marginBottom: '5px',
                        color: colors.primary
                      }}>
                        {feature.title}
                      </div>
                      <div style={{
                        fontSize: `${typography.bodySize - 2}px`,
                        color: colors.text,
                        opacity: 0.7
                      }}>
                        {feature.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'contact' && finalConfig.show_contact_section !== false && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  {(finalConfig.contact_email || config.contact_email) && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: `${colors.primary}10`,
                      border: `1px solid ${colors.primary}30`,
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: colors.text, marginBottom: '5px', opacity: 0.7 }}>
                        EMAIL
                      </div>
                      <a
                        href={`mailto:${finalConfig.contact_email || config.contact_email}`}
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: colors.primary,
                          textDecoration: 'none'
                        }}
                      >
                        {finalConfig.contact_email || config.contact_email}
                      </a>
                    </div>
                  )}

                  {(finalConfig.contact_phone || config.contact_phone) && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: `${colors.secondary}10`,
                      border: `1px solid ${colors.secondary}30`,
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: colors.text, marginBottom: '5px', opacity: 0.7 }}>
                        PHONE
                      </div>
                      <a
                        href={`tel:${finalConfig.contact_phone || config.contact_phone}`}
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: colors.secondary,
                          textDecoration: 'none'
                        }}
                      >
                        {finalConfig.contact_phone || config.contact_phone}
                      </a>
                    </div>
                  )}
                </div>

                {(finalConfig.address || config.address) && (
                  <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: `${colors.accent}15`,
                    border: `1px solid ${colors.accent}40`,
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: colors.text, marginBottom: '10px', opacity: 0.7 }}>
                      ADDRESS
                    </div>
                    <div style={{ fontSize: `${typography.bodySize}px`, color: colors.text, lineHeight: 1.8 }}>
                      {(finalConfig.address?.line1 || config.address?.line1) && <div>{finalConfig.address?.line1 || config.address?.line1}</div>}
                      {(finalConfig.address?.line2 || config.address?.line2) && <div>{finalConfig.address?.line2 || config.address?.line2}</div>}
                      {(finalConfig.address?.city || config.address?.city) && <div>{finalConfig.address?.city || config.address?.city}</div>}
                      {(finalConfig.address?.state || config.address?.state) && <div>{finalConfig.address?.state || config.address?.state}</div>}
                      {(finalConfig.address?.postal_code || config.address?.postal_code) && <div>{finalConfig.address?.postal_code || config.address?.postal_code}</div>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {finalConfig.show_footer !== false && (
            <div style={{
              marginTop: `${layout.sectionGap}px`,
              paddingTop: '20px',
              borderTop: `1px solid ${colors.border}`,
              textAlign: 'center',
              fontSize: '12px',
              color: colors.text,
              opacity: 0.6
            }}>
              <p>
                Powered by BenefitNest © {new Date().getFullYear()}
              </p>
              <p>
                Portal created: {new Date(config.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
