'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const AdminDashboard = () => {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Clear both localStorage and cookies
      localStorage.removeItem('admin_token');
      document.cookie = 'admin_token=; path=/; max-age=0';
      // Redirect to main site
      window.location.href = 'https://www.benefitnest.space';
    }
  };

  const handleBack = () => {
    router.push('/admin');
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const dashboardCards = [
    {
      title: 'Corporates',
      description: 'Create and manage corporate clients, subdomains and configurations.',
      icon: '🏢',
      link: '/admin/corporates',
      color: '#2563eb'
    },
    {
      title: 'Employees',
      description: 'View employee data, enrollment status and access control.',
      icon: '👥',
      link: '/admin/employees',
      color: '#10b981'
    },
    {
      title: 'Policies & Benefits',
      description: 'Configure insurance plans, benefits and eligibility rules.',
      icon: '📋',
      link: '/admin/policies',
      color: '#f59e0b'
    },
    {
      title: 'Claims',
      description: 'Monitor claims, status updates and escalations.',
      icon: '📄',
      link: '/admin/claims',
      color: '#8b5cf6'
    },
    {
      title: 'Reports & Analytics',
      description: 'Download operational, claims and enrollment reports.',
      icon: '📊',
      link: '/admin/reports',
      color: '#ec4899'
    },
    {
      title: 'Audit Logs',
      description: 'Track admin actions and system activity for compliance.',
      icon: '📝',
      link: '/admin/audit',
      color: '#6366f1'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/images/marketing/logo.png"
                alt="BenefitNest"
                style={{
                  height: '40px',
                  objectFit: 'contain'
                }}
              />
              <div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  BenefitNest
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  fontWeight: '500',
                  marginTop: '-2px'
                }}>
                  Platform Administration
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={handleBack}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#374151',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              <span>←</span> Back
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(239, 68, 68, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            BenefitNest · Platform Administration
          </p>
        </div>

        {/* Dashboard Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigateTo(card.link)}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = card.color;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {/* Top Color Bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: card.color
              }}></div>

              {/* Icon */}
              <div style={{
                fontSize: '36px',
                marginBottom: '16px'
              }}>
                {card.icon}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                {card.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.5',
                marginBottom: '16px'
              }}>
                {card.description}
              </p>

              {/* Arrow Link */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: card.color,
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <span>Manage {card.title.toLowerCase()}</span>
                <span style={{ fontSize: '16px' }}>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div style={{
          marginTop: '60px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#6b7280'
          }}>
            Internal system · Actions are logged · Role-based access enforced
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
