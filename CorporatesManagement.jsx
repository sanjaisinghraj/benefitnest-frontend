import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://benefitnest-backend.onrender.com/api/admin';

const CorporatesManagement = () => {
  const [corporates, setCorporates] = useState([]);
  const [loading, setLoading] = useState(true);
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
    return localStorage.getItem('admin_token');
  };

  // Fetch corporates
  const fetchCorporates = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await axios.get(`${API_URL}/corporates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setCorporates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching corporates:', error);
      alert('Failed to fetch corporates');
    } finally {
      setLoading(false);
    }
  };

  // Create corporate
  const handleCreate = async (e) => {
    e.preventDefault();
    
    try {
      const token = getToken();
      
      const payload = {
        ...formData,
        contact_details: {
          person: formData.contact_person,
          email: formData.contact_email,
          phone: formData.contact_phone
        }
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
      alert(error.response?.data?.message || 'Failed to create corporate');
    }
  };

  // Update corporate
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const token = getToken();
      
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
      alert('Failed to update corporate');
    }
  };

  // Delete corporate
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this corporate?')) {
      return;
    }

    try {
      const token = getToken();
      
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
      alert('Failed to delete corporate');
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
  };

  // Load corporates on mount
  useEffect(() => {
    fetchCorporates();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : '+ Add Corporate'}
        </button>
      </div>

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
                    borderRadius: '4px'
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
                  cursor: 'pointer'
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
                  cursor: 'pointer'
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
        <div>Loading...</div>
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
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Code</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Legal Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Subdomain</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Industry</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {corporates.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    No corporates found. Click "Add Corporate" to create one.
                  </td>
                </tr>
              ) : (
                corporates.map((corporate) => (
                  <tr key={corporate.tenant_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{corporate.tenant_code}</td>
                    <td style={{ padding: '12px' }}>{corporate.corporate_legal_name}</td>
                    <td style={{ padding: '12px' }}>
                      <code style={{ 
                        backgroundColor: '#f3f4f6', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        fontSize: '12px'
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
