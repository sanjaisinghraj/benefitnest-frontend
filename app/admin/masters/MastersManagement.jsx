'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// =====================================================
// CONFIGURATION
// =====================================================
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://benefitnest-backend.onrender.com';
const MASTERS_API = `${API_URL}/api/admin/masters`;

// =====================================================
// COLORS
// =====================================================
const colors = {
    primary: '#2563eb', primaryHover: '#1d4ed8', primaryLight: '#dbeafe',
    success: '#10b981', successHover: '#059669', successLight: '#d1fae5',
    danger: '#ef4444', dangerHover: '#dc2626', dangerLight: '#fee2e2',
    warning: '#f59e0b', warningHover: '#d97706', warningLight: '#fef3c7',
    info: '#8b5cf6', infoHover: '#7c3aed', infoLight: '#ede9fe',
    cyan: '#0ea5e9', cyanLight: '#e0f2fe',
    gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' }
};

// Table display names
const TABLE_LABELS = {
    account_managers: 'Account Managers', admins: 'Admins', brokers: 'Brokers',
    corporate_types: 'Corporate Types', icd_codes: 'ICD Codes', industry_types: 'Industry Types',
    insurers: 'Insurers', insurer_locations: 'Insurer Locations', job_levels: 'Job Levels',
    tpas: 'TPAs', tpa_locations: 'TPA Locations', policy_type: 'Policy Types',
    policy_configuration: 'Policy Configuration', regulatory_authorities: 'Regulatory Authorities',
    masters_audit_log: 'Audit Logs', tenants: 'Corporates/Tenants'
};

// =====================================================
// COMPONENTS
// =====================================================
const Modal = ({ isOpen, onClose, title, icon, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeStyles = { sm: '440px', md: '600px', lg: '900px', xl: '1100px' };
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: sizeStyles[size], maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {icon && <span style={{ fontSize: '22px' }}>{icon}</span>}
                        <h2 style={{ fontSize: '17px', fontWeight: '700', color: colors.gray[900], margin: 0 }}>{title}</h2>
                    </div>
                    <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: colors.gray[100], cursor: 'pointer', fontSize: '18px' }}>×</button>
                </div>
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>{children}</div>
            </div>
        </div>
    );
};

const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, disabled, loading, style = {} }) => {
    const variants = {
        primary: { bg: colors.primary, hoverBg: colors.primaryHover, color: 'white' },
        success: { bg: colors.success, hoverBg: colors.successHover, color: 'white' },
        danger: { bg: colors.danger, hoverBg: colors.dangerHover, color: 'white' },
        warning: { bg: colors.warning, hoverBg: colors.warningHover, color: 'white' },
        cyan: { bg: colors.cyan, hoverBg: '#0284c7', color: 'white' },
        info: { bg: colors.info, hoverBg: colors.infoHover, color: 'white' },
        outline: { bg: 'white', hoverBg: colors.gray[50], color: colors.gray[700], border: `1px solid ${colors.gray[300]}` },
        ghost: { bg: 'transparent', hoverBg: colors.gray[100], color: colors.gray[700] }
    };
    const sizes = { xs: { padding: '4px 8px', fontSize: '11px' }, sm: { padding: '6px 12px', fontSize: '12px' }, md: { padding: '10px 16px', fontSize: '14px' } };
    const v = variants[variant] || variants.primary;
    const s = sizes[size] || sizes.md;
    const [hover, setHover] = useState(false);
    return (
        <button onClick={onClick} disabled={disabled || loading} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: s.padding, fontSize: s.fontSize, fontWeight: '600', color: v.color, backgroundColor: hover && !disabled ? v.hoverBg : v.bg, border: v.border || 'none', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, transition: 'all 0.15s', whiteSpace: 'nowrap', ...style }}>
            {loading ? <span style={{ width: '14px', height: '14px', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : icon && <span>{icon}</span>}
            {children}
        </button>
    );
};

const Badge = ({ children, variant = 'default' }) => {
    const variants = { default: { bg: colors.gray[100], color: colors.gray[700] }, success: { bg: colors.successLight, color: '#065f46' }, danger: { bg: colors.dangerLight, color: '#991b1b' }, warning: { bg: colors.warningLight, color: '#92400e' }, info: { bg: colors.infoLight, color: '#5b21b6' }, cyan: { bg: colors.cyanLight, color: '#0369a1' } };
    const v = variants[variant] || variants.default;
    return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', backgroundColor: v.bg, color: v.color }}>{children}</span>;
};

