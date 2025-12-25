'use client';  // ← ADD THIS LINE AT THE VERY TOP
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = 'https://benefitnest-backend.onrender.com/api/admin';

// Modern color palette
const colors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    500: '#6b7280',
    700: '#374151',
    900: '#111827'
  }
};

// Industry types
const INDUSTRY_TYPES = [
  'Information Technology',
  'Financial Services',
  'Banking & Insurance',
  'Healthcare & Pharmaceuticals',
  'Manufacturing',
  'Retail & E-commerce',
  'Telecommunications',
  'Energy & Utilities',
  'Construction & Real Estate',
  'Automotive',
  'Aerospace & Defense',
  'Education',
  'Media & Entertainment',
  'Hospitality & Tourism',
  'Agriculture & Food Processing',
  'Consulting & Professional Services',
  'Transportation & Logistics',
  'Chemical & Petrochemical',
  'Mining & Metals',
  'Textile & Apparel',
  'Government & Public Sector',
  'Non-Profit Organizations',
  'Other'
];

// Corporate types
const CORPORATE_TYPES = [
  'Public Limited Company',
  'Private Limited Company',
  'Limited Liability Partnership (LLP)',
  'Partnership Firm',
  'Sole Proprietorship',
  'One Person Company (OPC)',
  'Section 8 Company (Non-Profit)',
  'Foreign Company',
  'Joint Venture',
  'Subsidiary',
  'Branch Office',
  'Liaison Office',
  'Multinational Corporation',
  'Startup',
  'Small & Medium Enterprise (SME)',
  'Micro Enterprise',
  'Government Organization',
  'Public Sector Undertaking (PSU)',
  'Cooperative Society',
  'Trust',
  'Other'
];

// Contact person levels
const CONTACT_LEVELS = [
  'C-Level (CEO, CFO, CTO, etc.)',
  'VP / Senior Vice President',
  'Director',
  'Senior Manager',
  'Manager',
  'Assistant Manager',
  'Executive',
  'HR Head',
  'HR Manager',
  'Benefits Manager',
  'Finance Head',
  'Operations Head',
  'Administrator',
  'Coordinator',
  'Other'
];

