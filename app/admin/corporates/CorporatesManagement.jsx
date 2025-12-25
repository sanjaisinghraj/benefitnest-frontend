import React, { useState, useEffect } from 'react';
import axios from 'axios';

// IMPORTANT: Update this to match your backend URL
const API_URL = 'https://benefitnest-backend.onrender.com/api/admin';

const CorporatesManagement = () => {
  const [corporates, setCorporates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCorporate, setSelectedCorporate] = useState(null);
  const [formData, setFormData] = useState({
    tenant_code: '',
    subdomain: '',
    corporate_legal_name: '',
    corporate_group_name: '',
    corporate_type: '',
    industry_type: '',
    contact_person: '',
    contact_email: '',
    contact_phone: ''
  });

  // Get token from localStorage
  const getToken = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      console.error('No token found in localStorage');
      setError('You are not logged in. Please login first.');
      return null;
    }
    return token;
  };

  // Fetch corporates
  const fetchCorporates = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      console.log('Fetching corporates with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get(`${API_URL}/corporates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Corporates response:', response.data);

      if (response.data.success) {
        setCorporates(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch corporates');
      }
    } catch (error) {
      console.error('Error fetching corporates:', error);
      
      if (error.response) {
        // Server responded with error
        setError(error.response.data?.message || 'Server error occurred');
      } else if (error.request) {
        // Request made but no response
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        // Something else happened
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create corporate
  const handleCreate = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      const token = getToken();
      
      if (!token) return;

      const payload = {
        ...formData,
        contact_details: {
          person: formData.contact_person,
          email: formData.contact_email,
          phone: formData.contact_phone
        }
      };

      console.log('Creating corporate:', payload);

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

  // Update corporate
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      const token = getToken();
      
      if (!token) return;

      const payload = {
        corporate_legal_name: formData.corporate_legal_name,
        corporate_group_name: formData.corporate_group_name,
        corporate_type: formData.corporate_type,
        industry_type: formData.industry_type,
        contact_details: {
          person: formData.contact_person,
          email: formData.contact_email,
          phone: formData.contact_phone
        }
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
      const errorMsg = error.response?.data?.message || 'Failed to update corporate';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  // Delete corporate
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this corporate?')) {
      return;
    }

    try {
      setError(null);
      const token = getToken();
      
      if (!token) return;

      const response = await axios.delete(`${API_URL}/corporates/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Corporate deleted successfully!');
        fetchCorporates();
      }
    } catch (error) {
      console.error('Error deleting corporate:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete corporate';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  // Edit corporate
  const handleEdit = (corporate) => {
    setSelectedCorporate(corporate);
    setFormData({
      tenant_code: corporate.tenant_code,
      subdomain: corporate.subdomain,
      corporate_legal_name: corporate.corporate_legal_name || '',
      corporate_group_name: corporate.corporate_group_name || '',
      corporate_type: corporate.corporate_type || '',
      industry_type: corporate.industry_type || '',
      contact_person: corporate.contact_details?.person || '',
      contact_email: corporate.contact_details?.email || '',
      contact_phone: corporate.contact_details?.phone || ''
    });
    setShowForm(true);
    setError(null);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      tenant_code: '',
      subdomain: '',
      corporate_legal_name: '',
      corporate_group_name: '',
      corporate_type: '',
      industry_type: '',
      contact_person: '',
      contact_email: '',
      contact_phone: ''
    });
    setSelectedCorporate(null);
    setError(null);
  };

  // Load corporates on mount
  useEffect(() => {
    fetchCorporates();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Corporates Management</h1>
        <button 
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showForm ? 'Cancel' : '+ Add Corporate'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          border: '1px solid #ef4444',
          color: '#991b1b',
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
          <button 
            onClick={() => setError(null)}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h2>{selectedCorporate ? 'Edit Corporate' : 'Create New Corporate'}</h2>
          <form onSubmit={selectedCorporate ? handleUpdate : handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Tenant Code *
                </label>
                <input
                  type="text"
                  value={formData.tenant_code}
                  onChange={(e) => setFormData({...formData, tenant_code: e.target.value})}
                  required
                  disabled={selectedCorporate}
                  placeholder="e.g., CORP001"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: selectedCorporate ? '#f3f4f6' : 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Subdomain *
                </label>
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                  required
                  disabled={selectedCorporate}
                  placeholder="e.g., acmecorp"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: selectedCorporate ? '#f3f4f6' : 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Legal Name *
                </label>
                <input
                  type="text"
                  value={formData.corporate_legal_name}
                  onChange={(e) => setFormData({...formData, corporate_legal_name: e.target.value})}
                  required
                  placeholder="e.g., Acme Corporation Pvt Ltd"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.corporate_group_name}
                  onChange={(e) => setFormData({...formData, corporate_group_name: e.target.value})}
                  placeholder="e.g., Acme Group"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Corporate Type
                </label>
                <select
                  value={formData.corporate_type}
                  onChange={(e) => setFormData({...formData, corporate_type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Select Type</option>
                  <option value="PUBLIC">Public Limited</option>
                  <option value="PRIVATE">Private Limited</option>
                  <option value="PARTNERSHIP">Partnership</option>
                  <option value="SOLE">Sole Proprietorship</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Industry Type
                </label>
                <select
                  value={formData.industry_type}
                  onChange={(e) => setFormData({...formData, industry_type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Select Industry</option>
                  <option value="IT">Information Technology</option>
                  <option value="FINANCE">Finance</option>
                  <option value="HEALTHCARE">Healthcare</option>
                  <option value="MANUFACTURING">Manufacturing</option>
                  <option value="RETAIL">Retail</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  placeholder="e.g., John Doe"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  placeholder="e.g., contact@acmecorp.com"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  placeholder="e.g., +91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {selectedCorporate ? 'Update Corporate' : 'Create Corporate'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Corporates List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading corporates...
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>Code</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>Legal Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>Subdomain</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>Industry</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {corporates.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No corporates found. Click "+ Add Corporate" to create one.
                  </td>
                </tr>
              ) : (
                corporates.map((corporate) => (
                  <tr key={corporate.tenant_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{corporate.tenant_code}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{corporate.corporate_legal_name}</td>
                    <td style={{ padding: '12px' }}>
                      <code style={{ 
                        backgroundColor: '#f3f4f6', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        fontSize: '12px',
                        color: '#1f2937'
                      }}>
                        {corporate.subdomain}
                      </code>
                    </td>
                    <td style={{ padding: '12px' }}>{corporate.industry_type || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: corporate.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                        color: corporate.status === 'ACTIVE' ? '#065f46' : '#991b1b'
                      }}>
                        {corporate.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEdit(corporate)}
                        style={{
                          padding: '6px 12px',
                          marginRight: '8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(corporate.tenant_id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CorporatesManagement;
