import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const LOOKUP_API_URL = 'https://benefitnest-backend.onrender.com/api/lookup';
const API_URL = 'https://benefitnest-backend.onrender.com/api/admin';

const [industryTypes, setIndustryTypes] = useState([]);
const [corporateTypes, setCorporateTypes] = useState([]);
const [jobLevels, setJobLevels] = useState([]);
const [loadingLookups, setLoadingLookups] = useState(true);

const fetchLookupData = async () => {
  try {
    setLoadingLookups(true);
    const response = await axios.get(`${LOOKUP_API_URL}/all`);
    if (response.data.success) {
      setCorporateTypes(response.data.data.corporateTypes || []);
      setIndustryTypes(response.data.data.industryTypes || []);
      setJobLevels(response.data.data.jobLevels || []);
    }
  } catch (error) {
    console.error('Error fetching lookup data:', error);
  } finally {
    setLoadingLookups(false);
  }
};


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

const INDUSTRY_TYPES = [
  'Information Technology', 'Financial Services', 'Banking & Insurance',
  'Healthcare & Pharmaceuticals', 'Manufacturing', 'Retail & E-commerce',
  'Telecommunications', 'Energy & Utilities', 'Construction & Real Estate',
  'Automotive', 'Aerospace & Defense', 'Education', 'Media & Entertainment',
  'Hospitality & Tourism', 'Agriculture & Food Processing',
  'Consulting & Professional Services', 'Transportation & Logistics',
  'Chemical & Petrochemical', 'Mining & Metals', 'Textile & Apparel',
  'Government & Public Sector', 'Non-Profit Organizations', 'Other'
];

const CORPORATE_TYPES = [
  'Public Limited Company', 'Private Limited Company',
  'Limited Liability Partnership (LLP)', 'Partnership Firm',
  'Sole Proprietorship', 'One Person Company (OPC)',
  'Section 8 Company (Non-Profit)', 'Foreign Company', 'Joint Venture',
  'Subsidiary', 'Branch Office', 'Liaison Office', 'Multinational Corporation',
  'Startup', 'Small & Medium Enterprise (SME)', 'Micro Enterprise',
  'Government Organization', 'Public Sector Undertaking (PSU)',
  'Cooperative Society', 'Trust', 'Other'
];

const CONTACT_LEVELS = [
  'C-Level (CEO, CFO, CTO, etc.)', 'VP / Senior Vice President', 'Director',
  'Senior Manager', 'Manager', 'Assistant Manager', 'Executive', 'HR Head',
  'HR Manager', 'Benefits Manager', 'Finance Head', 'Operations Head',
  'Administrator', 'Coordinator', 'Other'
];

// Helper function to parse CSV
const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  return data;
};

// Helper function to parse Excel using native approach
const parseExcel = async (file) => {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);
  
  const worksheet = workbook.worksheets[0];
  const data = [];
  const headers = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell) => {
        headers.push(cell.value?.toString() || '');
      });
    } else {
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.value?.toString() || '';
        }
      });
      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    }
  });
  
  return data;
};