const Input = ({ label, required, ...props }) => (
    <div style={{ marginBottom: '16px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}
        <input {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', ...props.style }} />
    </div>
);

const Select = ({ label, required, options = [], ...props }) => (
    <div style={{ marginBottom: '16px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}
        <select {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer', boxSizing: 'border-box', ...props.style }}>
            <option value="">Select {label || 'option'}</option>
            {options.map(opt => <option key={opt.value || opt.name} value={opt.value || opt.name}>{opt.label || opt.name}</option>)}
        </select>
    </div>
);

const TextArea = ({ label, required, ...props }) => (
    <div style={{ marginBottom: '16px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}
        <textarea {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', ...props.style }} />
    </div>
);

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
    const types = { success: { bg: colors.successLight, color: '#065f46', icon: '✓' }, error: { bg: colors.dangerLight, color: '#991b1b', icon: '✕' }, warning: { bg: colors.warningLight, color: '#92400e', icon: '⚠' }, info: { bg: colors.primaryLight, color: colors.primary, icon: 'ℹ' } };
    const t = types[type] || types.info;
    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: t.bg, color: t.color, padding: '14px 20px', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2000 }}>
            <span style={{ fontWeight: '700' }}>{t.icon}</span><span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.color, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
    );
};

const StatsCard = ({ value, label, icon }) => (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.gray[200]}`, flex: 1, minWidth: '140px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: '28px', fontWeight: '700', color: colors.gray[900] }}>{value}</div><div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>{label}</div></div>
            <div style={{ fontSize: '28px' }}>{icon}</div>
        </div>
    </div>
);

// Excel helpers
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

const downloadExcel = async (data, filename, columns) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    const headers = columns || (data.length > 0 ? Object.keys(data[0]) : []);
    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0EA5E9' } };
    data.forEach(row => worksheet.addRow(headers.map(h => row[h] || '')));
    worksheet.columns.forEach(col => { col.width = 20; });
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
};

// =====================================================
// MAIN COMPONENT
// =====================================================
const MastersManagement = () => {
    const router = useRouter();
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [records, setRecords] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingTables, setLoadingTables] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 20;

    const [showForm, setShowForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showAddFieldModal, setShowAddFieldModal] = useState(false);
    const [showAIValidateModal, setShowAIValidateModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formData, setFormData] = useState({});
    const [dependencies, setDependencies] = useState([]);
    const [validationWarnings, setValidationWarnings] = useState([]);
    const [uploadingBulk, setUploadingBulk] = useState(false);
    const [aiValidating, setAiValidating] = useState(false);
    const [fkOptions, setFkOptions] = useState({});
    const [pendingUploadData, setPendingUploadData] = useState(null);
    const [newField, setNewField] = useState({ column_name: '', data_type: 'text', is_nullable: true, default_value: '', description: '' });

    const getToken = () => {
        if (typeof window === 'undefined') return null;
        return document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token');
    };
    const getAuthHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

    const fetchTables = async () => {
        try {
            setLoadingTables(true);
            const response = await axios.get(`${MASTERS_API}/tables`, { headers: getAuthHeaders() });
            if (response.data.success) setTables(response.data.data || []);
        } catch (err) { setToast({ message: 'Failed to load tables', type: 'error' }); }
        finally { setLoadingTables(false); }
    };

    const fetchSchema = async (table) => {
        try {
            const response = await axios.get(`${MASTERS_API}/${table}/schema`, { headers: getAuthHeaders() });
            if (response.data.success) setColumns(response.data.columns || []);
        } catch (err) { console.error('Failed to fetch schema:', err); }
    };

    const fetchFKOptions = async (table) => {
        try {
            const response = await axios.get(`${MASTERS_API}/${table}/fk-options`, { headers: getAuthHeaders() });
            if (response.data.success) setFkOptions(response.data.options || {});
        } catch (err) { console.error('Failed to fetch FK options:', err); }
    };

    const fetchRecords = async (table, page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`${MASTERS_API}/${table}`, { headers: getAuthHeaders(), params: { page, limit: itemsPerPage, search: searchQuery } });
            if (response.data.success) { setRecords(response.data.data || []); setTotalRecords(response.data.pagination?.total || 0); }
        } catch (err) { setToast({ message: 'Failed to load records', type: 'error' }); }
        finally { setLoading(false); }
    };

    const checkDependencies = async (table, id) => {
        try {
            const response = await axios.get(`${MASTERS_API}/${table}/${id}/dependencies`, { headers: getAuthHeaders() });
            return response.data;
        } catch (err) { return { has_dependencies: false, dependencies: [] }; }
    };

    useEffect(() => { fetchTables(); }, []);
    useEffect(() => {
        if (selectedTable) { fetchSchema(selectedTable); fetchFKOptions(selectedTable); fetchRecords(selectedTable, 1); setCurrentPage(1); setSearchQuery(''); }
        else { setRecords([]); setColumns([]); setFkOptions({}); }
    }, [selectedTable]);
    useEffect(() => {
        if (selectedTable) { const timer = setTimeout(() => { setCurrentPage(1); fetchRecords(selectedTable, 1); }, 300); return () => clearTimeout(timer); }
    }, [searchQuery]);

    const displayColumns = useMemo(() => columns.filter(c => !['created_at', 'updated_at', 'created_by', 'updated_by'].includes(c.column_name)), [columns]);
    const editableColumns = useMemo(() => columns.filter(c => !['created_at', 'updated_at', 'created_by', 'updated_by'].includes(c.column_name)), [columns]);
    const primaryKeyColumn = useMemo(() => { if (columns.length === 0) return 'id'; const pkCol = columns.find(c => c.column_name === 'id' || c.column_name.endsWith('_id')); return pkCol?.column_name || 'id'; }, [columns]);

    const handleTableChange = (table) => { setSelectedTable(table); setSearchQuery(''); setRecords([]); };
    const handleAdd = () => { setSelectedRecord(null); const initialData = {}; editableColumns.forEach(col => { if (col.column_name !== primaryKeyColumn) initialData[col.column_name] = ''; }); setFormData(initialData); setShowForm(true); };
    const handleView = (record) => { setSelectedRecord(record); setShowViewModal(true); };
    const handleEdit = (record) => { setSelectedRecord(record); const data = {}; editableColumns.forEach(col => { if (col.column_name !== primaryKeyColumn) data[col.column_name] = record[col.column_name] ?? ''; }); setFormData(data); setShowForm(true); };
    const handleDeleteClick = async (record) => { setSelectedRecord(record); const depData = await checkDependencies(selectedTable, record[primaryKeyColumn]); setDependencies(depData.dependencies || []); setShowDeleteModal(true); };

    const handleSave = async (skipAI = false, ignoreWarnings = false) => {
        try {
            const payload = selectedRecord ? { updates: formData, skip_ai_validation: skipAI, ai_warnings_ignored: ignoreWarnings } : { record: formData, skip_ai_validation: skipAI, ai_warnings_ignored: ignoreWarnings };
            const url = selectedRecord ? `${MASTERS_API}/${selectedTable}/${selectedRecord[primaryKeyColumn]}` : `${MASTERS_API}/${selectedTable}`;
            const response = await axios({ method: selectedRecord ? 'PUT' : 'POST', url, data: payload, headers: getAuthHeaders() });
            if (response.data.requires_confirmation) { setValidationWarnings(response.data.validation?.warnings || []); setShowWarningModal(true); return; }
            if (response.data.success) { setToast({ message: selectedRecord ? 'Record updated!' : 'Record created!', type: 'success' }); setShowForm(false); setShowWarningModal(false); fetchRecords(selectedTable, currentPage); }
        } catch (err) { setToast({ message: err.response?.data?.message || 'Failed to save', type: 'error' }); }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${MASTERS_API}/${selectedTable}/${selectedRecord[primaryKeyColumn]}`, { headers: getAuthHeaders() });
            setToast({ message: 'Record deleted!', type: 'success' }); setShowDeleteModal(false); fetchRecords(selectedTable, currentPage);
        } catch (err) { setToast({ message: err.response?.data?.message || 'Failed to delete', type: 'error' }); }
    };

    const handleDownloadTemplate = async () => { const templateColumns = editableColumns.filter(c => c.column_name !== primaryKeyColumn).map(c => c.column_name); const sampleRow = {}; templateColumns.forEach(col => { sampleRow[col] = ''; }); await downloadExcel([sampleRow], `${selectedTable}_template.xlsx`, templateColumns); setToast({ message: 'Template downloaded!', type: 'success' }); };
    const handleDownloadData = async () => { try { setLoading(true); const response = await axios.get(`${MASTERS_API}/${selectedTable}/download/all`, { headers: getAuthHeaders() }); if (response.data.success && response.data.data) { await downloadExcel(response.data.data, `${selectedTable}_data_${new Date().toISOString().split('T')[0]}.xlsx`); setToast({ message: `Downloaded ${response.data.data.length} records!`, type: 'success' }); } } catch (err) { setToast({ message: 'Failed to download data', type: 'error' }); } finally { setLoading(false); } };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setUploadingBulk(true); setShowUploadModal(false);
        try {
            const jsonData = await parseExcel(file);
            if (!jsonData.length) { setToast({ message: 'File is empty', type: 'error' }); setUploadingBulk(false); return; }
            setPendingUploadData(jsonData);
            const response = await axios.post(`${MASTERS_API}/${selectedTable}/bulk`, { records: jsonData, skip_ai_validation: false }, { headers: getAuthHeaders() });
            if (response.data.requires_confirmation) { setValidationWarnings(response.data.validation?.warnings || []); setShowWarningModal(true); }
            else if (response.data.success) { setToast({ message: response.data.message, type: 'success' }); setPendingUploadData(null); fetchRecords(selectedTable, 1); }
        } catch (err) { setToast({ message: err.response?.data?.message || 'Upload failed', type: 'error' }); }
        finally { setUploadingBulk(false); e.target.value = ''; }
    };

    const handleBulkUploadIgnoreWarnings = async () => {
        if (!pendingUploadData) return;
        try {
            const response = await axios.post(`${MASTERS_API}/${selectedTable}/bulk`, { records: pendingUploadData, skip_ai_validation: true, ai_warnings_ignored: true }, { headers: getAuthHeaders() });
            if (response.data.success) { setToast({ message: response.data.message, type: 'success' }); setPendingUploadData(null); setShowWarningModal(false); fetchRecords(selectedTable, 1); }
        } catch (err) { setToast({ message: err.response?.data?.message || 'Upload failed', type: 'error' }); }
    };

    const handleAIValidateTable = async () => {
        try { setAiValidating(true); const response = await axios.post(`${MASTERS_API}/${selectedTable}/validate-all`, {}, { headers: getAuthHeaders() }); if (response.data.success) { setValidationWarnings(response.data.warnings || []); setShowAIValidateModal(true); } }
        catch (err) { setToast({ message: 'AI validation failed', type: 'error' }); }
        finally { setAiValidating(false); }
    };

    const handleAddField = async () => {
        try {
            if (!newField.column_name) { setToast({ message: 'Column name is required', type: 'error' }); return; }
            const response = await axios.post(`${MASTERS_API}/${selectedTable}/add-field`, newField, { headers: getAuthHeaders() });
            if (response.data.success) { setToast({ message: response.data.message, type: 'success' }); setShowAddFieldModal(false); setNewField({ column_name: '', data_type: 'text', is_nullable: true, default_value: '', description: '' }); fetchSchema(selectedTable); }
            else if (response.data.sql) { setToast({ message: 'Please run the SQL manually in Supabase', type: 'warning' }); alert(`Run this SQL in Supabase:\n\n${response.data.sql}`); }
        } catch (err) { setToast({ message: err.response?.data?.message || 'Failed to add field', type: 'error' }); }
    };

    const handleLogout = () => { localStorage.removeItem('admin_token'); document.cookie = 'admin_token=; path=/; max-age=0'; window.location.href = 'https://www.benefitnest.space'; };
    const totalPages = Math.ceil(totalRecords / itemsPerPage);
    const hasFKOptions = (columnName) => fkOptions[columnName] && fkOptions[columnName].length > 0;

    const renderFormField = (col) => {
        const columnName = col.column_name;
        const label = columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (columnName === primaryKeyColumn) return null;
        if (hasFKOptions(columnName)) return <Select key={columnName} label={label} value={formData[columnName] || ''} onChange={(e) => setFormData({ ...formData, [columnName]: e.target.value })} options={fkOptions[columnName]} />;
        if (col.data_type === 'boolean') return <div key={columnName} style={{ marginBottom: '16px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: colors.gray[700], cursor: 'pointer' }}><input type="checkbox" checked={formData[columnName] === true || formData[columnName] === 'true'} onChange={(e) => setFormData({ ...formData, [columnName]: e.target.checked })} style={{ width: '18px', height: '18px' }} />{label}</label></div>;
        if (col.data_type === 'text' || col.data_type === 'jsonb') return <TextArea key={columnName} label={label} value={formData[columnName] || ''} onChange={(e) => setFormData({ ...formData, [columnName]: e.target.value })} />;
        return <Input key={columnName} label={label} value={formData[columnName] || ''} onChange={(e) => setFormData({ ...formData, [columnName]: e.target.value })} type={col.data_type === 'integer' ? 'number' : 'text'} />;
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <header style={{ backgroundColor: 'white', borderBottom: `1px solid ${colors.gray[200]}`, position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img src="/images/marketing/logo.png" alt="BenefitNest" style={{ height: '40px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <Button variant="ghost" icon="←" onClick={() => router.push('/admin/dashboard')}>Dashboard</Button>
                    </div>
                    <Button variant="danger" icon="🚪" onClick={handleLogout}>Logout</Button>
                </div>
            </header>

            <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}><h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.gray[900], marginBottom: '4px' }}>Masters Management</h1><p style={{ color: colors.gray[500], fontSize: '14px' }}>Manage lookup tables and configurations</p></div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}><StatsCard value={tables.length} label="Master Tables" icon="📋" /><StatsCard value={totalRecords} label={selectedTable ? `${TABLE_LABELS[selectedTable] || selectedTable} Records` : 'Select a Table'} icon="📊" /></div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: `1px solid ${colors.gray[200]}` }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}><Select label="Select Master Table" value={selectedTable} onChange={(e) => handleTableChange(e.target.value)} options={tables.map(t => ({ value: t.name, label: `${TABLE_LABELS[t.name] || t.name} (${t.count})` }))} style={{ marginBottom: 0 }} /></div>
                        {selectedTable && (<>
                            <Button variant="cyan" icon="+" onClick={handleAdd}>Add New</Button>
                            <Button variant="success" icon="📤" onClick={() => setShowUploadModal(true)} disabled={uploadingBulk}>{uploadingBulk ? 'Uploading...' : 'Bulk Upload'}</Button>
                            <Button variant="outline" icon="📥" onClick={handleDownloadTemplate}>Download Template</Button>
                            <Button variant="primary" icon="📥" onClick={handleDownloadData} disabled={loading}>Download Data</Button>
                            <Button variant="info" icon="🤖" onClick={handleAIValidateTable} disabled={aiValidating}>{aiValidating ? 'Validating...' : 'AI Validate'}</Button>
                            <Button variant="warning" icon="➕" onClick={() => setShowAddFieldModal(true)}>Add Field</Button>
                        </>)}
                    </div>
                </div>

                {selectedTable && (
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.gray[200]}` }}><input type="text" placeholder="Search records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }} /></div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: colors.gray[50] }}><tr>{displayColumns.slice(0, 6).map(col => <th key={col.column_name} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>{col.column_name.replace(/_/g, ' ')}</th>)}<th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Actions</th></tr></thead>
                                <tbody>
                                    {loading ? <tr><td colSpan={displayColumns.length + 1} style={{ padding: '60px', textAlign: 'center', color: colors.gray[500] }}>Loading...</td></tr>
                                    : records.length === 0 ? <tr><td colSpan={displayColumns.length + 1} style={{ padding: '60px', textAlign: 'center', color: colors.gray[500] }}>No records found</td></tr>
                                    : records.map((record, idx) => (
                                        <tr key={record[primaryKeyColumn] || idx} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}>
                                            {displayColumns.slice(0, 6).map(col => <td key={col.column_name} style={{ padding: '12px 16px', fontSize: '14px', color: colors.gray[700] }}>{col.column_name === 'is_active' || col.data_type === 'boolean' ? <Badge variant={record[col.column_name] ? 'success' : 'danger'}>{record[col.column_name] ? 'Active' : 'Inactive'}</Badge> : String(record[col.column_name] ?? '—').substring(0, 50)}</td>)}
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}><div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}><Button size="sm" variant="outline" icon="👁️" onClick={() => handleView(record)}>View</Button><Button size="sm" variant="cyan" icon="✏️" onClick={() => handleEdit(record)}>Edit</Button><Button size="sm" variant="danger" icon="🗑️" onClick={() => handleDeleteClick(record)}>Delete</Button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.gray[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '14px', color: colors.gray[600] }}>Page {currentPage} of {totalPages} ({totalRecords} total)</span><div style={{ display: 'flex', gap: '8px' }}><Button variant="outline" size="sm" onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); fetchRecords(selectedTable, currentPage - 1); }} disabled={currentPage === 1}>← Prev</Button><Button variant="outline" size="sm" onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); fetchRecords(selectedTable, currentPage + 1); }} disabled={currentPage === totalPages}>Next →</Button></div></div>}
                    </div>
                )}
                {!selectedTable && <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '80px 40px', textAlign: 'center', border: `1px solid ${colors.gray[200]}` }}><div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div><h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.gray[900], marginBottom: '8px' }}>Select a Master Table</h3><p style={{ color: colors.gray[500] }}>Choose a table from the dropdown above to view and manage records</p></div>}
            </main>

            {/* View Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={`View ${TABLE_LABELS[selectedTable] || selectedTable}`} icon="👁️" size="lg">
                {selectedRecord && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>{columns.map(col => <div key={col.column_name} style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px' }}><div style={{ fontSize: '11px', fontWeight: '600', color: colors.gray[500], textTransform: 'uppercase', marginBottom: '4px' }}>{col.column_name.replace(/_/g, ' ')}</div><div style={{ fontSize: '14px', color: colors.gray[900], wordBreak: 'break-word' }}>{col.data_type === 'boolean' ? (selectedRecord[col.column_name] ? '✅ Yes' : '❌ No') : String(selectedRecord[col.column_name] ?? '—')}</div></div>)}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button></div>
            </Modal>

            {/* Add/Edit Modal */}
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={selectedRecord ? `Edit ${TABLE_LABELS[selectedTable] || selectedTable}` : `Add ${TABLE_LABELS[selectedTable] || selectedTable}`} icon={selectedRecord ? '✏️' : '➕'} size="lg">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>{editableColumns.map(col => renderFormField(col))}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button variant="ghost" onClick={() => handleSave(true)}>Save (Skip AI)</Button><Button variant="cyan" onClick={() => handleSave(false)}>{selectedRecord ? 'Update' : 'Create'}</Button></div>
            </Modal>

            {/* Upload Modal */}
            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Bulk Upload" icon="📤" size="md">
                <p style={{ color: colors.gray[600], marginBottom: '20px' }}>Upload an Excel file with {TABLE_LABELS[selectedTable] || selectedTable} records.</p>
                <div style={{ backgroundColor: colors.cyanLight, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><div style={{ fontWeight: '600', color: colors.cyan }}>📥 Download Template</div><div style={{ fontSize: '13px', color: colors.gray[600] }}>Get the template with all required columns</div></div><Button variant="cyan" size="sm" onClick={handleDownloadTemplate}>Download</Button></div></div>
                <input type="file" accept=".xlsx,.xls" onChange={handleBulkUpload} style={{ display: 'none' }} id="bulk-upload" />
                <label htmlFor="bulk-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', border: `2px dashed ${colors.gray[300]}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: colors.gray[50] }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div><div style={{ fontWeight: '600', color: colors.gray[700] }}>Click to select file</div><div style={{ fontSize: '13px', color: colors.gray[500] }}>Supports .xlsx, .xls</div></label>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete" icon="⚠️" size="sm">
                <p style={{ color: colors.gray[600], marginBottom: '20px' }}>Are you sure you want to delete this record?</p>
                {dependencies.length > 0 && <div style={{ backgroundColor: colors.warningLight, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}><div style={{ fontWeight: '600', color: colors.warning, marginBottom: '8px' }}>⚠️ Warning: Dependencies Found</div><ul style={{ margin: 0, paddingLeft: '20px', color: colors.gray[700], fontSize: '14px' }}>{dependencies.map((dep, i) => <li key={i}>{dep.count} records in {dep.table}</li>)}</ul></div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}><Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button><Button variant="danger" onClick={handleDeleteConfirm}>Delete Anyway</Button></div>
            </Modal>

            {/* AI Warning Modal */}
            <Modal isOpen={showWarningModal} onClose={() => { setShowWarningModal(false); setPendingUploadData(null); }} title="AI Validation Warnings" icon="🤖" size="lg">
                <div style={{ backgroundColor: colors.warningLight, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}><div style={{ fontWeight: '600', color: colors.warning, marginBottom: '12px' }}>⚠️ AI detected potential issues:</div><div style={{ maxHeight: '300px', overflowY: 'auto' }}>{validationWarnings.map((w, i) => <div key={i} style={{ padding: '8px 12px', backgroundColor: 'white', borderRadius: '6px', marginBottom: '8px', fontSize: '14px' }}><span style={{ fontWeight: '600', color: colors.gray[900] }}>Row {w.row}, {w.field}: </span><span style={{ color: colors.gray[700] }}>{w.message}</span>{w.verification_url && <a href={w.verification_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '12px', color: colors.primary, marginTop: '4px' }}>🔗 Verify here</a>}</div>)}</div></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}><Button variant="outline" onClick={() => { setShowWarningModal(false); setPendingUploadData(null); }}>Cancel</Button><Button variant="warning" onClick={() => { if (pendingUploadData) handleBulkUploadIgnoreWarnings(); else handleSave(false, true); }}>Proceed Anyway</Button></div>
            </Modal>

            {/* AI Validate Results Modal */}
            <Modal isOpen={showAIValidateModal} onClose={() => setShowAIValidateModal(false)} title="AI Validation Results" icon="🤖" size="lg">
                {validationWarnings.length === 0 ? <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div><h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.success, marginBottom: '8px' }}>All Records Valid!</h3><p style={{ color: colors.gray[500] }}>No issues found.</p></div>
                : <><div style={{ backgroundColor: colors.warningLight, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}><div style={{ fontWeight: '600', color: colors.warning }}>Found {validationWarnings.length} potential issues</div></div><div style={{ maxHeight: '400px', overflowY: 'auto' }}>{validationWarnings.map((w, i) => <div key={i} style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px', marginBottom: '8px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><Badge variant={w.severity === 'error' ? 'danger' : 'warning'}>{w.severity || 'warning'}</Badge><span style={{ fontWeight: '600', fontSize: '13px' }}>Row {w.row} - {w.field}</span></div><p style={{ margin: 0, color: colors.gray[700], fontSize: '14px' }}>{w.message}</p>{w.verification_url && <a href={w.verification_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: colors.primary }}>🔗 Verify</a>}</div>)}</div></>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowAIValidateModal(false)}>Close</Button></div>
            </Modal>

            {/* Add Field Modal */}
            <Modal isOpen={showAddFieldModal} onClose={() => setShowAddFieldModal(false)} title={`Add Field to ${TABLE_LABELS[selectedTable] || selectedTable}`} icon="➕" size="md">
                <Input label="Column Name" required value={newField.column_name} onChange={(e) => setNewField({ ...newField, column_name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} placeholder="e.g., phone_number" />
                <Select label="Data Type" required value={newField.data_type} onChange={(e) => setNewField({ ...newField, data_type: e.target.value })} options={[{ value: 'text', label: 'Text (unlimited)' }, { value: 'string', label: 'String (max 255)' }, { value: 'number', label: 'Number (integer)' }, { value: 'decimal', label: 'Decimal' }, { value: 'boolean', label: 'Boolean' }, { value: 'date', label: 'Date' }, { value: 'datetime', label: 'Date & Time' }, { value: 'uuid', label: 'UUID' }, { value: 'json', label: 'JSON' }, { value: 'array', label: 'Array' }]} />
                <div style={{ marginBottom: '16px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: colors.gray[700], cursor: 'pointer' }}><input type="checkbox" checked={newField.is_nullable} onChange={(e) => setNewField({ ...newField, is_nullable: e.target.checked })} style={{ width: '18px', height: '18px' }} />Allow NULL values</label></div>
                <Input label="Default Value (optional)" value={newField.default_value} onChange={(e) => setNewField({ ...newField, default_value: e.target.value })} placeholder="e.g., 'Unknown'" />
                <TextArea label="Description (optional)" value={newField.description} onChange={(e) => setNewField({ ...newField, description: e.target.value })} placeholder="What is this field for?" />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowAddFieldModal(false)}>Cancel</Button><Button variant="warning" onClick={handleAddField}>Add Field</Button></div>
            </Modal>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } * { box-sizing: border-box; margin: 0; }`}</style>
        </div>
    );
};

export default MastersManagement;
