'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://benefitnest-backend.onrender.com';
const CORPORATES_API = `${API_URL}/api/admin/corporates`;
const MASTERS_API = `${API_URL}/api/admin/masters`;
const LOOKUP_API = `${API_URL}/api/lookup`;
const AUTH_API = `${API_URL}/api/admin`;

const colors = {
    primary: '#2563eb', primaryHover: '#1d4ed8', primaryLight: '#dbeafe',
    success: '#10b981', successHover: '#059669', successLight: '#d1fae5',
    danger: '#ef4444', dangerHover: '#dc2626', dangerLight: '#fee2e2',
    warning: '#f59e0b', warningHover: '#d97706', warningLight: '#fef3c7',
    info: '#8b5cf6', infoHover: '#7c3aed', infoLight: '#ede9fe',
    cyan: '#0ea5e9', cyanLight: '#e0f2fe',
    gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' }
};

const Modal = ({ isOpen, onClose, title, icon, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeStyles = { sm: '440px', md: '600px', lg: '900px', xl: '1100px' };
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: sizeStyles[size], maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{icon && <span style={{ fontSize: '22px' }}>{icon}</span>}<h2 style={{ fontSize: '17px', fontWeight: '700', color: colors.gray[900], margin: 0 }}>{title}</h2></div>
                    <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: colors.gray[100], cursor: 'pointer', fontSize: '18px' }}>×</button>
                </div>
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>{children}</div>
            </div>
        </div>
    );
};

const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, disabled, loading, style = {} }) => {
    const variants = { primary: { bg: colors.primary, hoverBg: colors.primaryHover, color: 'white' }, success: { bg: colors.success, hoverBg: colors.successHover, color: 'white' }, danger: { bg: colors.danger, hoverBg: colors.dangerHover, color: 'white' }, warning: { bg: colors.warning, hoverBg: colors.warningHover, color: 'white' }, cyan: { bg: colors.cyan, hoverBg: '#0284c7', color: 'white' }, info: { bg: colors.info, hoverBg: colors.infoHover, color: 'white' }, outline: { bg: 'white', hoverBg: colors.gray[50], color: colors.gray[700], border: `1px solid ${colors.gray[300]}` }, ghost: { bg: 'transparent', hoverBg: colors.gray[100], color: colors.gray[700] } };
    const sizes = { xs: { padding: '4px 8px', fontSize: '11px' }, sm: { padding: '6px 12px', fontSize: '12px' }, md: { padding: '10px 16px', fontSize: '14px' } };
    const v = variants[variant] || variants.primary; const s = sizes[size] || sizes.md;
    const [hover, setHover] = useState(false);
    return (<button onClick={onClick} disabled={disabled || loading} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: s.padding, fontSize: s.fontSize, fontWeight: '600', color: v.color, backgroundColor: hover && !disabled ? v.hoverBg : v.bg, border: v.border || 'none', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, transition: 'all 0.15s', whiteSpace: 'nowrap', ...style }}>{loading ? <span style={{ width: '14px', height: '14px', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : icon && <span>{icon}</span>}{children}</button>);
};

const Badge = ({ children, variant = 'default' }) => {
    const variants = { default: { bg: colors.gray[100], color: colors.gray[700] }, success: { bg: colors.successLight, color: '#065f46' }, danger: { bg: colors.dangerLight, color: '#991b1b' }, warning: { bg: colors.warningLight, color: '#92400e' }, info: { bg: colors.infoLight, color: '#5b21b6' }, cyan: { bg: colors.cyanLight, color: '#0369a1' } };
    const v = variants[variant] || variants.default;
    return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', backgroundColor: v.bg, color: v.color }}>{children}</span>;
};

