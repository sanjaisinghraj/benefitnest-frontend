'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://benefitnest-backend.onrender.com';
const MASTERS_API = `${API_URL}/api/admin/masters`;
const AUTH_API = `${API_URL}/api/admin/auth`;

const colors = {
    primary: '#2563eb', primaryHover: '#1d4ed8', primaryLight: '#dbeafe',
    success: '#10b981', successHover: '#059669', successLight: '#d1fae5',
    danger: '#ef4444', dangerHover: '#dc2626', dangerLight: '#fee2e2',
    warning: '#f59e0b', warningHover: '#d97706', warningLight: '#fef3c7',
    info: '#8b5cf6', infoHover: '#7c3aed', infoLight: '#ede9fe',
    cyan: '#0ea5e9', cyanLight: '#e0f2fe',
    gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' }
};

const TABLE_LABELS = {
    account_managers: 'Account Managers', admins: 'Admins', brokers: 'Brokers',
    corporate_types: 'Corporate Types', icd_codes: 'ICD Codes', industry_types: 'Industry Types',
    insurers: 'Insurers', insurer_locations: 'Insurer Locations', job_levels: 'Job Levels',
    tpas: 'TPAs', tpa_locations: 'TPA Locations', policy_type: 'Policy Types',
    policy_configuration: 'Policy Configuration', regulatory_authorities: 'Regulatory Authorities',
    masters_audit_log: 'Audit Logs', tenants: 'Corporates/Tenants'
};

const FIELD_TYPE_MAP = {
    date_of_birth: 'date', dob: 'date', birth_date: 'date', start_date: 'date', end_date: 'date',
    effective_date: 'date', expiry_date: 'date', joining_date: 'date', termination_date: 'date',
    policy_start_date: 'date', policy_end_date: 'date', created_at: 'datetime', updated_at: 'datetime',
    is_active: 'boolean', is_enabled: 'boolean', is_default: 'boolean', is_verified: 'boolean',
    is_primary: 'boolean', is_cashless_enabled: 'boolean', api_key_required: 'boolean',
    email: 'email', contact_email: 'email', office_email: 'email', contact_person_email: 'email',
    phone: 'tel', mobile: 'tel', contact_phone: 'tel', office_phone: 'tel',
    website: 'url', logo_url: 'url', verification_url: 'url', api_endpoint: 'url',
    display_order: 'number', sort_order: 'number', hierarchy_level: 'number',
    description: 'textarea', address: 'textarea', address_line1: 'textarea', notes: 'textarea',
    corporate_type: 'dropdown', industry_type: 'dropdown', insurer_id: 'dropdown', tpa_id: 'dropdown',
    broker_id: 'dropdown', account_manager_id: 'dropdown', entity_type: 'dropdown', office_type: 'dropdown',
    hierarchy_type: 'dropdown', country: 'dropdown'
};

