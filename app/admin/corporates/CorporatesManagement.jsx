'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = 'https://benefitnest-backend.onrender.com/api/admin';
const LOOKUP_API_URL = 'https://benefitnest-backend.onrender.com/api/lookup';

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
  infoHover: '#7c3aed',
  infoLight: '#ede9fe',
  gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' }
};

// Beautiful Modal Component
const Modal = ({ isOpen, onClose, title, icon, children, size = 'md', showClose = true }) => {
  if (!isOpen) return null;
  const sizeStyles = { sm: '400px', md: '550px', lg: '700px', xl: '900px' };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: sizeStyles[size], maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s ease-out' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.gray[900], margin: 0 }}>{title}</h2>
          </div>
          {showClose && (
            <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', backgroundColor: colors.gray[100], color: colors.gray[500], cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', transition: 'all 0.2s' }} onMouseOver={(e) => { e.target.style.backgroundColor = colors.gray[200]; e.target.style.color = colors.gray[700]; }} onMouseOut={(e) => { e.target.style.backgroundColor = colors.gray[100]; e.target.style.color = colors.gray[500]; }}>×</button>
          )}
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>{children}</div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

// Beautiful Button Component
const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, disabled, style = {}, ...props }) => {
  const variants = {
    primary: { bg: colors.primary, hoverBg: colors.primaryHover, color: 'white' },
    success: { bg: colors.success, hoverBg: colors.successHover, color: 'white' },
    danger: { bg: colors.danger, hoverBg: colors.dangerHover, color: 'white' },
    info: { bg: colors.info, hoverBg: colors.infoHover, color: 'white' },
    outline: { bg: 'white', hoverBg: colors.gray[50], color: colors.gray[700], border: `1px solid ${colors.gray[300]}` },
    ghost: { bg: 'transparent', hoverBg: colors.gray[100], color: colors.gray[700] }
  };
  const sizes = { sm: { padding: '6px 12px', fontSize: '12px' }, md: { padding: '10px 18px', fontSize: '14px' }, lg: { padding: '12px 24px', fontSize: '15px' } };
  const v = variants[variant];
  const s = sizes[size];
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: s.padding, fontSize: s.fontSize, fontWeight: '600', color: v.color, backgroundColor: hover && !disabled ? v.hoverBg : v.bg, border: v.border || 'none', borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, transition: 'all 0.2s', boxShadow: variant !== 'ghost' && variant !== 'outline' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', ...style }} {...props}>
      {icon && <span style={{ fontSize: size === 'sm' ? '14px' : '16px' }}>{icon}</span>}
      {children}
    </button>
  );
};

// Badge Component
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: { bg: colors.gray[100], color: colors.gray[700] },
    success: { bg: colors.successLight, color: '#065f46' },
    danger: { bg: colors.dangerLight, color: '#991b1b' },
    warning: { bg: colors.warningLight, color: '#92400e' },
    info: { bg: colors.infoLight, color: '#5b21b6' }
  };
  const v = variants[variant];
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: v.bg, color: v.color }}>{children}</span>;
};