const CorporatesManagement = () => {
  const router = useRouter();
  const [corporates, setCorporates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCorporate, setSelectedCorporate] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [formData, setFormData] = useState({
    tenant_code: '',
    subdomain: '',
    corporate_legal_name: '',
    corporate_group_name: '',
    corporate_type: '',
    industry_type: '',
    logo_url: '',
    contacts: [
      { name: '', email: '', phone: '', designation: '', level: '' },
      { name: '', email: '', phone: '', designation: '', level: '' },
      { name: '', email: '', phone: '', designation: '', level: '' }
    ]
  });

  const getToken = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('You are not logged in. Please login first.');
      return null;
    }
    return token;
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const handleBack = () => {
    router.push('/admin/dashboard');
  };

  const fetchCorporates = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/corporates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setCorporates(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching corporates:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => router.push('/admin'), 2000);
      } else {
        setError(error.response?.data?.message || 'Failed to fetch corporates');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setUploadingLogo(true);

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo_url: reader.result });
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
      setUploadingLogo(false);
    }
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...formData.contacts];
    newContacts[index][field] = value;
    setFormData({ ...formData, contacts: newContacts });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      const token = getToken();
      if (!token) return;

      // Filter out empty contacts
      const validContacts = formData.contacts.filter(c => c.name || c.email);

      const payload = {
        tenant_code: formData.tenant_code,
        subdomain: formData.subdomain,
        corporate_legal_name: formData.corporate_legal_name,
        corporate_group_name: formData.corporate_group_name,
        corporate_type: formData.corporate_type,
        industry_type: formData.industry_type,
        branding_config: {
          logo_url: formData.logo_url
        },
        contact_details: validContacts.length > 0 ? validContacts : undefined
      };

      const response = await axios.post(`${API_URL}/corporates`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert('Corporate created successfully!');
        setShowForm(false);
        resetForm();
        fetchCorporates();
      }
    } catch (error) {
      console.error('Error creating corporate:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create corporate';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      const token = getToken();
      if (!token) return;

      const validContacts = formData.contacts.filter(c => c.name || c.email);

      const payload = {
        corporate_legal_name: formData.corporate_legal_name,
        corporate_group_name: formData.corporate_group_name,
        corporate_type: formData.corporate_type,
        industry_type: formData.industry_type,
        branding_config: {
          logo_url: formData.logo_url
        },
        contact_details: validContacts.length > 0 ? validContacts : undefined
      };

      const response = await axios.put(
        `${API_URL}/corporates/${selectedCorporate.tenant_id}`, 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert('Corporate updated successfully!');
        setShowForm(false);
        setSelectedCorporate(null);
        resetForm();
        fetchCorporates();
      }
    } catch (error) {
      console.error('Error updating corporate:', error);
      alert(error.response?.data?.message || 'Failed to update corporate');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this corporate?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.delete(`${API_URL}/corporates/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Corporate deleted successfully!');
        fetchCorporates();
      }
    } catch (error) {
      console.error('Error deleting corporate:', error);
      alert(error.response?.data?.message || 'Failed to delete corporate');
    }
  };

  const handleEdit = (corporate) => {
    setSelectedCorporate(corporate);
    
    // Parse contacts from contact_details
    const contacts = corporate.contact_details || [];
    const formattedContacts = [
      contacts[0] || { name: '', email: '', phone: '', designation: '', level: '' },
      contacts[1] || { name: '', email: '', phone: '', designation: '', level: '' },
      contacts[2] || { name: '', email: '', phone: '', designation: '', level: '' }
    ];

    setFormData({
      tenant_code: corporate.tenant_code,
      subdomain: corporate.subdomain,
      corporate_legal_name: corporate.corporate_legal_name || '',
      corporate_group_name: corporate.corporate_group_name || '',
      corporate_type: corporate.corporate_type || '',
      industry_type: corporate.industry_type || '',
      logo_url: corporate.branding_config?.logo_url || '',
      contacts: formattedContacts
    });
    setShowForm(true);
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      tenant_code: '',
      subdomain: '',
      corporate_legal_name: '',
      corporate_group_name: '',
      corporate_type: '',
      industry_type: '',
      logo_url: '',
      contacts: [
        { name: '', email: '', phone: '', designation: '', level: '' },
        { name: '', email: '', phone: '', designation: '', level: '' },
        { name: '', email: '', phone: '', designation: '', level: '' }
      ]
    });
    setSelectedCorporate(null);
    setError(null);
  };

  useEffect(() => {
    fetchCorporates();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: colors.primary,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                B
              </div>
              <span style={{
                fontSize: '20px',
                fontWeight: '600',
                color: colors.gray[900]
              }}>
                BenefitNest
              </span>
            </div>
            
            {/* Back Button */}
            <button
              onClick={handleBack}
              style={{
                padding: '8px 16px',
                backgroundColor: colors.gray[100],
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: colors.gray[700],
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.gray[200]}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.gray[100]}
            >
              <span>←</span> Back to Dashboard
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: colors.danger,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(239, 68, 68, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: colors.gray[900],
              marginBottom: '8px'
            }}>
              Corporate Management
            </h1>
            <p style={{ color: colors.gray[500], fontSize: '14px' }}>
              Manage corporate clients and their configurations
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryHover;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 10px -1px rgba(37, 99, 235, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37, 99, 235, 0.3)';
              }}
            >
              <span style={{ fontSize: '18px' }}>+</span>
              Add Corporate
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: `1px solid ${colors.danger}`,
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: '500' }}>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#991b1b',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '0 8px'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Form or Table */}
        {showForm ? (
          // CREATE/EDIT FORM
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${colors.gray[200]}`,
              backgroundColor: colors.gray[50]
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: colors.gray[900]
              }}>
                {selectedCorporate ? '✏️ Edit Corporate' : '✨ Create New Corporate'}
              </h2>
            </div>

            <form onSubmit={selectedCorporate ? handleUpdate : handleCreate} style={{ padding: '24px' }}>
              {/* Basic Information Section */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: `2px solid ${colors.primary}`
                }}>
                  📋 Basic Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {/* Tenant Code */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: colors.gray[700]
                    }}>
                      Tenant Code <span style={{ color: colors.danger }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tenant_code}
                      onChange={(e) => setFormData({ ...formData, tenant_code: e.target.value.toUpperCase() })}
                      required
                      disabled={selectedCorporate}
                      placeholder="e.g., CORP001"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: selectedCorporate ? colors.gray[100] : 'white',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = colors.primary}
                      onBlur={(e) => e.target.style.borderColor = colors.gray[300]}
                    />
                  </div>

                  {/* Subdomain */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: colors.gray[700]
                    }}>
                      Subdomain <span style={{ color: colors.danger }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subdomain}
                      onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                      required
                      disabled={selectedCorporate}
                      placeholder="e.g., acmecorp"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: selectedCorporate ? colors.gray[100] : 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = colors.primary}
                      onBlur={(e) => e.target.style.borderColor = colors.gray[300]}
                    />
                  </div>

                  {/* Legal Name */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: colors.gray[700]
                    }}>
                      Corporate Legal Name <span style={{ color: colors.danger }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.corporate_legal_name}
                      onChange={(e) => setFormData({ ...formData, corporate_legal_name: e.target.value })}
                      required
                      placeholder="e.g., Acme Corporation Private Limited"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = colors.primary}
                      onBlur={(e) => e.target.style.borderColor = colors.gray[300]}
                    />
                  </div>

                  {/* Group Name */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: colors.gray[700]
                    }}>
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={formData.corporate_group_name}
                      onChange={(e) => setFormData({ ...formData, corporate_group_name: e.target.value })}
                      placeholder="e.g., Acme Group of Companies"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = colors.primary}
                      onBlur={(e) => e.target.style.borderColor = colors.gray[300]}
                    />
                  </div>

                  {/* Corporate Type */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: colors.gray[700]
                    }}>
                      Corporate Type
                    </label>
                    <select
                      value={formData.corporate_type}
                      onChange={(e) => setFormData({ ...formData, corporate_type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = colors.primary}
                      onBlur={(e) => e.target.style.borderColor = colors.gray[300]}
                    >
                      <option value="">Select Corporate Type</option>
                      {CORPORATE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Industry Type */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: colors.gray[700]
                    }}>
                      Industry Type
                    </label>
                    <select
                      value={formData.industry_type}
                      onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = colors.primary}
                      onBlur={(e) => e.target.style.borderColor = colors.gray[300]}
                    >
                      <option value="">Select Industry</option>
                      {INDUSTRY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Logo Upload Section */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: `2px solid ${colors.primary}`
                }}>
                  🎨 Branding
                </h3>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: colors.gray[700]
                  }}>
                    Corporate Logo
                  </label>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {formData.logo_url && (
                      <div style={{
                        width: '100px',
                        height: '100px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.gray[50]
                      }}>
                        <img
                          src={formData.logo_url}
                          alt="Logo"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    )}
                    
                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        style={{ display: 'none' }}
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        style={{
                          display: 'inline-block',
                          padding: '10px 20px',
                          backgroundColor: uploadingLogo ? colors.gray[300] : colors.gray[100],
                          border: `1px solid ${colors.gray[300]}`,
                          borderRadius: '8px',
                          cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: colors.gray[700]
                        }}
                      >
                        {uploadingLogo ? 'Uploading...' : '📁 Choose Logo'}
                      </label>
                      <p style={{ fontSize: '12px', color: colors.gray[500], marginTop: '8px' }}>
                        Recommended: 200x200px, PNG or JPG, max 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Persons Section */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.gray[900],
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: `2px solid ${colors.primary}`
                }}>
                  👥 Contact Persons (Up to 3)
                </h3>

                {formData.contacts.map((contact, index) => (
                  <div key={index} style={{
                    marginBottom: '24px',
                    padding: '20px',
                    backgroundColor: colors.gray[50],
                    borderRadius: '8px',
                    border: `1px solid ${colors.gray[200]}`
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: colors.gray[700],
                      marginBottom: '12px'
                    }}>
                      Contact Person {index + 1} {index === 0 && <span style={{ color: colors.danger }}>*</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: colors.gray[600]
                        }}>
                          Full Name {index === 0 && '*'}
                        </label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                          required={index === 0}
                          placeholder="e.g., John Doe"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${colors.gray[300]}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: colors.gray[600]
                        }}>
                          Email {index === 0 && '*'}
                        </label>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                          required={index === 0}
                          placeholder="e.g., john@company.com"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${colors.gray[300]}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: colors.gray[600]
                        }}>
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                          placeholder="e.g., +91 98765 43210"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${colors.gray[300]}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: colors.gray[600]
                        }}>
                          Designation
                        </label>
                        <input
                          type="text"
                          value={contact.designation}
                          onChange={(e) => handleContactChange(index, 'designation', e.target.value)}
                          placeholder="e.g., HR Manager"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${colors.gray[300]}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: colors.gray[600]
                        }}>
                          Job Level
                        </label>
                        <select
                          value={contact.level}
                          onChange={(e) => handleContactChange(index, 'level', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${colors.gray[300]}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="">Select Level</option>
                          {CONTACT_LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '24px',
                borderTop: `1px solid ${colors.gray[200]}`
              }}>
                <button
                  type="submit"
                  style={{
                    padding: '12px 32px',
                    backgroundColor: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.primaryHover}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary}
                >
                  {selectedCorporate ? '💾 Update Corporate' : '✨ Create Corporate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: 'white',
                    color: colors.gray[700],
                    border: `1px solid ${colors.gray[300]}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          // CORPORATES TABLE
          loading ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '60px',
              textAlign: 'center',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: `4px solid ${colors.gray[200]}`,
                borderTop: `4px solid ${colors.primary}`,
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: colors.gray[500], fontSize: '14px' }}>Loading corporates...</p>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: colors.gray[50] }}>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: `2px solid ${colors.gray[200]}`,
                        fontWeight: '600',
                        fontSize: '13px',
                        color: colors.gray[700],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Logo</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: `2px solid ${colors.gray[200]}`,
                        fontWeight: '600',
                        fontSize: '13px',
                        color: colors.gray[700],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Code</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: `2px solid ${colors.gray[200]}`,
                        fontWeight: '600',
                        fontSize: '13px',
                        color: colors.gray[700],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Legal Name</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: `2px solid ${colors.gray[200]}`,
                        fontWeight: '600',
                        fontSize: '13px',
                        color: colors.gray[700],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Subdomain</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: `2px solid ${colors.gray[200]}`,
                        fontWeight: '600',
                        fontSize: '13px',
                        color: colors.gray[700],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Industry</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        borderBottom: `2px solid ${colors.gray[200]}`,
                        fontWeight: '600',
                        fontSize: '13px',
                        color: colors.gray[700],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Status</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'right',
                        borderBottom: `2px solid ${colors.gray[200]}`,
                        fontWeight: '600',
                        fontSize: '13px',
                        color: colors.gray[700],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {corporates.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{
                          padding: '60px',
                          textAlign: 'center',
                          color: colors.gray[500]
                        }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                          <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                            No corporates found
                          </p>
                          <p style={{ fontSize: '14px' }}>
                            Click "Add Corporate" to create your first corporate client
                          </p>
                        </td>
                      </tr>
                    ) : (
                      corporates.map((corporate) => (
                        <tr
                          key={corporate.tenant_id}
                          style={{
                            borderBottom: `1px solid ${colors.gray[200]}`,
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <td style={{ padding: '16px' }}>
                            {corporate.branding_config?.logo_url ? (
                              <img
                                src={corporate.branding_config.logo_url}
                                alt="Logo"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  objectFit: 'contain',
                                  borderRadius: '6px',
                                  border: `1px solid ${colors.gray[200]}`
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: colors.gray[200],
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px'
                              }}>
                                🏢
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              fontWeight: '600',
                              color: colors.gray[900],
                              fontSize: '14px'
                            }}>
                              {corporate.tenant_code}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: '500', color: colors.gray[900], fontSize: '14px' }}>
                              {corporate.corporate_legal_name}
                            </div>
                            {corporate.corporate_group_name && (
                              <div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '2px' }}>
                                Group: {corporate.corporate_group_name}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <code style={{
                              backgroundColor: colors.gray[100],
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '13px',
                              color: colors.gray[700],
                              fontFamily: 'monospace'
                            }}>
                              {corporate.subdomain}
                            </code>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontSize: '14px', color: colors.gray[600] }}>
                              {corporate.industry_type || '-'}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: corporate.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                              color: corporate.status === 'ACTIVE' ? '#065f46' : '#991b1b'
                            }}>
                              {corporate.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleEdit(corporate)}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: colors.primary,
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.primaryHover}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(corporate.tenant_id)}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: colors.danger,
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </main>

      {/* Add spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CorporatesManagement;