const STATIC_OPTIONS = {
    entity_type: [{ value: 'INSURER', label: 'Insurer' }, { value: 'TPA', label: 'TPA' }, { value: 'CORPORATE', label: 'Corporate' }],
    office_type: [{ value: 'HO', label: 'Head Office' }, { value: 'RO', label: 'Regional Office' }, { value: 'DO', label: 'Divisional Office' }, { value: 'BO', label: 'Branch Office' }, { value: 'BRANCH', label: 'Branch' }],
    hierarchy_type: [{ value: 'ENTITY', label: 'Entity' }, { value: 'COUNTRY', label: 'Country' }, { value: 'REGION', label: 'Region' }, { value: 'GLOBAL', label: 'Global' }],
    country: [{ value: 'India', label: 'India' }, { value: 'USA', label: 'USA' }, { value: 'UK', label: 'UK' }, { value: 'UAE', label: 'UAE' }, { value: 'Singapore', label: 'Singapore' }]
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

const StatsCard = ({ value, label, icon }) => (<div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.gray[200]}`, flex: 1, minWidth: '140px' }}><div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}><div><div style={{ fontSize: '28px', fontWeight: '700', color: colors.gray[900] }}>{value}</div><div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>{label}</div></div><div style={{ fontSize: '28px' }}>{icon}</div></div></div>);

const parseExcel = async (file) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];
    const data = [], headers = [];
    worksheet.eachRow((row, rowNum) => {
        if (rowNum === 1) row.eachCell((cell, colNum) => { headers[colNum - 1] = cell.value?.toString()?.trim() || ''; });
        else {
            const rowData = {}; let hasData = false;
            row.eachCell((cell, colNum) => { if (headers[colNum - 1]) { const value = cell.value; if (value !== null && value !== undefined && value !== '') { rowData[headers[colNum - 1]] = typeof value === 'object' && value.text ? value.text : String(value).trim(); hasData = true; } } });
            if (hasData) data.push(rowData);
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
    data.forEach(row => worksheet.addRow(headers.map(h => row[h] ?? '')));
    worksheet.columns.forEach(col => { col.width = 20; });
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
};

const MastersManagement = () => {
    const router = useRouter();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [records, setRecords] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
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
    const [showSchemaModal, setShowSchemaModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formData, setFormData] = useState({});
    const [dependencies, setDependencies] = useState([]);
    const [validationWarnings, setValidationWarnings] = useState([]);
    const [uploadingBulk, setUploadingBulk] = useState(false);
    const [aiValidating, setAiValidating] = useState(false);
    const [savingRecord, setSavingRecord] = useState(false);
    const [fkOptions, setFkOptions] = useState({});
    const [lookups, setLookups] = useState({});
    const [pendingUploadData, setPendingUploadData] = useState(null);
    const [tableStructure, setTableStructure] = useState(null);
    const [newField, setNewField] = useState({ column_name: '', data_type: 'text', is_nullable: true, default_value: '', description: '' });
    const [adminPassword, setAdminPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const getToken = () => { if (typeof window === 'undefined') return null; return document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token'); };
    const getAuthHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

    const fetchLookups = async () => { try { const response = await axios.get(`${MASTERS_API}/lookups/all`, { headers: getAuthHeaders() }); if (response.data.success) setLookups(response.data.lookups || {}); } catch (err) { console.error('Failed to fetch lookups:', err); } };
    const fetchTables = async () => { try { const response = await axios.get(`${MASTERS_API}/tables`, { headers: getAuthHeaders() }); if (response.data.success) setTables(response.data.data || []); } catch (err) { setToast({ message: 'Failed to load tables', type: 'error' }); } };
    const fetchSchema = async (table) => { try { const response = await axios.get(`${MASTERS_API}/${table}/schema`, { headers: getAuthHeaders() }); if (response.data.success) setColumns(response.data.columns || []); } catch (err) { console.error('Failed to fetch schema:', err); } };
    const fetchTableStructure = async (table) => { try { const response = await axios.get(`${MASTERS_API}/${table}/structure`, { headers: getAuthHeaders() }); if (response.data.success) { setTableStructure(response.data); setShowSchemaModal(true); } } catch (err) { setToast({ message: 'Failed to fetch table structure', type: 'error' }); } };
    const fetchFKOptions = async (table) => { try { const response = await axios.get(`${MASTERS_API}/${table}/fk-options`, { headers: getAuthHeaders() }); if (response.data.success) setFkOptions(response.data.options || {}); } catch (err) { console.error('Failed to fetch FK options:', err); } };
    const fetchRecords = async (table, page = 1) => { try { setLoading(true); const response = await axios.get(`${MASTERS_API}/${table}`, { headers: getAuthHeaders(), params: { page, limit: itemsPerPage, search: searchQuery } }); if (response.data.success) { setRecords(response.data.data || []); setTotalRecords(response.data.pagination?.total || 0); } } catch (err) { setToast({ message: 'Failed to load records', type: 'error' }); } finally { setLoading(false); } };
    const checkDependencies = async (table, id) => { try { const response = await axios.get(`${MASTERS_API}/${table}/${id}/dependencies`, { headers: getAuthHeaders() }); return response.data; } catch (err) { return { has_dependencies: false, dependencies: [] }; } };

    useEffect(() => { fetchTables(); fetchLookups(); }, []);
    useEffect(() => { if (selectedTable) { fetchSchema(selectedTable); fetchFKOptions(selectedTable); fetchRecords(selectedTable, 1); setCurrentPage(1); setSearchQuery(''); } else { setRecords([]); setColumns([]); setFkOptions({}); } }, [selectedTable]);
    useEffect(() => { if (selectedTable) { const timer = setTimeout(() => { setCurrentPage(1); fetchRecords(selectedTable, 1); }, 300); return () => clearTimeout(timer); } }, [searchQuery]);

    const primaryKeyColumn = useMemo(() => { if (columns.length === 0) return 'id'; const pkCol = columns.find(c => c.column_name === 'id' || c.column_name.endsWith('_id')); return pkCol?.column_name || columns[0]?.column_name || 'id'; }, [columns]);
    const displayColumns = useMemo(() => columns.filter(c => !['created_at', 'updated_at', 'created_by', 'updated_by'].includes(c.column_name)), [columns]);
    const editableColumns = useMemo(() => columns.filter(c => !['created_at', 'updated_at', 'created_by', 'updated_by'].includes(c.column_name) && c.column_name !== primaryKeyColumn), [columns, primaryKeyColumn]);

    const getFieldType = (columnName, dataType) => {
        if (FIELD_TYPE_MAP[columnName]) return FIELD_TYPE_MAP[columnName];
        if (dataType === 'boolean') return 'boolean';
        if (dataType === 'date') return 'date';
        if (dataType === 'timestamp with time zone' || dataType === 'timestamptz') return 'datetime';
        if (dataType === 'integer' || dataType === 'bigint' || dataType === 'numeric') return 'number';
        if (dataType === 'text' && (columnName.includes('description') || columnName.includes('address') || columnName.includes('notes'))) return 'textarea';
        return 'text';
    };

    const getDropdownOptions = (columnName) => {
        if (STATIC_OPTIONS[columnName]) return STATIC_OPTIONS[columnName];
        if (fkOptions[columnName]) return fkOptions[columnName];
        if (columnName === 'corporate_type' && lookups.corporate_types) return lookups.corporate_types.map(t => ({ value: t.id || t.code, label: t.name }));
        if (columnName === 'industry_type' && lookups.industry_types) return lookups.industry_types.map(t => ({ value: t.id || t.code, label: t.name }));
        if (columnName === 'insurer_id' && lookups.insurers) return lookups.insurers.map(t => ({ value: t.insurer_id, label: t.name }));
        if (columnName === 'tpa_id' && lookups.tpas) return lookups.tpas.map(t => ({ value: t.tpa_id, label: t.name }));
        if (columnName === 'broker_id' && lookups.brokers) return lookups.brokers.map(t => ({ value: t.broker_id, label: t.name }));
        if (columnName === 'account_manager_id' && lookups.account_managers) return lookups.account_managers.map(t => ({ value: t.manager_id, label: t.name }));
        return null;
    };

    const handleTableChange = (table) => { setSelectedTable(table); setSearchQuery(''); setRecords([]); };
    const handleAdd = () => { setSelectedRecord(null); const initialData = {}; editableColumns.forEach(col => { initialData[col.column_name] = ''; }); setFormData(initialData); setShowForm(true); };
    const handleView = (record) => { setSelectedRecord(record); setShowViewModal(true); };
    const handleEdit = (record) => { setSelectedRecord(record); const data = {}; editableColumns.forEach(col => { data[col.column_name] = record[col.column_name] ?? ''; }); setFormData(data); setShowForm(true); };
    const handleDeleteClick = async (record) => { setSelectedRecord(record); const depData = await checkDependencies(selectedTable, record[primaryKeyColumn]); setDependencies(depData.dependencies || []); setShowDeleteModal(true); };

    // Save with AI validation
    const handleSave = async (skipAI = false, ignoreWarnings = false) => {
        try {
            setSavingRecord(true);
            const payload = selectedRecord 
                ? { updates: formData, skip_ai_validation: skipAI, ai_warnings_ignored: ignoreWarnings } 
                : { record: formData, skip_ai_validation: skipAI, ai_warnings_ignored: ignoreWarnings };
            const url = selectedRecord 
                ? `${MASTERS_API}/${selectedTable}/${selectedRecord[primaryKeyColumn]}` 
                : `${MASTERS_API}/${selectedTable}`;
            
            const response = await axios({ method: selectedRecord ? 'PUT' : 'POST', url, data: payload, headers: getAuthHeaders() });
            
            if (response.data.requires_confirmation) { 
                setValidationWarnings(response.data.validation?.warnings || []); 
                setShowWarningModal(true); 
                return; 
            }
            if (response.data.success) { 
                setToast({ message: selectedRecord ? 'Record updated!' : 'Record created!', type: 'success' }); 
                setShowForm(false); 
                setShowWarningModal(false); 
                fetchRecords(selectedTable, currentPage); 
            }
        } catch (err) { 
            setToast({ message: err.response?.data?.message || 'Failed to save', type: 'error' }); 
        } finally {
            setSavingRecord(false);
        }
    };

    const handleDeleteConfirm = async () => { try { await axios.delete(`${MASTERS_API}/${selectedTable}/${selectedRecord[primaryKeyColumn]}`, { headers: getAuthHeaders() }); setToast({ message: 'Record deleted!', type: 'success' }); setShowDeleteModal(false); fetchRecords(selectedTable, currentPage); } catch (err) { setToast({ message: err.response?.data?.message || 'Failed to delete', type: 'error' }); } };
    const handleDownloadTemplate = async () => { const templateColumns = editableColumns.map(c => c.column_name); const sampleRow = {}; templateColumns.forEach(col => { sampleRow[col] = ''; }); await downloadExcel([sampleRow], `${selectedTable}_template.xlsx`, templateColumns); setToast({ message: 'Template downloaded!', type: 'success' }); };
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
            else if (response.data.success) { const msg = response.data.results ? `Uploaded ${response.data.results.success} of ${jsonData.length} records` : response.data.message; setToast({ message: msg, type: response.data.results?.failed > 0 ? 'warning' : 'success' }); setPendingUploadData(null); fetchRecords(selectedTable, 1); }
        } catch (err) { setToast({ message: err.response?.data?.message || 'Upload failed', type: 'error' }); }
        finally { setUploadingBulk(false); e.target.value = ''; }
    };

    const handleBulkUploadIgnoreWarnings = async () => {
        if (!pendingUploadData) return;
        try { const response = await axios.post(`${MASTERS_API}/${selectedTable}/bulk`, { records: pendingUploadData, skip_ai_validation: true, ai_warnings_ignored: true }, { headers: getAuthHeaders() }); if (response.data.success) { setToast({ message: response.data.message || 'Upload complete', type: 'success' }); setPendingUploadData(null); setShowWarningModal(false); fetchRecords(selectedTable, 1); } }
        catch (err) { setToast({ message: err.response?.data?.message || 'Upload failed', type: 'error' }); }
    };

    // Show password modal before AI validate
    const handleAIValidateClick = () => {
        setAdminPassword('');
        setPasswordError('');
        setShowPasswordModal(true);
    };

    // Verify password and run AI validation
    const handlePasswordSubmit = async () => {
        try {
            setPasswordError('');
            // Verify admin password
            const verifyResponse = await axios.post(`${AUTH_API}/verify-password`, 
                { password: adminPassword }, 
                { headers: getAuthHeaders() }
            );
            
            if (!verifyResponse.data.success) {
                setPasswordError('Invalid password');
                return;
            }

            setShowPasswordModal(false);
            setAiValidating(true);

            // Run AI validation
            const response = await axios.post(`${MASTERS_API}/${selectedTable}/validate-all`, {}, { headers: getAuthHeaders() });
            if (response.data.success) {
                setValidationWarnings(response.data.warnings || []);
                setShowAIValidateModal(true);
            }
        } catch (err) {
            if (err.response?.status === 401 || err.response?.data?.message?.includes('password')) {
                setPasswordError('Invalid password');
            } else {
                setShowPasswordModal(false);
                setToast({ message: 'AI validation failed', type: 'error' });
            }
        } finally {
            setAiValidating(false);
        }
    };

    const handleAddField = async () => {
        try { if (!newField.column_name) { setToast({ message: 'Column name is required', type: 'error' }); return; }
            const response = await axios.post(`${MASTERS_API}/${selectedTable}/add-field`, newField, { headers: getAuthHeaders() });
            if (response.data.success) { setToast({ message: response.data.message, type: 'success' }); setShowAddFieldModal(false); setNewField({ column_name: '', data_type: 'text', is_nullable: true, default_value: '', description: '' }); fetchSchema(selectedTable); }
            else if (response.data.sql) { setToast({ message: 'Run SQL manually', type: 'warning' }); alert(`Run this SQL:\n\n${response.data.sql}`); }
        } catch (err) { setToast({ message: err.response?.data?.message || 'Failed', type: 'error' }); }
    };

    const handleLogout = () => { localStorage.removeItem('admin_token'); document.cookie = 'admin_token=; path=/; max-age=0'; window.location.href = 'https://www.benefitnest.space'; };
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    const renderFormField = (col) => {
        const columnName = col.column_name;
        const label = columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const fieldType = getFieldType(columnName, col.data_type);
        const dropdownOptions = getDropdownOptions(columnName);
        if (dropdownOptions || fieldType === 'dropdown') return <Select key={columnName} label={label} value={formData[columnName] || ''} onChange={(e) => setFormData({ ...formData, [columnName]: e.target.value })} options={dropdownOptions || []} />;
        if (fieldType === 'boolean') return <Checkbox key={columnName} label={label} checked={formData[columnName] === true || formData[columnName] === 'true' || formData[columnName] === 't'} onChange={(e) => setFormData({ ...formData, [columnName]: e.target.checked })} />;
        if (fieldType === 'textarea') return <TextArea key={columnName} label={label} value={formData[columnName] || ''} onChange={(e) => setFormData({ ...formData, [columnName]: e.target.value })} />;
        if (fieldType === 'date') return <Input key={columnName} label={label} type="date" value={formData[columnName] ? formData[columnName].split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, [columnName]: e.target.value })} />;
        if (fieldType === 'datetime') return <Input key={columnName} label={label} type="datetime-local" value={formData[columnName] ? formData[columnName].slice(0, 16) : ''} onChange={(e) => setFormData({ ...formData, [columnName]: e.target.value })} />;
        return <Input key={columnName} label={label} type={fieldType} value={formData[columnName] || ''} onChange={(e) => setFormData({ ...formData, [columnName]: e.target.value })} />;
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            <header style={{ backgroundColor: 'white', borderBottom: `1px solid ${colors.gray[200]}`, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img src="/images/marketing/logo.png" alt="Logo" style={{ height: '40px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <Button variant="ghost" icon="←" onClick={() => router.push('/admin/dashboard')}>Dashboard</Button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* User Profile Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: colors.gray[100], border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: colors.gray[700] }}>
                                <span style={{ fontSize: '20px' }}>👤</span><span>Admin</span><span style={{ fontSize: '12px' }}>▼</span>
                            </button>
                            {showProfileMenu && (
                                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: `1px solid ${colors.gray[200]}`, minWidth: '180px', zIndex: 200 }}>
                                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: colors.gray[900] }}>Administrator</div>
                                        <div style={{ fontSize: '12px', color: colors.gray[500] }}>admin@benefitnest.com</div>
                                    </div>
                                    <div style={{ padding: '8px' }}>
                                        <button onClick={() => { setShowProfileMenu(false); router.push('/admin/profile'); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', backgroundColor: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: colors.gray[700], display: 'flex', alignItems: 'center', gap: '8px' }}>👤 My Profile</button>
                                        <button onClick={() => { setShowProfileMenu(false); router.push('/admin/settings'); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', backgroundColor: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: colors.gray[700], display: 'flex', alignItems: 'center', gap: '8px' }}>⚙️ Settings</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Button variant="danger" icon="🚪" onClick={handleLogout}>Logout</Button>
                    </div>
                </div>
            </header>
            {showProfileMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowProfileMenu(false)} />}

            <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}><h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.gray[900], marginBottom: '4px' }}>Masters Management</h1><p style={{ color: colors.gray[500], fontSize: '14px' }}>Manage lookup tables and configurations</p></div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}><StatsCard value={tables.length} label="Master Tables" icon="📋" /><StatsCard value={totalRecords} label={selectedTable ? `${TABLE_LABELS[selectedTable] || selectedTable} Records` : 'Select a Table'} icon="📊" /></div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: `1px solid ${colors.gray[200]}` }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}><Select label="Select Master Table" value={selectedTable} onChange={(e) => handleTableChange(e.target.value)} options={tables.map(t => ({ value: t.name, label: `${TABLE_LABELS[t.name] || t.name} (${t.count})` }))} style={{ marginBottom: 0 }} /></div>
                        {selectedTable && (<>
                            <Button variant="cyan" icon="+" onClick={handleAdd}>Add New</Button>
                            <Button variant="success" icon="📤" onClick={() => setShowUploadModal(true)} disabled={uploadingBulk}>{uploadingBulk ? 'Uploading...' : 'Bulk Upload'}</Button>
                            <Button variant="outline" icon="📥" onClick={handleDownloadTemplate}>Template</Button>
                            <Button variant="primary" icon="📥" onClick={handleDownloadData} disabled={loading}>Download</Button>
                            <Button variant="info" icon="🤖" onClick={handleAIValidateClick} disabled={aiValidating}>{aiValidating ? 'Validating...' : 'AI Validate'}</Button>
                            <Button variant="warning" icon="➕" onClick={() => setShowAddFieldModal(true)}>Add Field</Button>
                            <Button variant="ghost" icon="🗂️" onClick={() => fetchTableStructure(selectedTable)}>Schema</Button>
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
                                    {loading ? <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: colors.gray[500] }}>Loading...</td></tr>
                                    : records.length === 0 ? <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: colors.gray[500] }}>No records found</td></tr>
                                    : records.map((record, idx) => (
                                        <tr key={record[primaryKeyColumn] || idx} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}>
                                            {displayColumns.slice(0, 6).map(col => <td key={col.column_name} style={{ padding: '12px 16px', fontSize: '14px', color: colors.gray[700] }}>{col.data_type === 'boolean' ? <Badge variant={record[col.column_name] ? 'success' : 'danger'}>{record[col.column_name] ? 'Yes' : 'No'}</Badge> : String(record[col.column_name] ?? '—').substring(0, 50)}</td>)}
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}><div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}><Button size="sm" variant="outline" icon="👁️" onClick={() => handleView(record)}>View</Button><Button size="sm" variant="cyan" icon="✏️" onClick={() => handleEdit(record)}>Edit</Button><Button size="sm" variant="danger" icon="🗑️" onClick={() => handleDeleteClick(record)}>Delete</Button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.gray[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '14px', color: colors.gray[600] }}>Page {currentPage} of {totalPages} ({totalRecords} total)</span><div style={{ display: 'flex', gap: '8px' }}><Button variant="outline" size="sm" onClick={() => { const p = Math.max(1, currentPage - 1); setCurrentPage(p); fetchRecords(selectedTable, p); }} disabled={currentPage === 1}>← Prev</Button><Button variant="outline" size="sm" onClick={() => { const p = Math.min(totalPages, currentPage + 1); setCurrentPage(p); fetchRecords(selectedTable, p); }} disabled={currentPage === totalPages}>Next →</Button></div></div>}
                    </div>
                )}
                {!selectedTable && <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '80px 40px', textAlign: 'center', border: `1px solid ${colors.gray[200]}` }}><div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div><h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.gray[900], marginBottom: '8px' }}>Select a Master Table</h3><p style={{ color: colors.gray[500] }}>Choose a table from the dropdown above</p></div>}
            </main>

            {/* View Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="View Record" icon="👁️" size="lg">
                {selectedRecord && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>{columns.map(col => <div key={col.column_name} style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px' }}><div style={{ fontSize: '11px', fontWeight: '600', color: colors.gray[500], textTransform: 'uppercase', marginBottom: '4px' }}>{col.column_name.replace(/_/g, ' ')}</div><div style={{ fontSize: '14px', color: colors.gray[900], wordBreak: 'break-word' }}>{col.data_type === 'boolean' ? (selectedRecord[col.column_name] ? '✅ Yes' : '❌ No') : String(selectedRecord[col.column_name] ?? '—')}</div></div>)}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button></div>
            </Modal>

            {/* Add/Edit Form Modal */}
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={selectedRecord ? 'Edit Record' : 'Add Record'} icon={selectedRecord ? '✏️' : '➕'} size="lg">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>{editableColumns.map(col => renderFormField(col))}</div>
                <div style={{ backgroundColor: colors.primaryLight, borderRadius: '8px', padding: '12px 16px', marginTop: '16px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.primary }}>
                        <span>🤖</span>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>AI will automatically validate your data before saving</span>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button variant="ghost" onClick={() => handleSave(true)} disabled={savingRecord}>Save (Skip AI)</Button>
                    <Button variant="cyan" onClick={() => handleSave(false)} disabled={savingRecord} loading={savingRecord}>{selectedRecord ? 'Update' : 'Create'}</Button>
                </div>
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Bulk Upload" icon="📤" size="md">
                <p style={{ color: colors.gray[600], marginBottom: '20px' }}>Upload an Excel file. Download template first.</p>
                <div style={{ backgroundColor: colors.primaryLight, borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.primary }}>
                        <span>🤖</span>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>AI will validate all records before uploading</span>
                    </div>
                </div>
                <div style={{ backgroundColor: colors.cyanLight, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><div style={{ fontWeight: '600', color: colors.cyan }}>📥 Download Template</div></div><Button variant="cyan" size="sm" onClick={handleDownloadTemplate}>Download</Button></div></div>
                <input type="file" accept=".xlsx,.xls" onChange={handleBulkUpload} style={{ display: 'none' }} id="bulk-upload" />
                <label htmlFor="bulk-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', border: `2px dashed ${colors.gray[300]}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: colors.gray[50] }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div><div style={{ fontWeight: '600', color: colors.gray[700] }}>Click to select file</div></label>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete" icon="⚠️" size="sm">
                <p style={{ color: colors.gray[600], marginBottom: '20px' }}>Are you sure you want to delete this record?</p>
                {dependencies.length > 0 && <div style={{ backgroundColor: colors.warningLight, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}><div style={{ fontWeight: '600', color: colors.warning, marginBottom: '8px' }}>⚠️ Dependencies Found</div><ul style={{ margin: 0, paddingLeft: '20px' }}>{dependencies.map((dep, i) => <li key={i}>{dep.count} records in {dep.table}</li>)}</ul></div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}><Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button><Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button></div>
            </Modal>

            {/* AI Validation Warnings Modal */}
            <Modal isOpen={showWarningModal} onClose={() => { setShowWarningModal(false); setPendingUploadData(null); }} title="AI Validation Warnings" icon="🤖" size="lg">
                <div style={{ backgroundColor: colors.warningLight, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}><div style={{ fontWeight: '600', color: colors.warning, marginBottom: '12px' }}>⚠️ AI detected potential issues:</div><div style={{ maxHeight: '300px', overflowY: 'auto' }}>{validationWarnings.map((w, i) => <div key={i} style={{ padding: '10px 12px', backgroundColor: 'white', borderRadius: '6px', marginBottom: '8px', fontSize: '14px', borderLeft: `4px solid ${w.severity === 'error' ? colors.danger : colors.warning}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><Badge variant={w.severity === 'error' ? 'danger' : 'warning'}>{w.severity || 'warning'}</Badge><strong>Row {w.row} - {w.field}</strong></div><div style={{ color: colors.gray[700] }}>{w.message}</div>{w.suggested_value && <div style={{ fontSize: '12px', color: colors.success, marginTop: '4px' }}>💡 Suggested: {w.suggested_value}</div>}</div>)}</div></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}><Button variant="outline" onClick={() => { setShowWarningModal(false); setPendingUploadData(null); }}>Cancel & Fix</Button><Button variant="warning" onClick={() => { if (pendingUploadData) handleBulkUploadIgnoreWarnings(); else handleSave(false, true); }}>Ignore & Proceed</Button></div>
            </Modal>

            {/* AI Validate Results Modal */}
            <Modal isOpen={showAIValidateModal} onClose={() => setShowAIValidateModal(false)} title="AI Validation Results" icon="🤖" size="lg">
                {validationWarnings.length === 0 ? <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div><h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.success }}>All Records Valid!</h3><p style={{ color: colors.gray[500] }}>No issues found in the selected records.</p></div>
                : <><div style={{ backgroundColor: colors.warningLight, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}><div style={{ fontWeight: '600', color: colors.warning }}>Found {validationWarnings.length} potential issues</div></div><div style={{ maxHeight: '400px', overflowY: 'auto' }}>{validationWarnings.map((w, i) => <div key={i} style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px', marginBottom: '8px', borderLeft: `4px solid ${w.severity === 'error' ? colors.danger : colors.warning}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><Badge variant={w.severity === 'error' ? 'danger' : 'warning'}>{w.severity || 'warning'}</Badge><strong>Row {w.row} - {w.field}</strong></div><p style={{ margin: '4px 0 0', color: colors.gray[700] }}>{w.message}</p>{w.suggested_value && <div style={{ fontSize: '12px', color: colors.success, marginTop: '4px' }}>💡 Suggested: {w.suggested_value}</div>}</div>)}</div></>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowAIValidateModal(false)}>Close</Button></div>
            </Modal>

            {/* Password Modal for AI Validate */}
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
                <div style={{ backgroundColor: colors.primaryLight, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', color: colors.primary }}>
                        <strong>Table:</strong> {TABLE_LABELS[selectedTable] || selectedTable}<br/>
                        <strong>Records to validate:</strong> {totalRecords}
                    </div>
                </div>
                <Input 
                    label="Enter Admin Password to Proceed" 
                    type="password" 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)} 
                    placeholder="Your admin login password"
                />
                {passwordError && <div style={{ color: colors.danger, fontSize: '13px', marginTop: '-10px', marginBottom: '16px' }}>{passwordError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handlePasswordSubmit} disabled={!adminPassword || aiValidating} loading={aiValidating}>
                        Validate All Records
                    </Button>
                </div>
            </Modal>

            {/* Add Field Modal */}
            <Modal isOpen={showAddFieldModal} onClose={() => setShowAddFieldModal(false)} title="Add Field" icon="➕" size="md">
                <Input label="Column Name" required value={newField.column_name} onChange={(e) => setNewField({ ...newField, column_name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} placeholder="e.g., phone_number" />
                <Select label="Data Type" required value={newField.data_type} onChange={(e) => setNewField({ ...newField, data_type: e.target.value })} options={[{ value: 'text', label: 'Text' }, { value: 'string', label: 'String (255)' }, { value: 'number', label: 'Number' }, { value: 'decimal', label: 'Decimal' }, { value: 'boolean', label: 'Boolean' }, { value: 'date', label: 'Date' }, { value: 'datetime', label: 'DateTime' }, { value: 'uuid', label: 'UUID' }, { value: 'json', label: 'JSON' }]} />
                <Checkbox label="Allow NULL values" checked={newField.is_nullable} onChange={(e) => setNewField({ ...newField, is_nullable: e.target.checked })} />
                <Input label="Default Value" value={newField.default_value} onChange={(e) => setNewField({ ...newField, default_value: e.target.value })} />
                <TextArea label="Description" value={newField.description} onChange={(e) => setNewField({ ...newField, description: e.target.value })} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowAddFieldModal(false)}>Cancel</Button><Button variant="warning" onClick={handleAddField}>Add Field</Button></div>
            </Modal>

            {/* Schema Modal */}
            <Modal isOpen={showSchemaModal} onClose={() => setShowSchemaModal(false)} title={`Schema: ${selectedTable}`} icon="🗂️" size="lg">
                {tableStructure && (<>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ padding: '16px', backgroundColor: colors.primaryLight, borderRadius: '8px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>{tableStructure.columns?.length || 0}</div><div style={{ fontSize: '12px', color: colors.gray[600] }}>Columns</div></div>
                        <div style={{ padding: '16px', backgroundColor: colors.successLight, borderRadius: '8px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: colors.success }}>{tableStructure.record_count || 0}</div><div style={{ fontSize: '12px', color: colors.gray[600] }}>Records</div></div>
                        <div style={{ padding: '16px', backgroundColor: colors.cyanLight, borderRadius: '8px' }}><div style={{ fontSize: '24px', fontWeight: '700', color: colors.cyan }}>{tableStructure.primary_key || 'id'}</div><div style={{ fontSize: '12px', color: colors.gray[600] }}>Primary Key</div></div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: colors.gray[50] }}><tr><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Column</th><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Type</th><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Nullable</th><th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Default</th></tr></thead>
                            <tbody>{tableStructure.columns?.map(col => <tr key={col.column_name} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}><td style={{ padding: '10px 12px', fontSize: '14px', fontWeight: '500' }}>{col.column_name}</td><td style={{ padding: '10px 12px', fontSize: '14px' }}><Badge variant="cyan">{col.data_type}</Badge></td><td style={{ padding: '10px 12px', fontSize: '14px' }}>{col.is_nullable === 'YES' ? '✅' : '❌'}</td><td style={{ padding: '10px 12px', fontSize: '13px', color: colors.gray[500] }}>{col.column_default || '—'}</td></tr>)}</tbody>
                        </table>
                    </div>
                    {tableStructure.referenced_by?.length > 0 && <div style={{ marginTop: '24px' }}><h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Referenced By:</h4>{tableStructure.referenced_by.map((ref, i) => <Badge key={i} variant="info" style={{ marginRight: '8px', marginBottom: '8px' }}>{ref.referencing_table}.{ref.referencing_column}</Badge>)}</div>}
                </>)}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}><Button variant="outline" onClick={() => setShowSchemaModal(false)}>Close</Button></div>
            </Modal>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Footer */}
            <footer style={{ marginTop: 'auto', padding: '20px 24px', backgroundColor: 'white', borderTop: `1px solid ${colors.gray[200]}`, textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: colors.gray[500], marginBottom: '4px' }}>© {new Date().getFullYear()} BenefitNest. All rights reserved.</p>
                <p style={{ fontSize: '12px', color: colors.gray[400] }}>Developed by Sanjai & Aaryam</p>
            </footer>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } * { box-sizing: border-box; margin: 0; }`}</style>
        </div>
    );
};

export default MastersManagement;
