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
    account_managers: 'Account Managers',
    admins: 'Admins',
    brokers: 'Brokers',
    corporate_types: 'Corporate Types',
    icd_codes: 'ICD Codes',
    industry_types: 'Industry Types',
    insurers: 'Insurers',
    job_levels: 'Job Levels',
    tpas: 'TPAs',
    policy_type: 'Policy Types',
    policy_configuration: 'Policy Configuration'
};

// =====================================================
// COMPONENTS
// =====================================================
const Modal = ({ isOpen, onClose, title, icon, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeStyles = { sm: '440px', md: '600px', lg: '800px', xl: '1000px' };
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
    const variants = {
        default: { bg: colors.gray[100], color: colors.gray[700] },
        success: { bg: colors.successLight, color: '#065f46' },
        danger: { bg: colors.dangerLight, color: '#991b1b' },
        warning: { bg: colors.warningLight, color: '#92400e' },
        info: { bg: colors.infoLight, color: '#5b21b6' },
        cyan: { bg: colors.cyanLight, color: '#0369a1' }
    };
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

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
    const types = { success: { bg: colors.successLight, color: '#065f46', icon: '✓' }, error: { bg: colors.dangerLight, color: '#991b1b', icon: '✕' }, warning: { bg: colors.warningLight, color: '#92400e', icon: '⚠' }, info: { bg: colors.primaryLight, color: colors.primary, icon: 'ℹ' } };
    const t = types[type] || types.info;
    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: t.bg, color: t.color, padding: '14px 20px', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2000 }}>
            <span style={{ fontWeight: '700' }}>{t.icon}</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.color, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
    );
};