// Input Component
const Input = ({ label, required, error, icon, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label} {required && <span style={{ color: colors.danger }}>*</span>}</label>}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.gray[400] }}>{icon}</span>}
      <input {...props} style={{ width: '100%', padding: icon ? '12px 12px 12px 40px' : '12px', border: `1px solid ${error ? colors.danger : colors.gray[300]}`, borderRadius: '10px', fontSize: '14px', transition: 'all 0.2s', outline: 'none', backgroundColor: props.disabled ? colors.gray[50] : 'white', ...props.style }} onFocus={(e) => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px ${colors.primaryLight}`; }} onBlur={(e) => { e.target.style.borderColor = colors.gray[300]; e.target.style.boxShadow = 'none'; }} />
    </div>
    {error && <p style={{ marginTop: '4px', fontSize: '12px', color: colors.danger }}>{error}</p>}
  </div>
);

// Select Component
const Select = ({ label, required, options = [], grouped = false, loading, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label} {required && <span style={{ color: colors.danger }}>*</span>}</label>}
    <select {...props} style={{ width: '100%', padding: '12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '10px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer', ...props.style }}>
      <option value="">{loading ? 'Loading...' : `Select ${label || 'Option'}`}</option>
      {grouped ? Object.entries(options).map(([group, items]) => (
        <optgroup key={group} label={`── ${group} ──`}>
          {items.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
        </optgroup>
      )) : options.map(opt => <option key={opt.id || opt.value} value={opt.name || opt.value}>{opt.name || opt.label}</option>)}
    </select>
  </div>
);

// Stats Card Component
const StatsCard = ({ value, label, variant = 'default' }) => {
  const variants = {
    default: { bg: colors.gray[50], color: colors.gray[900] },
    success: { bg: colors.successLight, color: '#065f46' },
    danger: { bg: colors.dangerLight, color: '#991b1b' }
  };
  const v = variants[variant];
  return (
    <div style={{ backgroundColor: v.bg, borderRadius: '12px', padding: '20px', textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '32px', fontWeight: '700', color: v.color }}>{value}</div>
      <div style={{ fontSize: '13px', color: v.color, opacity: 0.8, marginTop: '4px' }}>{label}</div>
    </div>
  );
};

// Excel helpers
const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
};

const parseExcel = async (file) => {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const worksheet = workbook.worksheets[0];
  const data = [], headers = [];
  worksheet.eachRow((row, rowNum) => {
    if (rowNum === 1) row.eachCell(cell => headers.push(cell.value?.toString() || ''));
    else {
      const rowData = {};
      row.eachCell((cell, colNum) => { if (headers[colNum - 1]) rowData[headers[colNum - 1]] = cell.value?.toString() || ''; });
      if (Object.keys(rowData).length > 0) data.push(rowData);
    }
  });
  return data;
};

const downloadExcel = async (data, filename) => {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  data.forEach(row => worksheet.addRow(headers.map(h => row[h] || '')));
  worksheet.columns.forEach(col => { col.width = 20; });
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// Main Component
const CorporatesManagement = () => {
  const router = useRouter();
  
  // Data states
  const [corporates, setCorporates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Lookup data
  const [industryTypes, setIndustryTypes] = useState([]);
  const [corporateTypes, setCorporateTypes] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  
  // UI states
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showUrlSuccessModal, setShowUrlSuccessModal] = useState(false);
  
  // Selection & Form states
  const [selectedCorporate, setSelectedCorporate] = useState(null);
  const [viewCorporate, setViewCorporate] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [creatingUrl, setCreatingUrl] = useState(false);
  const [createdUrl, setCreatedUrl] = useState('');
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    tenant_code: '', subdomain: '', corporate_legal_name: '', corporate_group_name: '',
    corporate_type: '', industry_type: '', logo_url: '',
    contacts: [
      { name: '', email: '', phone: '', designation: '', level: '' },
      { name: '', email: '', phone: '', designation: '', level: '' },
      { name: '', email: '', phone: '', designation: '', level: '' }
    ]
  });

  // Auth helpers
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; max-age=0';
    window.location.href = 'https://www.benefitnest.space';
  };

  // Fetch functions
  const fetchLookupData = async () => {
    try {
      setLoadingLookups(true);
      const response = await axios.get(`${LOOKUP_API_URL}/all`);
      if (response.data.success) {
        setCorporateTypes(response.data.data.corporateTypes || []);
        setIndustryTypes(response.data.data.industryTypes || []);
        setJobLevels(response.data.data.jobLevels || []);
      }
    } catch (err) { console.error('Lookup error:', err); }
    finally { setLoadingLookups(false); }
  };

  const fetchCorporates = async () => {
    try {
      setLoading(true); setError(null);
      const token = getToken();
      if (!token) { router.push('/admin'); return; }
      const response = await axios.get(`${API_URL}/corporates`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) setCorporates(response.data.data || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('admin_token');
        document.cookie = 'admin_token=; path=/; max-age=0';
        setTimeout(() => router.push('/admin'), 1500);
        setError('Session expired. Redirecting...');
      } else setError(err.response?.data?.message || 'Failed to fetch corporates');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLookupData(); fetchCorporates(); }, []);

  // Filtered & Paginated data
const filteredCorporates = useMemo(() => {
  if (!searchQuery.trim()) return corporates;
  const q = searchQuery.toLowerCase();
  return corporates.filter(c => 
    c.tenant_code?.toLowerCase().includes(q) ||
    c.subdomain?.toLowerCase().includes(q) ||
    c.corporate_legal_name?.toLowerCase().includes(q) ||
    c.corporate_group_name?.toLowerCase().includes(q) ||
    c.industry_type?.toLowerCase().includes(q) ||
    c.corporate_type?.toLowerCase().includes(q) ||
    (Array.isArray(c.contact_details) && c.contact_details.some(contact => 
      contact?.name?.toLowerCase().includes(q) ||
      contact?.email?.toLowerCase().includes(q)
    ))
  );
}, [corporates, searchQuery]);

  const totalPages = Math.ceil(filteredCorporates.length / itemsPerPage);
  const paginatedCorporates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCorporates.slice(start, start + itemsPerPage);
  }, [filteredCorporates, currentPage, itemsPerPage]);

  // Reset to page 1 when search or items per page changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery, itemsPerPage]);

  // Group lookup data
  const groupedJobLevels = useMemo(() => jobLevels.reduce((acc, l) => { const c = l.category || 'Other'; if (!acc[c]) acc[c] = []; acc[c].push(l); return acc; }, {}), [jobLevels]);
  const groupedIndustryTypes = useMemo(() => industryTypes.reduce((acc, i) => { const s = i.sector || 'Other'; if (!acc[s]) acc[s] = []; acc[s].push(i); return acc; }, {}), [industryTypes]);

  // Form handlers
  const resetForm = () => {
    setFormData({ tenant_code: '', subdomain: '', corporate_legal_name: '', corporate_group_name: '', corporate_type: '', industry_type: '', logo_url: '', contacts: [{ name: '', email: '', phone: '', designation: '', level: '' }, { name: '', email: '', phone: '', designation: '', level: '' }, { name: '', email: '', phone: '', designation: '', level: '' }] });
    setSelectedCorporate(null); setError(null);
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...formData.contacts];
    newContacts[index][field] = value;
    setFormData({ ...formData, contacts: newContacts });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return; }
    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => { setFormData({ ...formData, logo_url: reader.result }); setUploadingLogo(false); };
    reader.readAsDataURL(file);
  };

  // CRUD handlers
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const validContacts = formData.contacts.filter(c => c.name || c.email);
      const payload = { ...formData, branding_config: { logo_url: formData.logo_url }, contact_details: validContacts.length ? validContacts : undefined };
      delete payload.logo_url; delete payload.contacts;
      const response = await axios.post(`${API_URL}/corporates`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) { setShowForm(false); resetForm(); fetchCorporates(); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to create'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const validContacts = formData.contacts.filter(c => c.name || c.email);
      const payload = { corporate_legal_name: formData.corporate_legal_name, corporate_group_name: formData.corporate_group_name, corporate_type: formData.corporate_type, industry_type: formData.industry_type, branding_config: { logo_url: formData.logo_url }, contact_details: validContacts.length ? validContacts : undefined };
      const response = await axios.put(`${API_URL}/corporates/${selectedCorporate.tenant_id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) { setShowForm(false); setSelectedCorporate(null); resetForm(); fetchCorporates(); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to update'); }
  };

  const handleDelete = async (corp) => {
    if (!window.confirm(`Delete "${corp.corporate_legal_name}"? This action cannot be undone.`)) return;
    try {
      const token = getToken();
      const response = await axios.delete(`${API_URL}/corporates/${corp.tenant_id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) fetchCorporates();
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleEdit = (corp) => {
    setSelectedCorporate(corp);
    const contacts = corp.contact_details || [];
    setFormData({
      tenant_code: corp.tenant_code, subdomain: corp.subdomain,
      corporate_legal_name: corp.corporate_legal_name || '', corporate_group_name: corp.corporate_group_name || '',
      corporate_type: corp.corporate_type || '', industry_type: corp.industry_type || '',
      logo_url: corp.branding_config?.logo_url || '',
      contacts: [contacts[0] || { name: '', email: '', phone: '', designation: '', level: '' }, contacts[1] || { name: '', email: '', phone: '', designation: '', level: '' }, contacts[2] || { name: '', email: '', phone: '', designation: '', level: '' }]
    });
    setShowForm(true);
  };

  const handleView = (corp) => { setViewCorporate(corp); setShowViewModal(true); };

  // Create URL handler
  const handleCreateUrl = async (corp) => {
    setSelectedCorporate(corp);
    setShowUrlModal(true);
  };

  const confirmCreateUrl = async () => {
    if (!selectedCorporate) return;
    setCreatingUrl(true);
    try {
      const token = getToken();
      // Check if URL already exists
      const subdomain = selectedCorporate.subdomain.toLowerCase();
      const fullUrl = `https://${subdomain}.benefitnest.space`;
      
      // Check if corporate already has a URL
      if (selectedCorporate.portal_url) {
        setShowUrlModal(false);
        setError(`URL already exists for this corporate: ${selectedCorporate.portal_url}`);
        setCreatingUrl(false);
        return;
      }
      
      // Update corporate with portal URL
      const response = await axios.put(`${API_URL}/corporates/${selectedCorporate.tenant_id}`, 
        { portal_url: fullUrl, portal_status: 'ACTIVE' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setCreatedUrl(fullUrl);
        setShowUrlModal(false);
        setShowUrlSuccessModal(true);
        fetchCorporates();
      }
    } catch (err) {
      if (err.response?.data?.message?.includes('already exists') || err.response?.status === 409) {
        setShowUrlModal(false);
        setError(`URL already exists: ${selectedCorporate.subdomain}.benefitnest.space`);
      } else {
        setError(err.response?.data?.message || 'Failed to create URL');
      }
    } finally { setCreatingUrl(false); }
  };

  // Bulk upload handlers
  const validateRow = (row, existingSubdomains, existingCodes) => {
    const errors = [];
    if (!row.tenant_code?.toString().trim()) errors.push('tenant_code required');
    else if (existingCodes.has(row.tenant_code.toString().trim().toUpperCase())) errors.push('tenant_code exists');
    if (!row.subdomain?.toString().trim()) errors.push('subdomain required');
    else {
      const sd = row.subdomain.toString().trim().toLowerCase();
      if (!/^[a-z0-9]+$/.test(sd)) errors.push('subdomain: only lowercase letters/numbers');
      else if (existingSubdomains.has(sd)) errors.push('subdomain exists');
    }
    if (!row.corporate_legal_name?.toString().trim()) errors.push('corporate_legal_name required');
    if (!row.contact1_name?.toString().trim()) errors.push('contact1_name required');
    if (!row.contact1_email?.toString().trim()) errors.push('contact1_email required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact1_email.toString().trim())) errors.push('contact1_email invalid');
    return errors;
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) { alert('Upload Excel or CSV'); return; }
    setUploadingBulk(true); setShowUploadModal(false);
    try {
      const token = getToken();
      const jsonData = ext === 'csv' ? parseCSV(await file.text()) : await parseExcel(file);
      if (!jsonData.length) { alert('File is empty'); setUploadingBulk(false); return; }
      
      const existingSubdomains = new Set(corporates.map(c => c.subdomain?.toLowerCase()));
      const existingCodes = new Set(corporates.map(c => c.tenant_code?.toUpperCase()));
      const newSubdomains = new Set(), newCodes = new Set();
      const successRecords = [], errorRecords = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const errors = validateRow(row, new Set([...existingSubdomains, ...newSubdomains]), new Set([...existingCodes, ...newCodes]));
        if (errors.length) {
          errorRecords.push({ ...row, row_number: i + 2, error: errors.join('; ') });
        } else {
          const contacts = [];
          if (row.contact1_name) contacts.push({ name: row.contact1_name?.toString().trim(), email: row.contact1_email?.toString().trim(), phone: row.contact1_phone?.toString().trim() || '', designation: row.contact1_designation?.toString().trim() || '', level: row.contact1_level?.toString().trim() || '' });
          if (row.contact2_name || row.contact2_email) contacts.push({ name: row.contact2_name?.toString().trim() || '', email: row.contact2_email?.toString().trim() || '', phone: row.contact2_phone?.toString().trim() || '', designation: row.contact2_designation?.toString().trim() || '', level: row.contact2_level?.toString().trim() || '' });
          if (row.contact3_name || row.contact3_email) contacts.push({ name: row.contact3_name?.toString().trim() || '', email: row.contact3_email?.toString().trim() || '', phone: row.contact3_phone?.toString().trim() || '', designation: row.contact3_designation?.toString().trim() || '', level: row.contact3_level?.toString().trim() || '' });
          
          const payload = {
            tenant_code: row.tenant_code.toString().trim().toUpperCase(),
            subdomain: row.subdomain.toString().trim().toLowerCase(),
            corporate_legal_name: row.corporate_legal_name.toString().trim(),
            corporate_group_name: row.corporate_group_name?.toString().trim() || '',
            corporate_type: row.corporate_type?.toString().trim() || '',
            industry_type: row.industry_type?.toString().trim() || '',
            contact_details: contacts
          };
          try {
            const resp = await axios.post(`${API_URL}/corporates`, payload, { headers: { Authorization: `Bearer ${token}` } });
            if (resp.data.success) { successRecords.push(row); newSubdomains.add(payload.subdomain); newCodes.add(payload.tenant_code); }
            else errorRecords.push({ ...row, row_number: i + 2, error: resp.data.message || 'Failed' });
          } catch (err) { errorRecords.push({ ...row, row_number: i + 2, error: err.response?.data?.message || err.message }); }
        }
      }
      setUploadResults({ total: jsonData.length, success: successRecords.length, failed: errorRecords.length, errors: errorRecords });
      setShowResultsModal(true); fetchCorporates();
    } catch (err) { alert('Error: ' + err.message); }
    finally { setUploadingBulk(false); e.target.value = ''; }
  };

  const downloadErrorRecords = async () => {
    if (!uploadResults?.errors?.length) return;
    const errorData = uploadResults.errors.map(r => ({
      row_number: r.row_number, tenant_code: r.tenant_code || '', subdomain: r.subdomain || '',
      corporate_legal_name: r.corporate_legal_name || '', corporate_group_name: r.corporate_group_name || '',
      corporate_type: r.corporate_type || '', industry_type: r.industry_type || '',
      contact1_name: r.contact1_name || '', contact1_email: r.contact1_email || '',
      error_description: r.error
    }));
    await downloadExcel(errorData, 'corporate_upload_errors.xlsx');
  };

  const downloadSampleTemplate = async () => {
    const sampleData = [
      { tenant_code: 'CORP001', subdomain: 'acmecorp', corporate_legal_name: 'Acme Corporation Pvt Ltd', corporate_group_name: 'Acme Group', corporate_type: 'Private Limited Company', industry_type: 'Information Technology Services', contact1_name: 'John Doe', contact1_email: 'john@acmecorp.com', contact1_phone: '+91 98765 43210', contact1_designation: 'HR Manager', contact1_level: 'Manager', contact2_name: '', contact2_email: '', contact2_phone: '', contact2_designation: '', contact2_level: '', contact3_name: '', contact3_email: '', contact3_phone: '', contact3_designation: '', contact3_level: '' }
    ];
    await downloadExcel(sampleData, 'corporate_upload_template.xlsx');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src="/images/marketing/logo.png" alt="BenefitNest" style={{ height: '40px', objectFit: 'contain' }} />
            <Button variant="ghost" icon="←" onClick={() => router.push('/admin/dashboard')}>Back to Dashboard</Button>
          </div>
          <Button variant="danger" icon="🚪" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Page Title & Actions */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.gray[900], marginBottom: '4px' }}>Corporate Management</h1>
              <p style={{ color: colors.gray[500], fontSize: '14px' }}>Manage corporate clients, create portals, and configure settings</p>
            </div>
            {!showForm && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Button variant="success" icon="📤" onClick={() => setShowUploadModal(true)} disabled={uploadingBulk}>
                  {uploadingBulk ? 'Uploading...' : 'Upload Corporates'}
                </Button>
                <Button variant="primary" icon="+" onClick={() => { resetForm(); setShowForm(true); }}>Add Corporate</Button>
              </div>
            )}
          </div>
          
          {/* Search Bar */}
          {!showForm && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '500px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.gray[400], fontSize: '18px' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, code, subdomain, industry, contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 44px', border: `2px solid ${colors.gray[200]}`, borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                  onFocus={(e) => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px ${colors.primaryLight}`; }}
                  onBlur={(e) => { e.target.style.borderColor = colors.gray[200]; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.gray[600], fontSize: '14px' }}>
                <span>Showing</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  style={{ padding: '8px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>of {filteredCorporates.length} records</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ backgroundColor: colors.dangerLight, border: `1px solid ${colors.danger}`, color: '#991b1b', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ fontWeight: '500' }}>{error}</span>
            </div>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '24px', lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Form View */}
        {showForm ? (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.gray[900], display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{selectedCorporate ? '✏️' : '✨'}</span>
                {selectedCorporate ? 'Edit Corporate' : 'Create New Corporate'}
              </h2>
            </div>
            <form onSubmit={selectedCorporate ? handleUpdate : handleCreate} style={{ padding: '24px' }}>
              {/* Basic Info Section */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.gray[800], marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${colors.primary}`, display: 'inline-block' }}>📋 Basic Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <Input label="Tenant Code" required value={formData.tenant_code} onChange={(e) => setFormData({ ...formData, tenant_code: e.target.value.toUpperCase() })} disabled={selectedCorporate} placeholder="e.g., CORP001" />
                  <Input label="Subdomain" required value={formData.subdomain} onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })} disabled={selectedCorporate} placeholder="e.g., acmecorp" />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Input label="Corporate Legal Name" required value={formData.corporate_legal_name} onChange={(e) => setFormData({ ...formData, corporate_legal_name: e.target.value })} placeholder="e.g., Acme Corporation Private Limited" />
                  </div>
                  <Input label="Group Name" value={formData.corporate_group_name} onChange={(e) => setFormData({ ...formData, corporate_group_name: e.target.value })} placeholder="e.g., Acme Group" />
                  <Select label="Corporate Type" value={formData.corporate_type} onChange={(e) => setFormData({ ...formData, corporate_type: e.target.value })} options={corporateTypes} loading={loadingLookups} />
                  <Select label="Industry Type" value={formData.industry_type} onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })} options={groupedIndustryTypes} grouped loading={loadingLookups} />
                </div>
              </div>

              {/* Branding Section */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.gray[800], marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${colors.primary}`, display: 'inline-block' }}>🎨 Branding</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ width: '100px', height: '100px', border: `2px dashed ${colors.gray[300]}`, borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[50] }}>
                    {formData.logo_url ? <img src={formData.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ color: colors.gray[400], fontSize: '32px' }}>🏢</span>}
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} style={{ display: 'none' }} id="logo-upload" />
                    <Button as="label" htmlFor="logo-upload" variant="outline" icon="📁" style={{ cursor: 'pointer' }}>{uploadingLogo ? 'Uploading...' : 'Choose Logo'}</Button>
                    <p style={{ fontSize: '12px', color: colors.gray[500], marginTop: '8px' }}>PNG or JPG, max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Contacts Section */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.gray[800], marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${colors.primary}`, display: 'inline-block' }}>👥 Contact Persons</h3>
                {formData.contacts.map((contact, idx) => (
                  <div key={idx} style={{ marginBottom: '16px', padding: '20px', backgroundColor: colors.gray[50], borderRadius: '12px', border: `1px solid ${colors.gray[200]}` }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: colors.gray[700], marginBottom: '12px' }}>
                      Contact {idx + 1} {idx === 0 && <Badge variant="danger">Required</Badge>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <Input label="Name" required={idx === 0} value={contact.name} onChange={(e) => handleContactChange(idx, 'name', e.target.value)} placeholder="Full Name" />
                      <Input label="Email" required={idx === 0} type="email" value={contact.email} onChange={(e) => handleContactChange(idx, 'email', e.target.value)} placeholder="email@company.com" />
                      <Input label="Phone" value={contact.phone} onChange={(e) => handleContactChange(idx, 'phone', e.target.value)} placeholder="+91 98765 43210" />
                      <Input label="Designation" value={contact.designation} onChange={(e) => handleContactChange(idx, 'designation', e.target.value)} placeholder="HR Manager" />
                      <div style={{ gridColumn: 'span 2' }}>
                        <Select label="Job Level" value={contact.level} onChange={(e) => handleContactChange(idx, 'level', e.target.value)} options={groupedJobLevels} grouped loading={loadingLookups} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: `1px solid ${colors.gray[200]}` }}>
                <Button type="submit" variant="primary" icon={selectedCorporate ? '💾' : '✨'}>{selectedCorporate ? 'Update Corporate' : 'Create Corporate'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        ) : loading ? (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '80px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '48px', height: '48px', border: `4px solid ${colors.gray[200]}`, borderTop: `4px solid ${colors.primary}`, borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: colors.gray[500] }}>Loading corporates...</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: colors.gray[50] }}>
                      {['Logo', 'Code', 'Corporate Name', 'Subdomain', 'Industry', 'Status', 'Portal', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', borderBottom: `2px solid ${colors.gray[200]}`, fontWeight: '600', fontSize: '12px', color: colors.gray[600], textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCorporates.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: colors.gray[500] }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{searchQuery ? '🔍' : '📋'}</div>
                          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{searchQuery ? 'No results found' : 'No corporates yet'}</p>
                          <p style={{ fontSize: '14px' }}>{searchQuery ? 'Try different search terms' : 'Click "Add Corporate" to create one'}</p>
                        </td>
                      </tr>
                    ) : paginatedCorporates.map((corp, idx) => (
                      <tr key={corp.tenant_id} style={{ borderBottom: `1px solid ${colors.gray[100]}`, backgroundColor: idx % 2 === 0 ? 'white' : colors.gray[50] }}>
                        <td style={{ padding: '12px 16px' }}>
                          {corp.branding_config?.logo_url ? 
                            <img src={corp.branding_config.logo_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px', border: `1px solid ${colors.gray[200]}` }} /> : 
                            <div style={{ width: '40px', height: '40px', backgroundColor: colors.gray[100], borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏢</div>
                          }
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px', color: colors.gray[900] }}>{corp.tenant_code}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '500', fontSize: '14px', color: colors.gray[900] }}>{corp.corporate_legal_name}</div>
                          {corp.corporate_group_name && <div style={{ fontSize: '12px', color: colors.gray[500] }}>{corp.corporate_group_name}</div>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <code style={{ backgroundColor: colors.gray[100], padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }}>{corp.subdomain}</code>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: colors.gray[600] }}>{corp.industry_type || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge variant={corp.status === 'ACTIVE' ? 'success' : 'danger'}>{corp.status}</Badge>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {corp.portal_url ? (
                            <a href={corp.portal_url} target="_blank" rel="noopener noreferrer" style={{ color: colors.primary, fontSize: '12px', textDecoration: 'none' }}>
                              🔗 {corp.portal_url.replace('https://', '')}
                            </a>
                          ) : <span style={{ color: colors.gray[400], fontSize: '12px' }}>Not created</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <Button size="sm" variant="info" icon="👁️" onClick={() => handleView(corp)}>View</Button>
                            <Button size="sm" variant="primary" icon="✏️" onClick={() => handleEdit(corp)}>Edit</Button>
                            <Button size="sm" variant="success" icon="🔗" onClick={() => handleCreateUrl(corp)} disabled={!!corp.portal_url}>URL</Button>
                            <Button size="sm" variant="danger" icon="🗑️" onClick={() => handleDelete(corp)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ color: colors.gray[600], fontSize: '14px' }}>
                  Page {currentPage} of {totalPages} ({filteredCorporates.length} total records)
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</Button>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                          style={{ width: '36px', height: '36px', borderRadius: '8px', border: currentPage === pageNum ? 'none' : `1px solid ${colors.gray[300]}`, backgroundColor: currentPage === pageNum ? colors.primary : 'white', color: currentPage === pageNum ? 'white' : colors.gray[700], cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Corporate Details" icon="🏢" size="lg">
        {viewCorporate && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '20px', backgroundColor: colors.gray[50], borderRadius: '12px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${colors.gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                {viewCorporate.branding_config?.logo_url ? <img src={viewCorporate.branding_config.logo_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '32px' }}>🏢</span>}
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.gray[900], marginBottom: '4px' }}>{viewCorporate.corporate_legal_name}</h3>
                {viewCorporate.corporate_group_name && <p style={{ color: colors.gray[500], fontSize: '14px' }}>Part of {viewCorporate.corporate_group_name}</p>}
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <Badge variant={viewCorporate.status === 'ACTIVE' ? 'success' : 'danger'}>{viewCorporate.status}</Badge>
                  {viewCorporate.portal_url && <Badge variant="info">Portal Active</Badge>}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: colors.gray[50], borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: colors.gray[500], marginBottom: '4px' }}>Tenant Code</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: colors.gray[900] }}>{viewCorporate.tenant_code}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: colors.gray[50], borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: colors.gray[500], marginBottom: '4px' }}>Subdomain</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: colors.gray[900] }}>{viewCorporate.subdomain}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: colors.gray[50], borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: colors.gray[500], marginBottom: '4px' }}>Corporate Type</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: colors.gray[900] }}>{viewCorporate.corporate_type || '—'}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: colors.gray[50], borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: colors.gray[500], marginBottom: '4px' }}>Industry</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: colors.gray[900] }}>{viewCorporate.industry_type || '—'}</div>
              </div>
              {viewCorporate.portal_url && (
                <div style={{ padding: '16px', backgroundColor: colors.primaryLight, borderRadius: '10px', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '12px', color: colors.primary, marginBottom: '4px' }}>Portal URL</div>
                  <a href={viewCorporate.portal_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px', fontWeight: '600', color: colors.primary }}>{viewCorporate.portal_url}</a>
                </div>
              )}
            </div>

            {viewCorporate.contact_details?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: colors.gray[800], marginBottom: '12px' }}>👥 Contact Persons</h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {viewCorporate.contact_details.map((contact, idx) => (
                    <div key={idx} style={{ padding: '16px', backgroundColor: colors.gray[50], borderRadius: '10px', border: `1px solid ${colors.gray[200]}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '15px', color: colors.gray[900] }}>{contact.name}</div>
                          <div style={{ fontSize: '13px', color: colors.gray[600], marginTop: '2px' }}>{contact.designation || contact.level || 'Contact Person'}</div>
                        </div>
                        <Badge>Contact {idx + 1}</Badge>
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                        {contact.email && <span style={{ color: colors.gray[600] }}>📧 {contact.email}</span>}
                        {contact.phone && <span style={{ color: colors.gray[600] }}>📱 {contact.phone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${colors.gray[200]}`, display: 'flex', gap: '12px' }}>
              <Button variant="primary" icon="✏️" onClick={() => { setShowViewModal(false); handleEdit(viewCorporate); }}>Edit Corporate</Button>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Corporates" icon="📤" size="md">
        <p style={{ color: colors.gray[600], marginBottom: '24px' }}>Upload an Excel (.xlsx) or CSV file with corporate data. Download the template first to ensure correct format.</p>
        
        <div style={{ backgroundColor: colors.primaryLight, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: '600', color: colors.primary, marginBottom: '4px' }}>📥 Download Template</div>
              <div style={{ fontSize: '13px', color: colors.gray[600] }}>Get the sample template with all required fields</div>
            </div>
            <Button variant="primary" size="sm" onClick={downloadSampleTemplate}>Download</Button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} style={{ display: 'none' }} id="bulk-upload" />
          <label htmlFor="bulk-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', border: `2px dashed ${colors.gray[300]}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: colors.gray[50] }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
            <div style={{ fontWeight: '600', color: colors.gray[700], marginBottom: '4px' }}>Click to select file</div>
            <div style={{ fontSize: '13px', color: colors.gray[500] }}>Supports .xlsx, .xls, .csv</div>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
        </div>
      </Modal>

      {/* Upload Results Modal */}
      <Modal isOpen={showResultsModal} onClose={() => { setShowResultsModal(false); setUploadResults(null); }} title="Upload Results" icon="📊" size="md">
        {uploadResults && (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <StatsCard value={uploadResults.total} label="Total Records" />
              <StatsCard value={uploadResults.success} label="Successful" variant="success" />
              <StatsCard value={uploadResults.failed} label="Failed" variant={uploadResults.failed > 0 ? 'danger' : 'default'} />
            </div>

            {uploadResults.failed > 0 && (
              <div style={{ backgroundColor: colors.dangerLight, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontWeight: '600', color: '#991b1b' }}>⚠️ {uploadResults.failed} record(s) failed</span>
                  <Button size="sm" variant="danger" icon="📥" onClick={downloadErrorRecords}>Download Errors</Button>
                </div>
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {uploadResults.errors.slice(0, 5).map((err, idx) => (
                    <div key={idx} style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '8px', fontSize: '13px', border: '1px solid #fecaca' }}>
                      <strong>Row {err.row_number}:</strong> {err.error}
                    </div>
                  ))}
                  {uploadResults.errors.length > 5 && <p style={{ color: '#991b1b', fontSize: '13px', fontStyle: 'italic' }}>...and {uploadResults.errors.length - 5} more errors</p>}
                </div>
              </div>
            )}

            {uploadResults.success > 0 && uploadResults.failed === 0 && (
              <div style={{ backgroundColor: colors.successLight, borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>✅</div>
                <div style={{ fontWeight: '600', color: '#065f46' }}>All records uploaded successfully!</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => { setShowResultsModal(false); setUploadResults(null); }}>Close</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Create URL Confirmation Modal */}
      <Modal isOpen={showUrlModal} onClose={() => setShowUrlModal(false)} title="Create Portal URL" icon="🔗" size="sm">
        {selectedCorporate && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>🌐</div>
              <p style={{ color: colors.gray[600], marginBottom: '16px' }}>Create a dedicated portal URL for</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: colors.gray[900] }}>{selectedCorporate.corporate_legal_name}</p>
            </div>

            <div style={{ backgroundColor: colors.gray[50], borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: colors.gray[500], marginBottom: '8px' }}>Portal URL will be:</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: colors.primary }}>
                https://{selectedCorporate.subdomain}.benefitnest.space
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="primary" icon="✓" onClick={confirmCreateUrl} disabled={creatingUrl} style={{ flex: 1 }}>
                {creatingUrl ? 'Creating...' : 'Create URL'}
              </Button>
              <Button variant="outline" onClick={() => setShowUrlModal(false)} style={{ flex: 1 }}>Cancel</Button>
            </div>
          </>
        )}
      </Modal>

      {/* URL Success Modal */}
      <Modal isOpen={showUrlSuccessModal} onClose={() => setShowUrlSuccessModal(false)} title="Portal URL Created!" icon="🎉" size="sm">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: colors.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '48px' }}>✅</div>
          <p style={{ fontSize: '16px', color: colors.gray[700], marginBottom: '20px' }}>Portal URL has been created successfully!</p>
          
          <div style={{ backgroundColor: colors.gray[50], borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: colors.gray[500], marginBottom: '8px' }}>Your portal is now live at:</div>
            <a href={createdUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, wordBreak: 'break-all' }}>
              {createdUrl}
            </a>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="primary" icon="🔗" onClick={() => window.open(createdUrl, '_blank')} style={{ flex: 1 }}>Open Portal</Button>
            <Button variant="outline" onClick={() => setShowUrlSuccessModal(false)} style={{ flex: 1 }}>Close</Button>
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input:focus, select:focus, button:focus { outline: none; }
        @media (max-width: 768px) {
          main { padding: 16px !important; }
          table th, table td { padding: 8px !important; font-size: 12px !important; }
        }
      `}</style>
    </div>
  );
};

export default CorporatesManagement;