const Input = ({ label, required, type = 'text', ...props }) => (<div style={{ marginBottom: '16px' }}>{label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}<input type={type} {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', ...props.style }} /></div>);

const Select = ({ label, required, options = [], placeholder, ...props }) => (<div style={{ marginBottom: '16px' }}>{label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}<select {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer', boxSizing: 'border-box', ...props.style }}><option value="">{placeholder || `Select ${label || 'option'}`}</option>{options.map(opt => <option key={opt.value ?? opt.id ?? opt.name} value={opt.value ?? opt.id ?? opt.name}>{opt.label || opt.name}</option>)}</select></div>);

const TextArea = ({ label, required, ...props }) => (<div style={{ marginBottom: '16px' }}>{label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}<textarea {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', ...props.style }} /></div>);

const Checkbox = ({ label, checked, onChange }) => (<div style={{ marginBottom: '16px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: colors.gray[700], cursor: 'pointer' }}><input type="checkbox" checked={checked} onChange={onChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />{label}</label></div>);

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
    const types = { success: { bg: colors.successLight, color: '#065f46', icon: '✓' }, error: { bg: colors.dangerLight, color: '#991b1b', icon: '✕' }, warning: { bg: colors.warningLight, color: '#92400e', icon: '⚠' }, info: { bg: colors.primaryLight, color: colors.primary, icon: 'ℹ' } };
    const t = types[type] || types.info;
    return (<div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: t.bg, color: t.color, padding: '14px 20px', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2000, maxWidth: '400px' }}><span style={{ fontWeight: '700' }}>{t.icon}</span><span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span><button onClick={onClose} style={{ background: 'none', border: 'none', color: t.color, cursor: 'pointer', fontSize: '18px', marginLeft: '8px' }}>×</button></div>);
};

const StatsCard = ({ value, label, icon, active, onClick }) => (
    <div onClick={onClick} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: `1px solid ${active ? colors.primary : colors.gray[200]}`, flex: 1, minWidth: '140px', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', boxShadow: active ? `0 0 0 2px ${colors.primaryLight}` : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: '28px', fontWeight: '700', color: colors.gray[900] }}>{value}</div><div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>{label}</div></div>
            <div style={{ fontSize: '28px' }}>{icon}</div>
        </div>
    </div>
);

const parseExcel = async (file) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];
    const data = [], headers = [];
    worksheet.eachRow((row, rowNum) => {
        if (rowNum === 1) row.eachCell((cell, colNum) => { headers[colNum - 1] = cell.value?.toString()?.trim() || ''; });
        else { const rowData = {}; let hasData = false; row.eachCell((cell, colNum) => { if (headers[colNum - 1]) { const value = cell.value; if (value !== null && value !== undefined && value !== '') { rowData[headers[colNum - 1]] = typeof value === 'object' && value.text ? value.text : String(value).trim(); hasData = true; } } }); if (hasData) data.push(rowData); }
    });
    return data;
};

const downloadExcel = async (data, filename, columns) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    const headers = columns || (data.length > 0 ? Object.keys(data[0]) : []);
    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0EA5E9' } };
    data.forEach(row => worksheet.addRow(headers.map(h => row[h] ?? '')));
    worksheet.columns.forEach(col => { col.width = 20; });
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
};

const CorporateManagement = () => {
    const router = useRouter();
    const [corporates, setCorporates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [industryFilter, setIndustryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const itemsPerPage = 20;

    const [industryTypes, setIndustryTypes] = useState([]);
    const [corporateTypes, setCorporateTypes] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, pipeline: 0, expiring: 0 });

    const [showForm, setShowForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSchemaModal, setShowSchemaModal] = useState(false);
    const [showAddFieldModal, setShowAddFieldModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAIValidateModal, setShowAIValidateModal] = useState(false);

    const [selectedCorporate, setSelectedCorporate] = useState(null);
    const [formData, setFormData] = useState({});
    const [savingRecord, setSavingRecord] = useState(false);
    const [uploadingBulk, setUploadingBulk] = useState(false);
    const [tableStructure, setTableStructure] = useState(null);
    const [newField, setNewField] = useState({ column_name: '', data_type: 'text', is_nullable: true, default_value: '', description: '' });
    const [aiValidating, setAiValidating] = useState(false);
    const [validationWarnings, setValidationWarnings] = useState([]);
    const [adminPassword, setAdminPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const getToken = () => { if (typeof window === 'undefined') return null; return document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token'); };
    const getAuthHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

    const fetchLookups = async () => { try { const response = await axios.get(`${LOOKUP_API}/all`); if (response.data.success) { setIndustryTypes(response.data.data?.industryTypes || []); setCorporateTypes(response.data.data?.corporateTypes || []); } } catch (err) { console.error('Failed to fetch lookups:', err); } };

    const fetchCorporates = async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, limit: itemsPerPage, search: searchQuery, sort_by: 'created_at', sort_order: 'desc' };
            if (statusFilter) params.status = statusFilter;
            if (industryFilter) params.industry_type = industryFilter;
            if (activeTab === 'active') params.status = 'ACTIVE';
            if (activeTab === 'pipeline') params.status = 'INACTIVE';
            if (activeTab === 'expiring') params.contract_expiring_days = 90;
            const response = await axios.get(CORPORATES_API, { headers: getAuthHeaders(), params });
            if (response.data.success) { setCorporates(response.data.data || []); setTotalRecords(response.data.pagination?.total || 0); }
        } catch (err) { console.error('Error fetching corporates:', err); setToast({ message: 'Failed to fetch corporates', type: 'error' }); } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try {
            const [allRes, activeRes, pipelineRes, expiringRes] = await Promise.all([
                axios.get(CORPORATES_API, { headers: getAuthHeaders(), params: { limit: 1 } }),
                axios.get(CORPORATES_API, { headers: getAuthHeaders(), params: { limit: 1, status: 'ACTIVE' } }),
                axios.get(CORPORATES_API, { headers: getAuthHeaders(), params: { limit: 1, status: 'INACTIVE' } }),
                axios.get(CORPORATES_API, { headers: getAuthHeaders(), params: { limit: 1, contract_expiring_days: 90 } })
            ]);
            setStats({ total: allRes.data.pagination?.total || 0, active: activeRes.data.pagination?.total || 0, pipeline: pipelineRes.data.pagination?.total || 0, expiring: expiringRes.data.pagination?.total || 0 });
        } catch (err) { console.error('Error fetching stats:', err); }
    };

    const fetchSchema = async () => { try { const response = await axios.get(`${MASTERS_API}/tenants/structure`, { headers: getAuthHeaders() }); if (response.data.success) { setTableStructure(response.data); setShowSchemaModal(true); } } catch (err) { setToast({ message: 'Failed to fetch schema', type: 'error' }); } };

    const handleAddField = async () => {
        try {
            if (!newField.column_name) { setToast({ message: 'Column name is required', type: 'error' }); return; }
            const response = await axios.post(`${MASTERS_API}/tenants/add-field`, newField, { headers: getAuthHeaders() });
            if (response.data.success) { setToast({ message: response.data.message, type: 'success' }); setShowAddFieldModal(false); setNewField({ column_name: '', data_type: 'text', is_nullable: true, default_value: '', description: '' }); fetchSchema(); }
            else if (response.data.sql) { setToast({ message: 'Run SQL manually', type: 'warning' }); alert(`Run this SQL:\n\n${response.data.sql}`); }
        } catch (err) { setToast({ message: err.response?.data?.message || 'Failed to add field', type: 'error' }); }
    };

    const handleAIValidateClick = () => { setAdminPassword(''); setPasswordError(''); setShowPasswordModal(true); };

    const handlePasswordSubmit = async () => {
        try {
            setPasswordError('');
            const verifyResponse = await axios.post(`${AUTH_API}/verify-password`, { password: adminPassword }, { headers: getAuthHeaders() });
            if (!verifyResponse.data.success) { setPasswordError('Invalid password'); return; }
            setShowPasswordModal(false);
            setAiValidating(true);
            const response = await axios.post(`${MASTERS_API}/tenants/validate-all`, {}, { headers: getAuthHeaders() });
            if (response.data.success) { setValidationWarnings(response.data.warnings || []); setShowAIValidateModal(true); }
        } catch (err) {
            if (err.response?.status === 401 || err.response?.data?.message?.includes('password')) { setPasswordError('Invalid password'); }
            else { setShowPasswordModal(false); setToast({ message: 'AI validation failed', type: 'error' }); }
        } finally { setAiValidating(false); }
    };

    useEffect(() => { fetchLookups(); fetchStats(); }, []);
    useEffect(() => { fetchCorporates(1); setCurrentPage(1); }, [activeTab, statusFilter, industryFilter]);
    useEffect(() => { const timer = setTimeout(() => { setCurrentPage(1); fetchCorporates(1); }, 300); return () => clearTimeout(timer); }, [searchQuery]);

    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    const handleAdd = () => { setSelectedCorporate(null); setFormData({ tenant_code: '', subdomain: '', corporate_legal_name: '', corporate_type: '', industry_type: '', country: 'India', contract_start_date: '', contract_end_date: '', contract_value: '', internal_notes: '' }); setShowForm(true); };
    const handleView = (corporate) => { setSelectedCorporate(corporate); setShowViewModal(true); };
    const handleEdit = (corporate) => { setSelectedCorporate(corporate); setFormData({ tenant_code: corporate.tenant_code || '', subdomain: corporate.subdomain || '', corporate_legal_name: corporate.corporate_legal_name || '', corporate_type: corporate.corporate_type || '', industry_type: corporate.industry_type || '', country: corporate.country || 'India', contract_start_date: corporate.contract_start_date || '', contract_end_date: corporate.contract_end_date || '', contract_value: corporate.contract_value || '', internal_notes: corporate.internal_notes || '', status: corporate.status || 'ACTIVE' }); setShowForm(true); };
    const handleDeleteClick = (corporate) => { setSelectedCorporate(corporate); setShowDeleteModal(true); };

    const handleSave = async () => {
        try {
            setSavingRecord(true);
            if (selectedCorporate) {
                const response = await axios.put(`${CORPORATES_API}/${selectedCorporate.tenant_id}`, formData, { headers: getAuthHeaders() });
                if (response.data.success) { setToast({ message: 'Corporate updated successfully!', type: 'success' }); setShowForm(false); fetchCorporates(currentPage); fetchStats(); }
            } else {
                const response = await axios.post(CORPORATES_API, formData, { headers: getAuthHeaders() });
                if (response.data.success) { setToast({ message: 'Corporate created successfully!', type: 'success' }); setShowForm(false); fetchCorporates(1); fetchStats(); }
            }
        } catch (err) { setToast({ message: err.response?.data?.message || 'Failed to save', type: 'error' }); } finally { setSavingRecord(false); }
    };

    const handleDeleteConfirm = async () => { try { await axios.delete(`${CORPORATES_API}/${selectedCorporate.tenant_id}`, { headers: getAuthHeaders() }); setToast({ message: 'Corporate deleted successfully!', type: 'success' }); setShowDeleteModal(false); fetchCorporates(currentPage); fetchStats(); } catch (err) { setToast({ message: err.response?.data?.message || 'Failed to delete', type: 'error' }); } };

    const handleDownloadTemplate = async () => { const templateColumns = ['tenant_code', 'subdomain', 'corporate_legal_name', 'corporate_type', 'industry_type', 'country', 'status']; const sampleRow = {}; templateColumns.forEach(col => { sampleRow[col] = ''; }); await downloadExcel([sampleRow], 'corporates_template.xlsx', templateColumns); setToast({ message: 'Template downloaded!', type: 'success' }); };

    const handleDownloadData = async () => { try { setLoading(true); const response = await axios.get(CORPORATES_API, { headers: getAuthHeaders(), params: { limit: 10000 } }); if (response.data.success && response.data.data) { await downloadExcel(response.data.data, `corporates_data_${new Date().toISOString().split('T')[0]}.xlsx`); setToast({ message: `Downloaded ${response.data.data.length} records!`, type: 'success' }); } } catch (err) { setToast({ message: 'Failed to download data', type: 'error' }); } finally { setLoading(false); } };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setUploadingBulk(true); setShowUploadModal(false);
        try {
            const jsonData = await parseExcel(file);
            if (!jsonData.length) { setToast({ message: 'File is empty', type: 'error' }); setUploadingBulk(false); return; }
            let success = 0, failed = 0;
            for (const row of jsonData) { try { await axios.post(CORPORATES_API, row, { headers: getAuthHeaders() }); success++; } catch (err) { failed++; } }
            setToast({ message: `Uploaded ${success} of ${jsonData.length} corporates`, type: failed > 0 ? 'warning' : 'success' });
            fetchCorporates(1); fetchStats();
        } catch (err) { setToast({ message: 'Upload failed', type: 'error' }); } finally { setUploadingBulk(false); e.target.value = ''; }
    };

    const openPortal = (subdomain) => { window.open(`https://${subdomain}.benefitnest.space`, '_blank'); };
    const renderHealthBadge = (score) => { if (score >= 80) return <Badge variant="success">{score}</Badge>; if (score >= 60) return <Badge variant="warning">{score}</Badge>; return <Badge variant="danger">{score}</Badge>; };
    const renderStatusBadge = (status) => { const variants = { 'ACTIVE': 'success', 'INACTIVE': 'default', 'ON_HOLD': 'warning', 'SUSPENDED': 'danger' }; return <Badge variant={variants[status] || 'default'}>{status}</Badge>; };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.gray[50] }}>
            <header style={{ backgroundColor: 'white', borderBottom: `1px solid ${colors.gray[200]}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '28px' }}>📦</span><span style={{ fontSize: '20px', fontWeight: '700', color: colors.gray[900] }}>BenefitNest</span></div>
                    <button onClick={() => router.push('/admin/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.gray[600], background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>← Dashboard</button>
                </div>
                <Button variant="danger" icon="🚪" onClick={() => { document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; localStorage.removeItem('admin_token'); router.push('/admin/login'); }}>Logout</Button>
            </header>

            <main style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div><h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.gray[900], margin: 0 }}>Corporate Management</h1><p style={{ color: colors.gray[500], marginTop: '4px' }}>Manage corporate clients and portals</p></div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Button variant="danger" icon="📤" onClick={() => setShowUploadModal(true)} loading={uploadingBulk}>Bulk Upload</Button>
                        <Button variant="primary" icon="➕" onClick={handleAdd}>Add New</Button>
                        <Button variant="outline" icon="📥" onClick={handleDownloadTemplate}>Template</Button>
                        <Button variant="cyan" icon="📊" onClick={handleDownloadData}>Download</Button>
                        <Button variant="info" icon="🤖" onClick={handleAIValidateClick} loading={aiValidating}>AI Validate</Button>
                        <Button variant="warning" icon="➕" onClick={() => setShowAddFieldModal(true)}>Add Field</Button>
                        <Button variant="outline" icon="🗂️" onClick={fetchSchema}>Schema</Button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <StatsCard value={stats.total} label="Total" icon="🏢" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                    <StatsCard value={stats.active} label="Active" icon="✅" active={activeTab === 'active'} onClick={() => setActiveTab('active')} />
                    <StatsCard value={stats.pipeline} label="Pipeline" icon="🚀" active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} />
                    <StatsCard value={stats.expiring} label="Expiring" icon="⏰" active={activeTab === 'expiring'} onClick={() => setActiveTab('expiring')} />
                </div>

                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}`, paddingBottom: '0' }}>
                    {[{ key: 'all', label: 'All', icon: '📋', count: stats.total }, { key: 'active', label: 'Active', icon: '✅', count: stats.active }, { key: 'pipeline', label: 'Pipeline', icon: '🚀', count: stats.pipeline }, { key: 'expiring', label: 'Expiring', icon: '⏰', count: stats.expiring }].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', color: activeTab === tab.key ? colors.primary : colors.gray[600], backgroundColor: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === tab.key ? colors.primary : 'transparent'}`, cursor: 'pointer', marginBottom: '-1px' }}>
                            <span>{tab.icon}</span>{tab.label}<span style={{ backgroundColor: activeTab === tab.key ? colors.primaryLight : colors.gray[100], padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', border: `1px solid ${colors.gray[200]}`, display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}><input type="text" placeholder="Search by name, code, subdomain, industry, contact..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }} /></div>
                    <div style={{ minWidth: '150px' }}><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}><option value="">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="ON_HOLD">On Hold</option><option value="SUSPENDED">Suspended</option></select></div>
                    <div style={{ minWidth: '200px' }}><select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}><option value="">All Industries</option>{industryTypes.map(ind => <option key={ind.id || ind.code} value={ind.name}>{ind.name}</option>)}</select></div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${colors.gray[200]}`, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr style={{ backgroundColor: colors.gray[50] }}><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Logo</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Code</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Corporate</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Industry</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Status</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Health</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Portal</th><th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Actions</th></tr></thead>
                            <tbody>
                                {loading ? <tr><td colSpan="8" style={{ padding: '60px', textAlign: 'center' }}><div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div><div style={{ color: colors.gray[500] }}>Loading...</div></td></tr>
                                : corporates.length === 0 ? <tr><td colSpan="8" style={{ padding: '60px', textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div><div style={{ color: colors.gray[500] }}>No corporates found</div></td></tr>
                                : corporates.map(corp => (
                                    <tr key={corp.tenant_id} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}>
                                        <td style={{ padding: '12px 16px' }}><div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: colors.gray[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{corp.branding_config?.logo_url ? <img src={corp.branding_config.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} /> : '🏢'}</div></td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: colors.gray[900] }}>{corp.tenant_code}</td>
                                        <td style={{ padding: '12px 16px' }}><div style={{ fontSize: '14px', fontWeight: '500', color: colors.gray[900] }}>{corp.corporate_legal_name}</div><div style={{ fontSize: '12px', color: colors.gray[500] }}>{corp.subdomain}.benefitnest.space</div></td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px', color: colors.gray[600] }}>{corp.industry_type || '—'}</td>
                                        <td style={{ padding: '12px 16px' }}>{renderStatusBadge(corp.status)}</td>
                                        <td style={{ padding: '12px 16px' }}>{renderHealthBadge(corp.health_score || 100)}</td>
                                        <td style={{ padding: '12px 16px' }}>{corp.subdomain && <Button size="sm" variant="outline" icon="🔗" onClick={() => openPortal(corp.subdomain)}>Open</Button>}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}><div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}><Button size="sm" variant="outline" icon="👁️" onClick={() => handleView(corp)}>View</Button><Button size="sm" variant="cyan" icon="✏️" onClick={() => handleEdit(corp)}>Edit</Button><Button size="sm" variant="danger" icon="🗑️" onClick={() => handleDeleteClick(corp)}>Delete</Button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.gray[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '14px', color: colors.gray[600] }}>Page {currentPage} of {totalPages} ({totalRecords} total)</span><div style={{ display: 'flex', gap: '8px' }}><Button variant="outline" size="sm" onClick={() => { const p = Math.max(1, currentPage - 1); setCurrentPage(p); fetchCorporates(p); }} disabled={currentPage === 1}>← Prev</Button><Button variant="outline" size="sm" onClick={() => { const p = Math.min(totalPages, currentPage + 1); setCurrentPage(p); fetchCorporates(p); }} disabled={currentPage === totalPages}>Next →</Button></div></div>}
                </div>
            </main>

            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Corporate Details" icon="👁️" size="lg">
                {selectedCorporate && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>{Object.entries(selectedCorporate).map(([key, value]) => <div key={key} style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px' }}><div style={{ fontSize: '11px', fontWeight: '600', color: colors.gray[500], textTransform: 'uppercase', marginBottom: '4px' }}>{key.replace(/_/g, ' ')}</div><div style={{ fontSize: '14px', color: colors.gray[900], wordBreak: 'break-word' }}>{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '—')}</div></div>)}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button></div>
            </Modal>

            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={selectedCorporate ? 'Edit Corporate' : 'Add Corporate'} icon={selectedCorporate ? '✏️' : '➕'} size="lg">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <Input label="Corporate Code" required value={formData.tenant_code || ''} onChange={(e) => setFormData({ ...formData, tenant_code: e.target.value.toUpperCase() })} placeholder="e.g., CORP001" disabled={!!selectedCorporate} />
                    <Input label="Subdomain" required value={formData.subdomain || ''} onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })} placeholder="e.g., acmecorp" disabled={!!selectedCorporate} />
                    <Input label="Corporate Legal Name" required value={formData.corporate_legal_name || ''} onChange={(e) => setFormData({ ...formData, corporate_legal_name: e.target.value })} placeholder="Full legal name" />
                    <Select label="Corporate Type" options={corporateTypes.map(t => ({ value: t.name, label: t.name }))} value={formData.corporate_type || ''} onChange={(e) => setFormData({ ...formData, corporate_type: e.target.value })} />
                    <Select label="Industry Type" options={industryTypes.map(t => ({ value: t.name, label: t.name }))} value={formData.industry_type || ''} onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })} />
                    <Select label="Country" options={[{ value: 'India', label: 'India' }, { value: 'USA', label: 'USA' }, { value: 'UK', label: 'UK' }, { value: 'UAE', label: 'UAE' }]} value={formData.country || 'India'} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                    <Input label="Contract Start Date" type="date" value={formData.contract_start_date || ''} onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })} />
                    <Input label="Contract End Date" type="date" value={formData.contract_end_date || ''} onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })} />
                    <Input label="Contract Value" type="number" value={formData.contract_value || ''} onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })} placeholder="Annual contract value" />
                    {selectedCorporate && <Select label="Status" options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'ON_HOLD', label: 'On Hold' }]} value={formData.status || 'ACTIVE'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />}
                </div>
                <TextArea label="Internal Notes" value={formData.internal_notes || ''} onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })} placeholder="Any internal notes..." style={{ marginTop: '16px' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button variant="primary" onClick={handleSave} disabled={savingRecord} loading={savingRecord}>{selectedCorporate ? 'Update' : 'Create'}</Button></div>
            </Modal>

            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Bulk Upload Corporates" icon="📤" size="md">
                <p style={{ color: colors.gray[600], marginBottom: '20px' }}>Upload an Excel file with corporate data. Download template first.</p>
                <div style={{ backgroundColor: colors.cyanLight, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><div style={{ fontWeight: '600', color: colors.cyan }}>📥 Download Template</div><div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>Get the Excel template with required columns</div></div><Button variant="cyan" size="sm" onClick={handleDownloadTemplate}>Download</Button></div></div>
                <input type="file" accept=".xlsx,.xls" onChange={handleBulkUpload} style={{ display: 'none' }} id="bulk-upload-corporates" />
                <label htmlFor="bulk-upload-corporates" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', border: `2px dashed ${colors.gray[300]}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: colors.gray[50] }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div><div style={{ fontWeight: '600', color: colors.gray[700] }}>Click to select file</div><div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>Supports .xlsx, .xls files</div></label>
            </Modal>

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete" icon="⚠️" size="sm">
                <p style={{ color: colors.gray[600], marginBottom: '20px' }}>Are you sure you want to delete <strong>{selectedCorporate?.corporate_legal_name}</strong>? This action cannot be undone.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}><Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button><Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button></div>
            </Modal>

            <Modal isOpen={showSchemaModal} onClose={() => setShowSchemaModal(false)} title="Tenants Table Schema" icon="🗂️" size="lg">
                {tableStructure && <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ padding: '16px', backgroundColor: colors.primaryLight, borderRadius: '8px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>{tableStructure.columns?.length || 0}</div><div style={{ fontSize: '12px', color: colors.gray[600] }}>Columns</div></div>
                        <div style={{ padding: '16px', backgroundColor: colors.successLight, borderRadius: '8px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: colors.success }}>{tableStructure.record_count || 0}</div><div style={{ fontSize: '12px', color: colors.gray[600] }}>Records</div></div>
                        <div style={{ padding: '16px', backgroundColor: colors.cyanLight, borderRadius: '8px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: colors.cyan }}>{tableStructure.primary_key || 'tenant_id'}</div><div style={{ fontSize: '12px', color: colors.gray[600] }}>Primary Key</div></div>
                    </div>
                    <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead style={{ backgroundColor: colors.gray[50] }}><tr><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Column</th><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Type</th><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Nullable</th><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Default</th></tr></thead><tbody>{tableStructure.columns?.map(col => <tr key={col.column_name} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}><td style={{ padding: '10px 12px', fontSize: '14px', fontWeight: '500' }}>{col.column_name}</td><td style={{ padding: '10px 12px', fontSize: '14px' }}><Badge variant="cyan">{col.data_type}</Badge></td><td style={{ padding: '10px 12px', fontSize: '14px' }}>{col.is_nullable === 'YES' ? '✅' : '❌'}</td><td style={{ padding: '10px 12px', fontSize: '13px', color: colors.gray[500] }}>{col.column_default || '—'}</td></tr>)}</tbody></table></div>
                </>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowSchemaModal(false)}>Close</Button></div>
            </Modal>

            <Modal isOpen={showAddFieldModal} onClose={() => setShowAddFieldModal(false)} title="Add Field to Tenants Table" icon="➕" size="md">
                <Input label="Column Name" required value={newField.column_name} onChange={(e) => setNewField({ ...newField, column_name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} placeholder="e.g., phone_number" />
                <Select label="Data Type" required value={newField.data_type} onChange={(e) => setNewField({ ...newField, data_type: e.target.value })} options={[{ value: 'text', label: 'Text' }, { value: 'string', label: 'String (255)' }, { value: 'number', label: 'Number' }, { value: 'decimal', label: 'Decimal' }, { value: 'boolean', label: 'Boolean' }, { value: 'date', label: 'Date' }, { value: 'datetime', label: 'DateTime' }, { value: 'uuid', label: 'UUID' }, { value: 'json', label: 'JSON' }]} />
                <Checkbox label="Allow NULL values" checked={newField.is_nullable} onChange={(e) => setNewField({ ...newField, is_nullable: e.target.checked })} />
                <Input label="Default Value" value={newField.default_value} onChange={(e) => setNewField({ ...newField, default_value: e.target.value })} />
                <TextArea label="Description" value={newField.description} onChange={(e) => setNewField({ ...newField, description: e.target.value })} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowAddFieldModal(false)}>Cancel</Button><Button variant="warning" onClick={handleAddField}>Add Field</Button></div>
            </Modal>

            <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="AI Validation - Authentication Required" icon="🔐" size="md">
                <div style={{ backgroundColor: colors.dangerLight, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ fontWeight: '600', color: colors.danger, marginBottom: '8px' }}>⚠️ Important Warnings</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: colors.gray[700], fontSize: '14px' }}>
                        <li style={{ marginBottom: '6px' }}>Validating large tables can <strong>exceed API rate limits</strong></li>
                        <li style={{ marginBottom: '6px' }}>AI server may <strong>block requests</strong> if overused</li>
                        <li style={{ marginBottom: '6px' }}>For large tables, validation results may be <strong>incomplete or inaccurate</strong></li>
                        <li style={{ marginBottom: '6px' }}><strong>Recommended:</strong> Use AI validation on Add/Edit for single records</li>
                    </ul>
                </div>
                <div style={{ backgroundColor: colors.primaryLight, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}><div style={{ fontSize: '14px', color: colors.primary }}><strong>Table:</strong> tenants (Corporates)<br/><strong>Records to validate:</strong> {stats.total}</div></div>
                <Input label="Enter Admin Password to Proceed" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Your admin login password" />
                {passwordError && <div style={{ color: colors.danger, fontSize: '13px', marginTop: '-10px', marginBottom: '16px' }}>{passwordError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}><Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button><Button variant="danger" onClick={handlePasswordSubmit} disabled={!adminPassword || aiValidating} loading={aiValidating}>Validate All Records</Button></div>
            </Modal>

            <Modal isOpen={showAIValidateModal} onClose={() => setShowAIValidateModal(false)} title="AI Validation Results" icon="🤖" size="lg">
                {validationWarnings.length === 0 ? <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div><h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.success }}>All Records Valid!</h3><p style={{ color: colors.gray[500] }}>No issues found in the corporate records.</p></div>
                : <><div style={{ backgroundColor: colors.warningLight, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}><div style={{ fontWeight: '600', color: colors.warning }}>Found {validationWarnings.length} potential issues</div></div><div style={{ maxHeight: '400px', overflowY: 'auto' }}>{validationWarnings.map((w, i) => <div key={i} style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px', marginBottom: '8px', borderLeft: `4px solid ${w.severity === 'error' ? colors.danger : colors.warning}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><Badge variant={w.severity === 'error' ? 'danger' : 'warning'}>{w.severity || 'warning'}</Badge><strong>Row {w.row} - {w.field}</strong></div><p style={{ margin: '4px 0 0', color: colors.gray[700] }}>{w.message}</p>{w.suggested_value && <div style={{ fontSize: '12px', color: colors.success, marginTop: '4px' }}>💡 Suggested: {w.suggested_value}</div>}</div>)}</div></>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowAIValidateModal(false)}>Close</Button></div>
            </Modal>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } * { box-sizing: border-box; margin: 0; }`}</style>
        </div>
    );
};

export default CorporateManagement;
