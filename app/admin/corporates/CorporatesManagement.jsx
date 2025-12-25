'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://benefitnest-backend.onrender.com/api/admin';

export default function CorporatesManagement() {
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

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('admin_token')
      : null;

  const fetchCorporates = async () => {
    try {
      const res = await axios.get(`${API_URL}/corporates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCorporates(res.data.data || []);
    } catch {
      alert('Failed to load corporates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorporates();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      tenant_code: formData.tenant_code,
      subdomain: formData.subdomain,
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

    try {
      if (selectedCorporate) {
        await axios.put(
          `${API_URL}/corporates/${selectedCorporate.tenant_id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_URL}/corporates`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowForm(false);
      resetForm();
      fetchCorporates();
    } catch {
      alert('Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete corporate?')) return;

    try {
      await axios.delete(`${API_URL}/corporates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCorporates();
    } catch {
      alert('Delete failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Corporates</h1>

      <button onClick={() => { resetForm(); setShowForm(true); }}>
        + Add Corporate
      </button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <input placeholder="Tenant Code" required
            value={formData.tenant_code}
            onChange={e => setFormData({ ...formData, tenant_code: e.target.value })}
            disabled={!!selectedCorporate}
          />
          <input placeholder="Subdomain" required
            value={formData.subdomain}
            onChange={e => setFormData({ ...formData, subdomain: e.target.value })}
            disabled={!!selectedCorporate}
          />
          <input placeholder="Legal Name" required
            value={formData.corporate_legal_name}
            onChange={e => setFormData({ ...formData, corporate_legal_name: e.target.value })}
          />
          <input placeholder="Group Name"
            value={formData.corporate_group_name}
            onChange={e => setFormData({ ...formData, corporate_group_name: e.target.value })}
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Subdomain</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {corporates.map(c => (
            <tr key={c.tenant_id}>
              <td>{c.tenant_code}</td>
              <td>{c.corporate_legal_name}</td>
              <td>{c.subdomain}</td>
              <td>
                <button onClick={() => { setSelectedCorporate(c); setFormData({
                  tenant_code: c.tenant_code,
                  subdomain: c.subdomain,
                  corporate_legal_name: c.corporate_legal_name,
                  corporate_group_name: c.corporate_group_name || '',
                  corporate_type: c.corporate_type || '',
                  industry_type: c.industry_type || '',
                  contact_person: c.contact_details?.person || '',
                  contact_email: c.contact_details?.email || '',
                  contact_phone: c.contact_details?.phone || ''
                }); setShowForm(true); }}>Edit</button>

                <button onClick={() => handleDelete(c.tenant_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