// Helper function to create and download Excel
const downloadExcel = async (data, filename) => {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  
  if (data.length === 0) return;
  
  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);
  
  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  
  // Add data rows
  data.forEach(row => {
    worksheet.addRow(headers.map(h => row[h] || ''));
  });
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 20;
  });
  
  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const CorporatesManagement = () => {
  const router = useRouter();
  const [corporates, setCorporates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCorporate, setSelectedCorporate] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  
  const [formData, setFormData] = useState({
    tenant_code: '', subdomain: '', corporate_legal_name: '',
    corporate_group_name: '', corporate_type: '', industry_type: '',
    logo_url: '',
    contacts: [
      { name: '', email: '', phone: '', designation: '', level: '' },
      { name: '', email: '', phone: '', designation: '', level: '' },
      { name: '', email: '', phone: '', designation: '', level: '' }
    ]
  });

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
    if (cookieToken) return cookieToken;
    return localStorage.getItem('admin_token');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      document.cookie = 'admin_token=; path=/; max-age=0';
      window.location.href = 'https://www.benefitnest.space';
    }
  };

  const handleBack = () => router.push('/admin/dashboard');

  const fetchCorporates = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError('You are not logged in. Please login first.');
        router.push('/admin');
        return;
      }
      const response = await axios.get(`${API_URL}/corporates`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) setCorporates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching corporates:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('admin_token');
        document.cookie = 'admin_token=; path=/; max-age=0';
        setTimeout(() => router.push('/admin'), 2000);
        return;
      }
      setError(error.response?.data?.message || 'Failed to fetch corporates');
    } finally {
      setLoading(false);
    }
  };

  const validateRow = (row, existingSubdomains, existingCodes) => {
    const errors = [];
    if (!row.tenant_code?.toString().trim()) errors.push('tenant_code is required');
    else if (existingCodes.has(row.tenant_code.toString().trim().toUpperCase())) errors.push('tenant_code already exists');
    if (!row.subdomain?.toString().trim()) errors.push('subdomain is required');
    else {
      const subdomain = row.subdomain.toString().trim().toLowerCase();
      if (!/^[a-z0-9]+$/.test(subdomain)) errors.push('subdomain must contain only lowercase letters and numbers');
      else if (existingSubdomains.has(subdomain)) errors.push('subdomain already exists');
    }
    if (!row.corporate_legal_name?.toString().trim()) errors.push('corporate_legal_name is required');
    if (!row.contact1_name?.toString().trim()) errors.push('contact1_name is required');
    if (!row.contact1_email?.toString().trim()) errors.push('contact1_email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact1_email.toString().trim())) errors.push('contact1_email is invalid');
    if (row.contact2_email?.toString().trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact2_email.toString().trim())) errors.push('contact2_email is invalid');
    if (row.contact3_email?.toString().trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact3_email.toString().trim())) errors.push('contact3_email is invalid');
    return errors;
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      alert('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }
    setUploadingBulk(true);
    setShowUploadModal(false);
    try {
      const token = getToken();
      if (!token) { setError('You are not logged in.'); router.push('/admin'); return; }
      
      let jsonData;
      if (fileExtension === 'csv') {
        const text = await file.text();
        jsonData = parseCSV(text);
      } else {
        jsonData = await parseExcel(file);
      }
      
      if (jsonData.length === 0) { alert('The file is empty'); setUploadingBulk(false); return; }
      
      const existingSubdomains = new Set(corporates.map(c => c.subdomain?.toLowerCase()));
      const existingCodes = new Set(corporates.map(c => c.tenant_code?.toUpperCase()));
      const newSubdomains = new Set();
      const newCodes = new Set();
      const successRecords = [];
      const errorRecords = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const allSubdomains = new Set([...existingSubdomains, ...newSubdomains]);
        const allCodes = new Set([...existingCodes, ...newCodes]);
        const errors = validateRow(row, allSubdomains, allCodes);
        
        if (errors.length > 0) {
          errorRecords.push({ ...row, row_number: i + 2, error: errors.join('; ') });
        } else {
          const contacts = [];
          if (row.contact1_name) contacts.push({ name: row.contact1_name?.toString().trim() || '', email: row.contact1_email?.toString().trim() || '', phone: row.contact1_phone?.toString().trim() || '', designation: row.contact1_designation?.toString().trim() || '' });
          if (row.contact2_name || row.contact2_email) contacts.push({ name: row.contact2_name?.toString().trim() || '', email: row.contact2_email?.toString().trim() || '', phone: row.contact2_phone?.toString().trim() || '', designation: row.contact2_designation?.toString().trim() || '' });
          if (row.contact3_name || row.contact3_email) contacts.push({ name: row.contact3_name?.toString().trim() || '', email: row.contact3_email?.toString().trim() || '', phone: row.contact3_phone?.toString().trim() || '', designation: row.contact3_designation?.toString().trim() || '' });
          
          const payload = {
            tenant_code: row.tenant_code?.toString().trim().toUpperCase(),
            subdomain: row.subdomain?.toString().trim().toLowerCase(),
            corporate_legal_name: row.corporate_legal_name?.toString().trim(),
            corporate_group_name: row.corporate_group_name?.toString().trim() || '',
            corporate_type: row.corporate_type?.toString().trim() || '',
            industry_type: row.industry_type?.toString().trim() || '',
            contact_details: contacts
          };
          try {
            const response = await axios.post(`${API_URL}/corporates`, payload, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
            if (response.data.success) {
              successRecords.push(row);
              newSubdomains.add(payload.subdomain);
              newCodes.add(payload.tenant_code);
            } else {
              errorRecords.push({ ...row, row_number: i + 2, error: response.data.message || 'Failed to create' });
            }
          } catch (err) {
            errorRecords.push({ ...row, row_number: i + 2, error: err.response?.data?.message || err.message || 'API error' });
          }
        }
      }
      setUploadResults({ total: jsonData.length, success: successRecords.length, failed: errorRecords.length, errors: errorRecords });
      setShowResultsModal(true);
      fetchCorporates();
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file: ' + error.message);
    } finally {
      setUploadingBulk(false);
      e.target.value = '';
    }
  };

  const downloadErrorRecords = async () => {
    if (!uploadResults?.errors?.length) return;
    const errorData = uploadResults.errors.map(record => ({
      row_number: record.row_number, tenant_code: record.tenant_code || '', subdomain: record.subdomain || '',
      corporate_legal_name: record.corporate_legal_name || '', corporate_group_name: record.corporate_group_name || '',
      corporate_type: record.corporate_type || '', industry_type: record.industry_type || '',
      contact1_name: record.contact1_name || '', contact1_email: record.contact1_email || '',
      contact1_phone: record.contact1_phone || '', contact1_designation: record.contact1_designation || '',
      contact2_name: record.contact2_name || '', contact2_email: record.contact2_email || '',
      contact2_phone: record.contact2_phone || '', contact2_designation: record.contact2_designation || '',
      contact3_name: record.contact3_name || '', contact3_email: record.contact3_email || '',
      contact3_phone: record.contact3_phone || '', contact3_designation: record.contact3_designation || '',
      error_description: record.error
    }));
    await downloadExcel(errorData, 'corporate_upload_errors.xlsx');
  };

  const downloadSampleTemplate = async () => {
    const sampleData = [
      { tenant_code: 'CORP001', subdomain: 'acmecorp', corporate_legal_name: 'Acme Corporation Pvt Ltd', corporate_group_name: 'Acme Group', corporate_type: 'Private Limited Company', industry_type: 'Information Technology', contact1_name: 'John Doe', contact1_email: 'john@acmecorp.com', contact1_phone: '+91 98765 43210', contact1_designation: 'HR Manager', contact2_name: 'Jane Smith', contact2_email: 'jane@acmecorp.com', contact2_phone: '+91 98765 43211', contact2_designation: 'Benefits Manager', contact3_name: '', contact3_email: '', contact3_phone: '', contact3_designation: '' },
      { tenant_code: 'CORP002', subdomain: 'techsolutions', corporate_legal_name: 'Tech Solutions India Ltd', corporate_group_name: 'Tech Group', corporate_type: 'Public Limited Company', industry_type: 'Financial Services', contact1_name: 'Rahul Kumar', contact1_email: 'rahul@techsolutions.com', contact1_phone: '+91 98765 43220', contact1_designation: 'HR Head', contact2_name: '', contact2_email: '', contact2_phone: '', contact2_designation: '', contact3_name: '', contact3_email: '', contact3_phone: '', contact3_designation: '' }
    ];
    await downloadExcel(sampleData, 'corporate_upload_template.xlsx');
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size should be less than 5MB'); return; }
    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => { setFormData({ ...formData, logo_url: reader.result }); setUploadingLogo(false); };
    reader.readAsDataURL(file);
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
      if (!token) { setError('Not logged in'); router.push('/admin'); return; }
      const validContacts = formData.contacts.filter(c => c.name || c.email);
      const payload = { tenant_code: formData.tenant_code, subdomain: formData.subdomain, corporate_legal_name: formData.corporate_legal_name, corporate_group_name: formData.corporate_group_name, corporate_type: formData.corporate_type, industry_type: formData.industry_type, branding_config: { logo_url: formData.logo_url }, contact_details: validContacts.length > 0 ? validContacts : undefined };
      const response = await axios.post(`${API_URL}/corporates`, payload, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (response.data.success) { alert('Corporate created successfully!'); setShowForm(false); resetForm(); fetchCorporates(); }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create corporate';
      setError(errorMsg); alert(errorMsg);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = getToken();
      if (!token) { setError('Not logged in'); router.push('/admin'); return; }
      const validContacts = formData.contacts.filter(c => c.name || c.email);
      const payload = { corporate_legal_name: formData.corporate_legal_name, corporate_group_name: formData.corporate_group_name, corporate_type: formData.corporate_type, industry_type: formData.industry_type, branding_config: { logo_url: formData.logo_url }, contact_details: validContacts.length > 0 ? validContacts : undefined };
      const response = await axios.put(`${API_URL}/corporates/${selectedCorporate.tenant_id}`, payload, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (response.data.success) { alert('Corporate updated successfully!'); setShowForm(false); setSelectedCorporate(null); resetForm(); fetchCorporates(); }
    } catch (error) { alert(error.response?.data?.message || 'Failed to update corporate'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this corporate?')) return;
    try {
      const token = getToken();
      if (!token) { setError('Not logged in'); router.push('/admin'); return; }
      const response = await axios.delete(`${API_URL}/corporates/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.data.success) { alert('Corporate deleted successfully!'); fetchCorporates(); }
    } catch (error) { alert(error.response?.data?.message || 'Failed to delete corporate'); }
  };

  const handleEdit = (corporate) => {
    setSelectedCorporate(corporate);
    const contacts = corporate.contact_details || [];
    setFormData({
      tenant_code: corporate.tenant_code, subdomain: corporate.subdomain,
      corporate_legal_name: corporate.corporate_legal_name || '', corporate_group_name: corporate.corporate_group_name || '',
      corporate_type: corporate.corporate_type || '', industry_type: corporate.industry_type || '',
      logo_url: corporate.branding_config?.logo_url || '',
      contacts: [contacts[0] || { name: '', email: '', phone: '', designation: '', level: '' }, contacts[1] || { name: '', email: '', phone: '', designation: '', level: '' }, contacts[2] || { name: '', email: '', phone: '', designation: '', level: '' }]
    });
    setShowForm(true); setError(null);
  };

  const resetForm = () => {
    setFormData({ tenant_code: '', subdomain: '', corporate_legal_name: '', corporate_group_name: '', corporate_type: '', industry_type: '', logo_url: '', contacts: [{ name: '', email: '', phone: '', designation: '', level: '' }, { name: '', email: '', phone: '', designation: '', level: '' }, { name: '', email: '', phone: '', designation: '', level: '' }] });
    setSelectedCorporate(null); setError(null);
  };

  useEffect(() => { fetchCorporates(); }, []);

useEffect(() => { 
  fetchLookupData();
  fetchCorporates(); 
}, []);


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src="/images/marketing/logo.png" alt="BenefitNest" style={{ height: '40px', objectFit: 'contain' }} />
            <button onClick={handleBack} style={{ padding: '8px 16px', backgroundColor: colors.gray[100], border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: colors.gray[700], fontWeight: '500' }}>← Back to Dashboard</button>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: colors.danger, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Logout</button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.gray[900], marginBottom: '8px' }}>Corporate Management</h1>
            <p style={{ color: colors.gray[500], fontSize: '14px' }}>Manage corporate clients and their configurations</p>
          </div>
          {!showForm && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowUploadModal(true)} disabled={uploadingBulk} style={{ padding: '12px 24px', backgroundColor: colors.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', opacity: uploadingBulk ? 0.7 : 1 }}>
                📤 {uploadingBulk ? 'Uploading...' : 'Upload Corporates'}
              </button>
              <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: '12px 24px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                + Add Corporate
              </button>
            </div>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '20px' }}>×</button>
          </div>
        )}

        {showUploadModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>📤 Upload Corporates</h2>
              <p style={{ color: colors.gray[600], fontSize: '14px', marginBottom: '24px' }}>Upload an Excel (.xlsx) or CSV (.csv) file with corporate data.</p>
              <div style={{ backgroundColor: colors.gray[50], borderRadius: '8px', padding: '16px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '13px', color: colors.gray[700], marginBottom: '12px' }}>📥 Download the sample template:</p>
                <button onClick={downloadSampleTemplate} style={{ padding: '8px 16px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Download Sample Template</button>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} style={{ display: 'none' }} id="bulk-upload" />
                <label htmlFor="bulk-upload" style={{ display: 'block', padding: '40px', border: '2px dashed #d1d5db', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>📁</div>
                  <p style={{ color: colors.gray[700], fontWeight: '500' }}>Click to select file</p>
                  <p style={{ color: colors.gray[500], fontSize: '13px' }}>Supports .xlsx, .xls, and .csv files</p>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowUploadModal(false)} style={{ padding: '10px 24px', backgroundColor: colors.gray[100], color: colors.gray[700], border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showResultsModal && uploadResults && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>📊 Upload Results</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: colors.gray[50], borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>{uploadResults.total}</div>
                  <div style={{ fontSize: '13px', color: colors.gray[500] }}>Total Records</div>
                </div>
                <div style={{ backgroundColor: '#d1fae5', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#065f46' }}>{uploadResults.success}</div>
                  <div style={{ fontSize: '13px', color: '#065f46' }}>Successful</div>
                </div>
                <div style={{ backgroundColor: uploadResults.failed > 0 ? '#fee2e2' : colors.gray[50], borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: uploadResults.failed > 0 ? '#991b1b' : colors.gray[900] }}>{uploadResults.failed}</div>
                  <div style={{ fontSize: '13px', color: uploadResults.failed > 0 ? '#991b1b' : colors.gray[500] }}>Failed</div>
                </div>
              </div>
              {uploadResults.failed > 0 && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b' }}>⚠️ {uploadResults.failed} record(s) failed</h3>
                    <button onClick={downloadErrorRecords} style={{ padding: '6px 12px', backgroundColor: '#991b1b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>📥 Download Errors</button>
                  </div>
                  <div style={{ maxHeight: '200px', overflow: 'auto', fontSize: '13px' }}>
                    {uploadResults.errors.slice(0, 5).map((err, idx) => (
                      <div key={idx} style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px', marginBottom: '8px', border: '1px solid #fecaca' }}>
                        <strong>Row {err.row_number}:</strong> {err.tenant_code || 'N/A'} - {err.error}
                      </div>
                    ))}
                    {uploadResults.errors.length > 5 && <p style={{ color: '#991b1b', fontStyle: 'italic' }}>... and {uploadResults.errors.length - 5} more errors</p>}
                  </div>
                </div>
              )}
              {uploadResults.success > 0 && uploadResults.failed === 0 && (
                <div style={{ backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
                  <span style={{ fontSize: '24px' }}>✅</span>
                  <p style={{ color: '#065f46', fontWeight: '500', marginTop: '8px' }}>All records uploaded successfully!</p>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowResultsModal(false); setUploadResults(null); }} style={{ padding: '10px 24px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {showForm ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', backgroundColor: colors.gray[50] }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{selectedCorporate ? '✏️ Edit Corporate' : '✨ Create New Corporate'}</h2>
            </div>
            <form onSubmit={selectedCorporate ? handleUpdate : handleCreate} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #2563eb' }}>📋 Basic Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Tenant Code <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" value={formData.tenant_code} onChange={(e) => setFormData({ ...formData, tenant_code: e.target.value.toUpperCase() })} required disabled={selectedCorporate} placeholder="e.g., CORP001" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: selectedCorporate ? '#f3f4f6' : 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Subdomain <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" value={formData.subdomain} onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })} required disabled={selectedCorporate} placeholder="e.g., acmecorp" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: selectedCorporate ? '#f3f4f6' : 'white' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Corporate Legal Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" value={formData.corporate_legal_name} onChange={(e) => setFormData({ ...formData, corporate_legal_name: e.target.value })} required placeholder="e.g., Acme Corporation Private Limited" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Group Name</label>
                    <input type="text" value={formData.corporate_group_name} onChange={(e) => setFormData({ ...formData, corporate_group_name: e.target.value })} placeholder="e.g., Acme Group" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Corporate Type</label>
                    <select value={formData.corporate_type} onChange={(e) => setFormData({ ...formData, corporate_type: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}>
                      <option value="">Select Corporate Type</option>
                      {CORPORATE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Industry Type</label>
                    <select value={formData.industry_type} onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}>
                      <option value="">Select Industry</option>
                      {INDUSTRY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #2563eb' }}>🎨 Branding</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {formData.logo_url && <div style={{ width: '100px', height: '100px', border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}><img src={formData.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /></div>}
                  <div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} style={{ display: 'none' }} id="logo-upload" />
                    <label htmlFor="logo-upload" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>{uploadingLogo ? 'Uploading...' : '📁 Choose Logo'}</label>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Recommended: 200x200px, PNG or JPG, max 5MB</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #2563eb' }}>👥 Contact Persons (Up to 3)</h3>
                {formData.contacts.map((contact, index) => (
                  <div key={index} style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Contact Person {index + 1} {index === 0 && <span style={{ color: '#ef4444' }}>*</span>}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Full Name {index === 0 && '*'}</label>
                        <input type="text" value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)} required={index === 0} placeholder="e.g., John Doe" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Email {index === 0 && '*'}</label>
                        <input type="email" value={contact.email} onChange={(e) => handleContactChange(index, 'email', e.target.value)} required={index === 0} placeholder="e.g., john@company.com" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Phone</label>
                        <input type="tel" value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} placeholder="e.g., +91 98765 43210" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Designation</label>
                        <input type="text" value={contact.designation} onChange={(e) => handleContactChange(index, 'designation', e.target.value)} placeholder="e.g., HR Manager" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Job Level</label>
                        <select value={contact.level} onChange={(e) => handleContactChange(index, 'level', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}>
                          <option value="">Select Level</option>
                          {CONTACT_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <button type="submit" style={{ padding: '12px 32px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>{selectedCorporate ? '💾 Update Corporate' : '✨ Create Corporate'}</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ padding: '12px 32px', backgroundColor: 'white', color: colors.gray[700], border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Cancel</button>
              </div>
            </form>
          </div>
        ) : loading ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading corporates...</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    {['Logo', 'Code', 'Legal Name', 'Subdomain', 'Industry', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '16px', textAlign: h === 'Actions' ? 'right' : 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600', fontSize: '13px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {corporates.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                      <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No corporates found</p>
                      <p style={{ fontSize: '14px' }}>Click "Add Corporate" to create your first corporate client</p>
                    </td></tr>
                  ) : corporates.map((corporate) => (
                    <tr key={corporate.tenant_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px' }}>
                        {corporate.branding_config?.logo_url ? <img src={corporate.branding_config.logo_url} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e5e7eb' }} /> : <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏢</div>}
                      </td>
                      <td style={{ padding: '16px', fontWeight: '600', fontSize: '14px' }}>{corporate.tenant_code}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{corporate.corporate_legal_name}</div>
                        {corporate.corporate_group_name && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Group: {corporate.corporate_group_name}</div>}
                      </td>
                      <td style={{ padding: '16px' }}><code style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace' }}>{corporate.subdomain}</code></td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{corporate.industry_type || '-'}</td>
                      <td style={{ padding: '16px' }}><span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: corporate.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2', color: corporate.status === 'ACTIVE' ? '#065f46' : '#991b1b' }}>{corporate.status}</span></td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(corporate)} style={{ padding: '8px 16px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>✏️ Edit</button>
                          <button onClick={() => handleDelete(corporate.tenant_id)} style={{ padding: '8px 16px', backgroundColor: colors.danger, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CorporatesManagement;