const StatsCard = ({ value, label, icon, onClick }) => (
    <div onClick={onClick} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.gray[200]}`, cursor: onClick ? 'pointer' : 'default', flex: 1, minWidth: '140px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: colors.gray[900] }}>{value}</div>
                <div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>{label}</div>
            </div>
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

    // States
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

    // Modal states
    const [showForm, setShowForm] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formData, setFormData] = useState({});
    const [dependencies, setDependencies] = useState([]);
    const [validationWarnings, setValidationWarnings] = useState([]);
    const [uploadingBulk, setUploadingBulk] = useState(false);

    // Auth
    const getToken = () => {
        if (typeof window === 'undefined') return null;
        return document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token');
    };

    // Fetch master tables list
    const fetchTables = async () => {
        try {
            setLoadingTables(true);
            const token = getToken();
            const response = await axios.get(`${MASTERS_API}/tables`, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                setTables(response.data.data || []);
            }
        } catch (err) {
            setToast({ message: 'Failed to load tables', type: 'error' });
        } finally {
            setLoadingTables(false);
        }
    };

    // Fetch table schema
    const fetchSchema = async (table) => {
        try {
            const token = getToken();
            const response = await axios.get(`${MASTERS_API}/${table}/schema`, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                setColumns(response.data.columns || []);
            }
        } catch (err) {
            console.error('Failed to fetch schema:', err);
        }
    };

    // Fetch records
    const fetchRecords = async (table, page = 1) => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${MASTERS_API}/${table}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit: itemsPerPage, search: searchQuery }
            });
            if (response.data.success) {
                setRecords(response.data.data || []);
                setTotalRecords(response.data.pagination?.total || 0);
            }
        } catch (err) {
            setToast({ message: 'Failed to load records', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Check dependencies
    const checkDependencies = async (table, id) => {
        try {
            const token = getToken();
            const response = await axios.get(`${MASTERS_API}/${table}/${id}/dependencies`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (err) {
            return { has_dependencies: false, dependencies: [] };
        }
    };

    // Validate records with AI
    const validateRecords = async (table, records) => {
        try {
            const token = getToken();
            const response = await axios.post(`${MASTERS_API}/${table}/validate`, { records }, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (err) {
            return { has_warnings: false, warnings: [] };
        }
    };

    useEffect(() => { fetchTables(); }, []);

    useEffect(() => {
        if (selectedTable) {
            fetchSchema(selectedTable);
            fetchRecords(selectedTable, 1);
            setCurrentPage(1);
        } else {
            setRecords([]);
            setColumns([]);
        }
    }, [selectedTable]);

    useEffect(() => {
        if (selectedTable) {
            const timer = setTimeout(() => fetchRecords(selectedTable, 1), 300);
            return () => clearTimeout(timer);
        }
    }, [searchQuery]);

    // Filtered columns (exclude system columns for display)
    const displayColumns = useMemo(() => {
        const exclude = ['created_at', 'updated_at', 'created_by', 'updated_by'];
        return columns.filter(c => !exclude.includes(c.column_name));
    }, [columns]);

    // Editable columns (exclude id and system columns)
    const editableColumns = useMemo(() => {
        const exclude = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by'];
        return columns.filter(c => !exclude.includes(c.column_name));
    }, [columns]);

    // Handle table change
    const handleTableChange = (table) => {
        setSelectedTable(table);
        setSearchQuery('');
        setRecords([]);
    };

    // Handle add new
    const handleAdd = () => {
        setSelectedRecord(null);
        const initialData = {};
        editableColumns.forEach(col => { initialData[col.column_name] = ''; });
        setFormData(initialData);
        setShowForm(true);
    };

    // Handle edit
    const handleEdit = (record) => {
        setSelectedRecord(record);
        const data = {};
        editableColumns.forEach(col => { data[col.column_name] = record[col.column_name] || ''; });
        setFormData(data);
        setShowForm(true);
    };

    // Handle delete click
    const handleDeleteClick = async (record) => {
        setSelectedRecord(record);
        const depData = await checkDependencies(selectedTable, record.id);
        setDependencies(depData.dependencies || []);
        setShowDeleteModal(true);
    };

    // Handle save
    const handleSave = async () => {
        try {
            const token = getToken();
            
            // Validate with AI first
            const validation = await validateRecords(selectedTable, [formData]);
            if (validation.has_warnings) {
                setValidationWarnings(validation.warnings);
                setShowWarningModal(true);
                return;
            }

            await saveRecord();
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Failed to save', type: 'error' });
        }
    };

    const saveRecord = async () => {
        const token = getToken();
        if (selectedRecord) {
            await axios.put(`${MASTERS_API}/${selectedTable}/${selectedRecord.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
            setToast({ message: 'Record updated!', type: 'success' });
        } else {
            await axios.post(`${MASTERS_API}/${selectedTable}`, formData, { headers: { Authorization: `Bearer ${token}` } });
            setToast({ message: 'Record created!', type: 'success' });
        }
        setShowForm(false);
        setShowWarningModal(false);
        fetchRecords(selectedTable, currentPage);
    };

    // Handle delete confirm
    const handleDeleteConfirm = async () => {
        try {
            const token = getToken();
            await axios.delete(`${MASTERS_API}/${selectedTable}/${selectedRecord.id}`, { headers: { Authorization: `Bearer ${token}` } });
            setToast({ message: 'Record deleted!', type: 'success' });
            setShowDeleteModal(false);
            fetchRecords(selectedTable, currentPage);
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Failed to delete', type: 'error' });
        }
    };

    // Download template
    const handleDownloadTemplate = async () => {
        const templateColumns = editableColumns.map(c => c.column_name);
        const sampleRow = {};
        templateColumns.forEach(col => { sampleRow[col] = ''; });
        await downloadExcel([sampleRow], `${selectedTable}_template.xlsx`, templateColumns);
        setToast({ message: 'Template downloaded!', type: 'success' });
    };

    // Handle bulk upload
    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingBulk(true);
        setShowUploadModal(false);

        try {
            const token = getToken();
            const jsonData = await parseExcel(file);

            if (!jsonData.length) {
                setToast({ message: 'File is empty', type: 'error' });
                setUploadingBulk(false);
                return;
            }

            // Validate with AI
            const validation = await validateRecords(selectedTable, jsonData);
            if (validation.has_warnings) {
                setValidationWarnings(validation.warnings);
                setShowWarningModal(true);
                setUploadingBulk(false);
                e.target.value = '';
                return;
            }

            // Upload
            const response = await axios.post(`${MASTERS_API}/${selectedTable}/bulk`, { records: jsonData }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (response.data.success) {
                setToast({ message: response.data.message, type: 'success' });
                fetchRecords(selectedTable, 1);
            }
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Upload failed', type: 'error' });
        } finally {
            setUploadingBulk(false);
            e.target.value = '';
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        document.cookie = 'admin_token=; path=/; max-age=0';
        window.location.href = 'https://www.benefitnest.space';
    };

    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Header */}
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
                {/* Title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.gray[900], marginBottom: '4px' }}>Masters Management</h1>
                        <p style={{ color: colors.gray[500], fontSize: '14px' }}>Manage lookup tables and configurations</p>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <StatsCard value={tables.length} label="Master Tables" icon="📋" />
                    <StatsCard value={totalRecords} label={selectedTable ? `${TABLE_LABELS[selectedTable] || selectedTable} Records` : 'Select a Table'} icon="📊" />
                </div>

                {/* Table Selector */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: `1px solid ${colors.gray[200]}` }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
                            <Select
                                label="Select Master Table"
                                value={selectedTable}
                                onChange={(e) => handleTableChange(e.target.value)}
                                options={tables.map(t => ({ value: t.name, label: `${TABLE_LABELS[t.name] || t.name} (${t.count})` }))}
                                style={{ marginBottom: 0 }}
                            />
                        </div>
                        {selectedTable && (
                            <>
                                <Button variant="cyan" icon="+" onClick={handleAdd}>Add New</Button>
                                <Button variant="success" icon="📤" onClick={() => setShowUploadModal(true)} disabled={uploadingBulk}>
                                    {uploadingBulk ? 'Uploading...' : 'Bulk Upload'}
                                </Button>
                                <Button variant="outline" icon="📥" onClick={handleDownloadTemplate}>Download Template</Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Records Table */}
                {selectedTable && (
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        {/* Search */}
                        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                            />
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: colors.gray[50] }}>
                                    <tr>
                                        {displayColumns.slice(0, 6).map(col => (
                                            <th key={col.column_name} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>
                                                {col.column_name.replace(/_/g, ' ')}
                                            </th>
                                        ))}
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={displayColumns.length + 1} style={{ padding: '60px', textAlign: 'center', color: colors.gray[500] }}>Loading...</td></tr>
                                    ) : records.length === 0 ? (
                                        <tr><td colSpan={displayColumns.length + 1} style={{ padding: '60px', textAlign: 'center', color: colors.gray[500] }}>No records found</td></tr>
                                    ) : records.map((record, idx) => (
                                        <tr key={record.id || idx} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}>
                                            {displayColumns.slice(0, 6).map(col => (
                                                <td key={col.column_name} style={{ padding: '12px 16px', fontSize: '14px', color: colors.gray[700] }}>
                                                    {col.column_name === 'is_active' ? (
                                                        <Badge variant={record[col.column_name] ? 'success' : 'danger'}>{record[col.column_name] ? 'Active' : 'Inactive'}</Badge>
                                                    ) : (
                                                        String(record[col.column_name] || '—').substring(0, 50)
                                                    )}
                                                </td>
                                            ))}
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <Button size="sm" variant="outline" icon="✏️" onClick={() => handleEdit(record)}>Edit</Button>
                                                    <Button size="sm" variant="danger" icon="🗑️" onClick={() => handleDeleteClick(record)}>Delete</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.gray[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: colors.gray[600] }}>Page {currentPage} of {totalPages} ({totalRecords} total)</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button variant="outline" size="sm" onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); fetchRecords(selectedTable, currentPage - 1); }} disabled={currentPage === 1}>← Prev</Button>
                                    <Button variant="outline" size="sm" onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); fetchRecords(selectedTable, currentPage + 1); }} disabled={currentPage === totalPages}>Next →</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!selectedTable && (
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '80px 40px', textAlign: 'center', border: `1px solid ${colors.gray[200]}` }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.gray[900], marginBottom: '8px' }}>Select a Master Table</h3>
                        <p style={{ color: colors.gray[500] }}>Choose a table from the dropdown above to view and manage records</p>
                    </div>
                )}
            </main>

            {/* Add/Edit Modal */}
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={selectedRecord ? `Edit ${TABLE_LABELS[selectedTable] || selectedTable}` : `Add ${TABLE_LABELS[selectedTable] || selectedTable}`} icon={selectedRecord ? '✏️' : '➕'} size="md">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {editableColumns.map(col => (
                        <Input
                            key={col.column_name}
                            label={col.column_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            value={formData[col.column_name] || ''}
                            onChange={(e) => setFormData({ ...formData, [col.column_name]: e.target.value })}
                            type={col.data_type === 'boolean' ? 'checkbox' : col.data_type === 'integer' ? 'number' : 'text'}
                        />
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button variant="cyan" onClick={handleSave}>{selectedRecord ? 'Update' : 'Create'}</Button>
                </div>
            </Modal>

            {/* Upload Modal */}
            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Bulk Upload" icon="📤" size="md">
                <p style={{ color: colors.gray[600], marginBottom: '20px' }}>
                    Upload an Excel file with {TABLE_LABELS[selectedTable] || selectedTable} records. Download the template first to ensure correct format.
                </p>
                <div style={{ backgroundColor: colors.cyanLight, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: '600', color: colors.cyan }}>📥 Download Template</div>
                            <div style={{ fontSize: '13px', color: colors.gray[600] }}>Get the template with all required columns</div>
                        </div>
                        <Button variant="cyan" size="sm" onClick={handleDownloadTemplate}>Download</Button>
                    </div>
                </div>
                <input type="file" accept=".xlsx,.xls" onChange={handleBulkUpload} style={{ display: 'none' }} id="bulk-upload" />
                <label htmlFor="bulk-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', border: `2px dashed ${colors.gray[300]}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: colors.gray[50] }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                    <div style={{ fontWeight: '600', color: colors.gray[700] }}>Click to select file</div>
                    <div style={{ fontSize: '13px', color: colors.gray[500] }}>Supports .xlsx, .xls</div>
                </label>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete" icon="⚠️" size="sm">
                <p style={{ color: colors.gray[600], marginBottom: '20px' }}>
                    Are you sure you want to delete this record?
                </p>
                {dependencies.length > 0 && (
                    <div style={{ backgroundColor: colors.warningLight, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                        <div style={{ fontWeight: '600', color: colors.warning, marginBottom: '8px' }}>⚠️ Warning: Dependencies Found</div>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: colors.gray[700], fontSize: '14px' }}>
                            {dependencies.map((dep, i) => (
                                <li key={i}>{dep.count} {dep.label}</li>
                            ))}
                        </ul>
                        <p style={{ fontSize: '13px', color: colors.gray[600], marginTop: '12px' }}>Deleting this record may cause issues in related data.</p>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>Delete Anyway</Button>
                </div>
            </Modal>

            {/* AI Validation Warning Modal */}
            <Modal isOpen={showWarningModal} onClose={() => setShowWarningModal(false)} title="Validation Warnings" icon="🤖" size="md">
                <div style={{ backgroundColor: colors.warningLight, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                    <div style={{ fontWeight: '600', color: colors.warning, marginBottom: '12px' }}>⚠️ AI detected potential issues:</div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {validationWarnings.map((w, i) => (
                            <li key={i} style={{ color: colors.gray[700], fontSize: '14px', marginBottom: '8px' }}>
                                <strong>Row {w.row}, {w.field}:</strong> {w.message}
                            </li>
                        ))}
                    </ul>
                </div>
                <p style={{ color: colors.gray[600], marginBottom: '20px' }}>Do you want to proceed anyway?</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="outline" onClick={() => setShowWarningModal(false)}>Cancel</Button>
                    <Button variant="warning" onClick={saveRecord}>Proceed Anyway</Button>
                </div>
            </Modal>

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; margin: 0; }
            `}</style>
        </div>
    );
};

export default MastersManagement;