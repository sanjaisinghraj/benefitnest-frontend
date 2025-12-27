'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://benefitnest-backend.onrender.com';
const CORPORATES_API = `${API_URL}/api/admin/corporates`;
const MASTERS_API = `${API_URL}/api/admin/masters`;
const LOOKUP_API = `${API_URL}/api/lookup`;

const colors = {
    primary: '#2563eb', primaryHover: '#1d4ed8', primaryLight: '#dbeafe',
    success: '#10b981', successHover: '#059669', successLight: '#d1fae5',
    danger: '#ef4444', dangerHover: '#dc2626', dangerLight: '#fee2e2',
    warning: '#f59e0b', warningHover: '#d97706', warningLight: '#fef3c7',
    info: '#8b5cf6', infoHover: '#7c3aed', infoLight: '#ede9fe',
    cyan: '#0ea5e9', cyanLight: '#e0f2fe',
    gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' }
};

// Core fields in tenants table - used to detect new dynamic fields
const CORE_FIELDS = [
    'tenant_id', 'tenant_code', 'subdomain', 'status', 'corporate_legal_name', 
    'corporate_type', 'industry_type', 'country', 'address', 'contact_details', 
    'documents', 'benefitnest_manager', 'registration_details', 'branding_config', 
    'broker_id', 'contract_start_date', 'contract_end_date', 'contract_value',
    'compliance_status', 'portal_url', 'health_score', 'health_factors',
    'tags', 'internal_notes', 'ai_scan_skipped', 'ai_observations',
    'created_at', 'updated_at', 'last_activity_at', 'created_by', 'updated_by'
];
const SYSTEM_FIELDS = ['tenant_id', 'created_at', 'updated_at', 'last_activity_at', 'created_by', 'updated_by'];

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

const Modal = ({ isOpen, onClose, title, icon, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeStyles = { sm: '440px', md: '600px', lg: '900px', xl: '1200px' };
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: sizeStyles[size], maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{icon && <span style={{ fontSize: '22px' }}>{icon}</span>}<h2 style={{ fontSize: '17px', fontWeight: '700', color: colors.gray[900], margin: 0 }}>{title}</h2></div>
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

const Input = ({ label, required, type = 'text', hint, ...props }) => (
    <div style={{ marginBottom: '16px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}
        <input type={type} {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', ...props.style }} />
        {hint && <div style={{ fontSize: '11px', color: colors.gray[500], marginTop: '4px' }}>{hint}</div>}
    </div>
);

const Select = ({ label, required, options = [], placeholder, ...props }) => (
    <div style={{ marginBottom: '16px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}
        <select {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer', boxSizing: 'border-box', ...props.style }}>
            <option value="">{placeholder || `Select ${label || 'option'}`}</option>
            {options.map(opt => <option key={opt.value ?? opt.id ?? opt.name} value={opt.value ?? opt.id ?? opt.name}>{opt.label || opt.name}</option>)}
        </select>
    </div>
);

const TextArea = ({ label, required, ...props }) => (
    <div style={{ marginBottom: '16px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}
        <textarea {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', ...props.style }} />
    </div>
);

const Checkbox = ({ label, checked, onChange, disabled }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: colors.gray[700], cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
        <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ width: '18px', height: '18px', cursor: disabled ? 'not-allowed' : 'pointer' }} />
        {label}
    </label>
);

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
    const types = { success: { bg: colors.successLight, color: '#065f46', icon: '✓' }, error: { bg: colors.dangerLight, color: '#991b1b', icon: '✕' }, warning: { bg: colors.warningLight, color: '#92400e', icon: '⚠' }, info: { bg: colors.primaryLight, color: colors.primary, icon: 'ℹ' } };
    const t = types[type] || types.info;
    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: t.bg, color: t.color, padding: '14px 20px', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2000, maxWidth: '400px' }}>
            <span style={{ fontWeight: '700' }}>{t.icon}</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.color, cursor: 'pointer', fontSize: '18px', marginLeft: '8px' }}>×</button>
        </div>
    );
};

const StatsCard = ({ value, label, icon, active, onClick }) => (
    <div onClick={onClick} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: `1px solid ${active ? colors.primary : colors.gray[200]}`, flex: 1, minWidth: '140px', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', boxShadow: active ? `0 0 0 2px ${colors.primaryLight}` : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: colors.gray[900] }}>{value}</div>
                <div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>{label}</div>
            </div>
            <div style={{ fontSize: '28px' }}>{icon}</div>
        </div>
    </div>
);

const SectionHeader = ({ title, icon, action }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '8px', borderBottom: `2px solid ${colors.primary}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>{icon}</span>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.gray[900], margin: 0 }}>{title}</h3>
        </div>
        {action}
    </div>
);

// =====================================================
// EXCEL HELPERS
// =====================================================

const parseExcel = async (file) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];
    const data = [], headers = [];
    worksheet.eachRow((row, rowNum) => {
        if (rowNum === 1) row.eachCell((cell, colNum) => { headers[colNum - 1] = cell.value?.toString()?.trim() || ''; });
        else { 
            const rowData = {}; 
            let hasData = false; 
            row.eachCell((cell, colNum) => { 
                if (headers[colNum - 1]) { 
                    const value = cell.value; 
                    if (value !== null && value !== undefined && value !== '') { 
                        rowData[headers[colNum - 1]] = typeof value === 'object' && value.text ? value.text : String(value).trim(); 
                        hasData = true; 
                    } 
                } 
            }); 
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

// =====================================================
// MAIN COMPONENT
// =====================================================

const CorporateManagement = () => {
    const router = useRouter();
    
    // ==================== STATE ====================
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

    // Lookups
    const [industryTypes, setIndustryTypes] = useState([]);
    const [corporateTypes, setCorporateTypes] = useState([]);
    const [brokers, setBrokers] = useState([]);
    
    // Dynamic fields (new columns added to table)
    const [dynamicFields, setDynamicFields] = useState([]);

    // Stats
    const [stats, setStats] = useState({ total: 0, active: 0, pipeline: 0, expiring: 0 });

    // Modals
    const [showForm, setShowForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSchemaModal, setShowSchemaModal] = useState(false);
    const [showAddFieldModal, setShowAddFieldModal] = useState(false);
    const [showAIValidationModal, setShowAIValidationModal] = useState(false);

    // Form state
    const [selectedCorporate, setSelectedCorporate] = useState(null);
    const [formData, setFormData] = useState({});
    const [contacts, setContacts] = useState([{ full_name: '', email: '', phone: '', mobile: '', designation: '', department: '', is_primary: true, is_decision_maker: false }]);
    const [savingRecord, setSavingRecord] = useState(false);
    const [uploadingBulk, setUploadingBulk] = useState(false);
    
    // AI Validation
    const [aiValidating, setAiValidating] = useState(false);
    const [aiValidationResults, setAiValidationResults] = useState({ issues: [], valid: true });

    const hasAIIssues =
  Array.isArray(aiValidationResults?.issues) &&
  aiValidationResults.issues.length > 0;

    // Schema & Add Field
    const [tableStructure, setTableStructure] = useState(null);
    const [newField, setNewField] = useState({ column_name: '', data_type: 'text', is_nullable: true, default_value: '', description: '' });

    // ==================== AUTH HELPERS ====================
    const getToken = () => { 
        if (typeof window === 'undefined') return null; 
        return document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token'); 
    };
    const getAuthHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

    // ==================== API FUNCTIONS ====================
    
    const fetchLookups = async () => {
        try {
            const response = await axios.get(`${LOOKUP_API}/all`);
            if (response.data.success) {
                setIndustryTypes(response.data.data?.industryTypes || []);
                setCorporateTypes(response.data.data?.corporateTypes || []);
                setBrokers(response.data.data?.brokers || []);
            }
        } catch (err) { console.error('Failed to fetch lookups:', err); }
    };

    const fetchDynamicFields = async () => {
        try {
            const response = await axios.get(`${MASTERS_API}/tenants/structure`, { headers: getAuthHeaders() });
            if (response.data.success && response.data.columns) {
                const allColumns = response.data.columns.map(c => c.column_name);
                const newFields = allColumns.filter(col => !CORE_FIELDS.includes(col));
                setDynamicFields(newFields);
            }
        } catch (err) { console.error('Failed to fetch dynamic fields:', err); }
    };

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
            if (response.data.success) { 
                setCorporates(response.data.data || []); 
                setTotalRecords(response.data.pagination?.total || 0); 
            }
        } catch (err) { 
            console.error('Error fetching corporates:', err); 
            setToast({ message: 'Failed to fetch corporates', type: 'error' }); 
        } finally { 
            setLoading(false); 
        }
    };

    const fetchStats = async () => {
        try {
            const [allRes, activeRes, pipelineRes, expiringRes] = await Promise.all([
                axios.get(CORPORATES_API, { headers: getAuthHeaders(), params: { limit: 1 } }),
                axios.get(CORPORATES_API, { headers: getAuthHeaders(), params: { limit: 1, status: 'ACTIVE' } }),
                axios.get(CORPORATES_API, { headers: getAuthHeaders(), params: { limit: 1, status: 'INACTIVE' } }),
                axios.get(CORPORATES_API, { headers: getAuthHeaders(), params: { limit: 1, contract_expiring_days: 90 } })
            ]);
            setStats({ 
                total: allRes.data.pagination?.total || 0, 
                active: activeRes.data.pagination?.total || 0, 
                pipeline: pipelineRes.data.pagination?.total || 0, 
                expiring: expiringRes.data.pagination?.total || 0 
            });
        } catch (err) { console.error('Error fetching stats:', err); }
    };

    const fetchSchema = async () => { 
        try { 
            const response = await axios.get(`${MASTERS_API}/tenants/structure`, { headers: getAuthHeaders() }); 
            if (response.data.success) { 
                setTableStructure(response.data); 
                setShowSchemaModal(true); 
            } 
        } catch (err) { 
            setToast({ message: 'Failed to fetch schema', type: 'error' }); 
        } 
    };

    // ==================== EFFECTS ====================
    
    useEffect(() => { fetchLookups(); fetchStats(); fetchDynamicFields(); }, []);
    useEffect(() => { fetchCorporates(1); setCurrentPage(1); }, [activeTab, statusFilter, industryFilter]);
    useEffect(() => { const timer = setTimeout(() => { setCurrentPage(1); fetchCorporates(1); }, 300); return () => clearTimeout(timer); }, [searchQuery]);

    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    // ==================== CONTACT HANDLERS ====================
    
    const addContact = () => {
        setContacts([...contacts, { full_name: '', email: '', phone: '', mobile: '', designation: '', department: '', is_primary: false, is_decision_maker: false }]);
    };

    const removeContact = (index) => {
        if (contacts.length > 1) {
            const newContacts = contacts.filter((_, i) => i !== index);
            if (contacts[index].is_primary && newContacts.length > 0) {
                newContacts[0].is_primary = true;
            }
            setContacts(newContacts);
        }
    };

    const updateContact = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        if (field === 'is_primary' && value) {
            newContacts.forEach((c, i) => { if (i !== index) c.is_primary = false; });
        }
        setContacts(newContacts);
    };

    // ==================== AI VALIDATION ====================
    
    const runAIValidation = async () => {
        setAiValidating(true);
        const issues = [];
        
        try {
            // 1. Check if corporate name already exists (client-side check)
            const nameToCheck = formData.corporate_legal_name?.trim().toLowerCase();
            const existingCorp = corporates.find(c => 
                c.corporate_legal_name?.trim().toLowerCase() === nameToCheck &&
                c.tenant_id !== selectedCorporate?.tenant_id // Exclude current record when editing
            );
            
            if (existingCorp) {
                issues.push({
                    field: 'corporate_legal_name',
                    severity: 'error',
                    message: `Corporate "${existingCorp.corporate_legal_name}" already exists with code ${existingCorp.tenant_code}`
                });
            }
            
            // 2. Check subdomain uniqueness (only for new records)
            if (!selectedCorporate) {
                const subdomainExists = corporates.find(c => 
                    c.subdomain?.toLowerCase() === formData.subdomain?.toLowerCase()
                );
                if (subdomainExists) {
                    issues.push({
                        field: 'subdomain',
                        severity: 'error',
                        message: `Subdomain "${formData.subdomain}" is already taken by ${subdomainExists.corporate_legal_name}`
                    });
                }
                
                // Check tenant_code uniqueness
                const codeExists = corporates.find(c => 
                    c.tenant_code?.toLowerCase() === formData.tenant_code?.toLowerCase()
                );
                if (codeExists) {
                    issues.push({
                        field: 'tenant_code',
                        severity: 'error',
                        message: `Corporate code "${formData.tenant_code}" is already used by ${codeExists.corporate_legal_name}`
                    });
                }
            }
            
            // 3. Validate corporate name format based on country
            const name = formData.corporate_legal_name?.toLowerCase() || '';
            if (formData.country === 'India') {
                const validSuffixes = ['private limited', 'pvt ltd', 'pvt. ltd.', 'limited', 'ltd', 'llp', 'opc', 'llp.'];
                const hasSuffix = validSuffixes.some(s => name.includes(s));
                if (!hasSuffix && name.length > 0) {
                    issues.push({
                        field: 'corporate_legal_name',
                        severity: 'warning',
                        message: 'Indian company names typically end with Private Limited, LLP, or similar suffix',
                        suggestion: `${formData.corporate_legal_name} Private Limited`
                    });
                }
            }
            
            if (formData.country === 'USA') {
                const validSuffixes = ['inc', 'inc.', 'incorporated', 'llc', 'corp', 'corporation', 'co', 'company'];
                const hasSuffix = validSuffixes.some(s => name.includes(s));
                if (!hasSuffix && name.length > 0) {
                    issues.push({
                        field: 'corporate_legal_name',
                        severity: 'warning',
                        message: 'US company names typically end with Inc, LLC, Corp, etc.',
                        suggestion: `${formData.corporate_legal_name}, Inc.`
                    });
                }
            }
            
            // 4. Validate PAN format (India)
            const pan = formData.registration_details?.pan;
            if (pan && pan.length > 0 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
                issues.push({
                    field: 'PAN',
                    severity: 'error',
                    message: 'Invalid PAN format. Expected: AAAAA9999A (5 letters, 4 digits, 1 letter)'
                });
            }
            
            // 5. Validate GSTIN format (India)
            const gstin = formData.registration_details?.gstin;
            if (gstin && gstin.length > 0 && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.toUpperCase())) {
                issues.push({
                    field: 'GSTIN',
                    severity: 'error',
                    message: 'Invalid GSTIN format. Expected: 22AAAAA0000A1Z5 (15 characters)'
                });
            }
            
            // 6. Validate CIN format (India)
            const cin = formData.registration_details?.cin;
            if (cin && cin.length > 0 && cin.length !== 21) {
                issues.push({
                    field: 'CIN',
                    severity: 'warning',
                    message: 'CIN should be exactly 21 characters long'
                });
            }
            
            // 7. Contract date validation
            if (formData.contract_start_date && formData.contract_end_date) {
                if (new Date(formData.contract_end_date) <= new Date(formData.contract_start_date)) {
                    issues.push({
                        field: 'Contract Dates',
                        severity: 'error',
                        message: 'Contract end date must be after start date'
                    });
                }
            }
            
            // 8. Check at least one contact with email
            const validContacts = contacts.filter(c => c.full_name && c.email);
            if (validContacts.length === 0) {
                issues.push({
                    field: 'Contacts',
                    severity: 'warning',
                    message: 'No valid contacts added. Consider adding at least one contact with name and email.'
                });
            }
            
            // Set results
            const hasErrors = issues.some(i => i.severity === 'error');
            setAiValidationResults({ 
                issues, 
                valid: !hasErrors,
                checkedAt: new Date().toISOString()
            });
            setShowAIValidationModal(true);
            
        } catch (err) {
            console.error('AI Validation error:', err);
            setAiValidationResults({ issues, valid: issues.length === 0 });
            setShowAIValidationModal(true);
        } finally {
            setAiValidating(false);
        }
    };

    // ==================== CRUD HANDLERS ====================
    
    const handleAdd = () => {
        setSelectedCorporate(null);
        setFormData({
            tenant_code: '',
            subdomain: '',
            corporate_legal_name: '',
            corporate_type: '',
            industry_type: '',
            country: 'India',
            broker_id: '',
            address: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
            registration_details: { pan: '', gstin: '', cin: '', tan: '' },
            benefitnest_manager: { name: '', email: '', phone: '' },
            contract_start_date: '',
            contract_end_date: '',
            contract_value: '',
            compliance_status: 'PENDING',
            tags: [],
            internal_notes: ''
        });
        setContacts([{ full_name: '', email: '', phone: '', mobile: '', designation: '', department: '', is_primary: true, is_decision_maker: false }]);
        setShowForm(true);
    };

    const handleView = (corporate) => { 
        setSelectedCorporate(corporate); 
        setShowViewModal(true); 
    };

    const handleEdit = (corporate) => {
        setSelectedCorporate(corporate);
        setFormData({
            tenant_code: corporate.tenant_code || '',
            subdomain: corporate.subdomain || '',
            corporate_legal_name: corporate.corporate_legal_name || '',
            corporate_type: corporate.corporate_type || '',
            industry_type: corporate.industry_type || '',
            country: corporate.country || 'India',
            broker_id: corporate.broker_id || '',
            address: corporate.address || { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
            registration_details: corporate.registration_details || { pan: '', gstin: '', cin: '', tan: '' },
            benefitnest_manager: corporate.benefitnest_manager || { name: '', email: '', phone: '' },
            contract_start_date: corporate.contract_start_date?.split('T')[0] || '',
            contract_end_date: corporate.contract_end_date?.split('T')[0] || '',
            contract_value: corporate.contract_value || '',
            compliance_status: corporate.compliance_status || 'PENDING',
            tags: corporate.tags || [],
            internal_notes: corporate.internal_notes || '',
            status: corporate.status || 'ACTIVE'
        });
        
        // Load existing contacts
        const existingContacts = corporate.contact_details?.contacts || [];
        setContacts(existingContacts.length > 0 ? existingContacts : [{ full_name: '', email: '', phone: '', mobile: '', designation: '', department: '', is_primary: true, is_decision_maker: false }]);
        setShowForm(true);
    };

    const handleDeleteClick = (corporate) => { 
        setSelectedCorporate(corporate); 
        setShowDeleteModal(true); 
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete(`${CORPORATES_API}/${selectedCorporate.tenant_id}`, { headers: getAuthHeaders() });
            if (response.data.success) {
                setToast({ message: 'Corporate deleted successfully!', type: 'success' });
                setShowDeleteModal(false);
                setSelectedCorporate(null);
                fetchCorporates(currentPage);
                fetchStats();
            }
        } catch (err) {
            console.error('Delete error:', err);
            setToast({ message: err.response?.data?.message || 'Failed to delete corporate', type: 'error' });
        }
    };

    const handleSave = async (skipAI = false) => {
        // Validate required fields
        if (!formData.tenant_code || !formData.subdomain || !formData.corporate_legal_name) {
            setToast({ message: 'Please fill all required fields (Code, Subdomain, Legal Name)', type: 'error' });
            return;
        }

        // Run AI validation first (unless skipped) - WORKS FOR BOTH CREATE AND UPDATE
        if (!skipAI) {
            await runAIValidation();
            return;
        }

        try {
            setSavingRecord(true);
            
            const validContacts = contacts.filter(c => c.full_name && c.email);

            // Helper to clean empty strings from nested objects
            const cleanPayload = (obj) => {
                const cleaned = {};
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    if (value === undefined || value === null || typeof value === 'function') {
                        return; // Skip
                    }
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        // Recursively clean nested objects
                        const cleanedNested = cleanPayload(value);
                        if (Object.keys(cleanedNested).length > 0) {
                            cleaned[key] = cleanedNested;
                        }
                    } else if (Array.isArray(value)) {
                        // Keep arrays as-is
                        cleaned[key] = value;
                    } else if (value !== '') {
                        // Only include non-empty strings
                        cleaned[key] = value;
                    }
                });
                return cleaned;
            };

            // Build payload from formData - put contacts at root level, not nested
            const payload = cleanPayload({
                ...formData,
                contacts: validContacts
            });
            
            // Remove the nested contact_details if it exists
            delete payload.contact_details;

            // Fields to ALWAYS remove (system managed or not in DB)
            const ALWAYS_REMOVE = [
                'tenant_id',
                'tenant_code', 
                'subdomain',
                'created_at',
                'created_by',
                'updated_at',
                'updated_by',
                'last_activity_at',
                'health_score',
                'health_factors',
                'portal_url',
                'documents'
            ];

            if (selectedCorporate) {
                // UPDATE: Remove frozen/system fields
                ALWAYS_REMOVE.forEach(field => delete payload[field]);

                console.log('=== UPDATE PAYLOAD ===');
                console.log('Tenant ID:', selectedCorporate.tenant_id);
                console.log('Payload:', JSON.stringify(payload, null, 2));

                const response = await axios.put(
                    `${CORPORATES_API}/${selectedCorporate.tenant_id}`,
                    payload,
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    setToast({ message: 'Corporate updated successfully!', type: 'success' });
                    setShowForm(false);
                    setShowAIValidationModal(false);
                    fetchCorporates(currentPage);
                    fetchStats();
                } else {
                    throw new Error(response.data.message || 'Update failed - server returned false');
                }
            } else {
                // CREATE: Remove system fields but keep tenant_code and subdomain
                ['tenant_id', 'created_at', 'created_by', 'updated_at', 'updated_by', 'last_activity_at', 'health_score', 'health_factors'].forEach(field => delete payload[field]);
                
                // contacts already in payload from above
                payload.ai_scan_skipped = skipAI;
                payload.ai_observations = skipAI ? null : aiValidationResults;

                console.log('=== CREATE PAYLOAD ===');
                console.log('Payload:', JSON.stringify(payload, null, 2));

                const response = await axios.post(
                    CORPORATES_API,
                    payload,
                    { headers: getAuthHeaders() }
                );

                if (response.data.success) {
                    setToast({ message: 'Corporate created successfully!', type: 'success' });
                    setShowForm(false);
                    setShowAIValidationModal(false);
                    fetchCorporates(1);
                    fetchStats();
                } else {
                    throw new Error(response.data.message || 'Create failed - server returned false');
                }
            }
        } catch (err) {
            console.error('=== SAVE ERROR ===');
            console.error('Error:', err);
            console.error('Error message:', err.message);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save corporate';
            setToast({ message: errorMsg, type: 'error' });
        } finally {
            setSavingRecord(false);
        }
    };

    // ==================== ADD FIELD HANDLER ====================
    
    const handleAddField = async () => {
        try {
            if (!newField.column_name) { 
                setToast({ message: 'Column name is required', type: 'error' }); 
                return; 
            }
            const response = await axios.post(`${MASTERS_API}/tenants/add-field`, newField, { headers: getAuthHeaders() });
            if (response.data.success) { 
                setToast({ message: response.data.message || 'Field added successfully', type: 'success' }); 
                setShowAddFieldModal(false); 
                setNewField({ column_name: '', data_type: 'text', is_nullable: true, default_value: '', description: '' }); 
                fetchDynamicFields();
                fetchSchema();
            } else if (response.data.sql) {
                setToast({ message: 'Run SQL manually in Supabase', type: 'warning' });
                alert(`Run this SQL in Supabase:\n\n${response.data.sql}`);
            }
        } catch (err) { 
            setToast({ message: err.response?.data?.message || 'Failed to add field', type: 'error' }); 
        }
    };

    // ==================== PORTAL HANDLERS ====================
    
    const checkAndOpenPortal = async (corporate) => {
        try {
            // Step 1: Try to check if portal exists
            try {
                const response = await axios.get(`${CORPORATES_API}/${corporate.tenant_id}/check-portal`, { headers: getAuthHeaders() });
                
                if (response.data.success && response.data.data.portal_exists) {
                    // Portal exists, open it
                    const portalUrl = response.data.data.portal_url || `https://${corporate.subdomain}.benefitnest.space`;
                    window.open(portalUrl, '_blank');
                    return;
                }
            } catch (checkErr) {
                console.log('Check portal endpoint not available, proceeding with creation');
            }

            // Step 2: If portal doesn't exist, prompt to create it
            if (confirm(`Portal doesn't exist for ${corporate.corporate_legal_name}. Create it now?`)) {
                try {
                    const createResponse = await axios.post(`${CORPORATES_API}/${corporate.tenant_id}/create-portal`, {}, { headers: getAuthHeaders() });
                    
                    if (createResponse.data.success) {
                        setToast({ message: 'Portal created successfully!', type: 'success' });
                        const portalUrl = createResponse.data.data?.portal_url || `https://${corporate.subdomain}.benefitnest.space`;
                        
                        // Wait a moment for the portal to be ready, then open
                        setTimeout(() => {
                            window.open(portalUrl, '_blank');
                            fetchCorporates(currentPage);
                        }, 1000);
                        return;
                    } else {
                        throw new Error(createResponse.data.message || 'Failed to create portal');
                    }
                } catch (createErr) {
                    console.log('Create portal endpoint not available, trying direct URL');
                }
            }

            // Step 3: Fallback - open the URL directly (portal may already be deployed)
            const fallbackUrl = corporate.portal_url || `https://${corporate.subdomain}.benefitnest.space`;
            window.open(fallbackUrl, '_blank');
        } catch (err) {
            console.error('Portal opening error:', err);
            setToast({ message: 'Failed to open portal', type: 'error' });
        }
    };

    // ==================== DOWNLOAD HANDLERS ====================
    
    const handleDownloadTemplate = async () => { 
        const templateColumns = ['tenant_code', 'subdomain', 'corporate_legal_name', 'corporate_type', 'industry_type', 'country', 'status']; 
        const sampleRow = {}; 
        templateColumns.forEach(col => { sampleRow[col] = ''; }); 
        await downloadExcel([sampleRow], 'corporates_template.xlsx', templateColumns); 
        setToast({ message: 'Template downloaded!', type: 'success' }); 
    };

    const handleDownloadData = async () => { 
        try { 
            setLoading(true); 
            const response = await axios.get(CORPORATES_API, { headers: getAuthHeaders(), params: { limit: 10000 } }); 
            if (response.data.success && response.data.data) { 
                await downloadExcel(response.data.data, `corporates_data_${new Date().toISOString().split('T')[0]}.xlsx`); 
                setToast({ message: `Downloaded ${response.data.data.length} records!`, type: 'success' }); 
            } 
        } catch (err) { 
            setToast({ message: 'Failed to download data', type: 'error' }); 
        } finally { 
            setLoading(false); 
        } 
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0]; 
        if (!file) return;
        setUploadingBulk(true); 
        setShowUploadModal(false);
        try {
            const jsonData = await parseExcel(file);
            if (!jsonData.length) { 
                setToast({ message: 'File is empty', type: 'error' }); 
                setUploadingBulk(false); 
                return; 
            }
            let success = 0, failed = 0;
            for (const row of jsonData) { 
                try { 
                    await axios.post(CORPORATES_API, row, { headers: getAuthHeaders() }); 
                    success++; 
                } catch (err) { 
                    failed++; 
                } 
            }
            setToast({ message: `Uploaded ${success} of ${jsonData.length} corporates${failed > 0 ? ` (${failed} failed)` : ''}`, type: failed > 0 ? 'warning' : 'success' });
            fetchCorporates(1); 
            fetchStats();
        } catch (err) { 
            setToast({ message: 'Upload failed', type: 'error' }); 
        } finally { 
            setUploadingBulk(false); 
            e.target.value = ''; 
        }
    };

    // ==================== RENDER HELPERS ====================
    
    const renderHealthBadge = (score) => { 
        if (score >= 80) return <Badge variant="success">{score}</Badge>; 
        if (score >= 60) return <Badge variant="warning">{score}</Badge>; 
        return <Badge variant="danger">{score || 0}</Badge>; 
    };
    
    const renderStatusBadge = (status) => { 
        const variants = { 'ACTIVE': 'success', 'INACTIVE': 'default', 'ON_HOLD': 'warning', 'SUSPENDED': 'danger' }; 
        return <Badge variant={variants[status] || 'default'}>{status || 'N/A'}</Badge>; 
    };

    // ==================== RENDER ====================
    
    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.gray[50] }}>
            {/* Header */}
            <header style={{ backgroundColor: 'white', borderBottom: `1px solid ${colors.gray[200]}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '28px' }}>📦</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: colors.gray[900] }}>BenefitNest</span>
                    </div>
                    <button onClick={() => router.push('/admin/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.gray[600], background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                        ← Dashboard
                    </button>
                </div>
                <Button variant="danger" icon="🚪" onClick={() => { 
                    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; 
                    localStorage.removeItem('admin_token'); 
                    router.push('/admin/'); 
                }}>Logout</Button>
            </header>

            {/* Main Content */}
            <main style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
                {/* Title and Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.gray[900], margin: 0 }}>Corporate Management</h1>
                        <p style={{ color: colors.gray[500], marginTop: '4px' }}>Manage corporate clients, portals, and contacts</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Button variant="danger" icon="📤" onClick={() => setShowUploadModal(true)} loading={uploadingBulk}>Bulk Upload</Button>
                        <Button variant="primary" icon="➕" onClick={handleAdd}>Add New</Button>
                        <Button variant="outline" icon="📥" onClick={handleDownloadTemplate}>Template</Button>
                        <Button variant="cyan" icon="📊" onClick={handleDownloadData}>Download</Button>
                        <Button variant="warning" icon="➕" onClick={() => setShowAddFieldModal(true)}>Add Field</Button>
                        <Button variant="outline" icon="🗂️" onClick={fetchSchema}>Schema</Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <StatsCard value={stats.total} label="Total Corporates" icon="🏢" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                    <StatsCard value={stats.active} label="Active" icon="✅" active={activeTab === 'active'} onClick={() => setActiveTab('active')} />
                    <StatsCard value={stats.pipeline} label="Pipeline" icon="🚀" active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} />
                    <StatsCard value={stats.expiring} label="Expiring Soon" icon="⏰" active={activeTab === 'expiring'} onClick={() => setActiveTab('expiring')} />
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}`, paddingBottom: '0' }}>
                    {[
                        { key: 'all', label: 'All Corporates', icon: '📋', count: stats.total },
                        { key: 'active', label: 'Active', icon: '✅', count: stats.active },
                        { key: 'pipeline', label: 'Pipeline', icon: '🚀', count: stats.pipeline },
                        { key: 'expiring', label: 'Expiring', icon: '⏰', count: stats.expiring }
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', 
                            color: activeTab === tab.key ? colors.primary : colors.gray[600], backgroundColor: 'transparent', border: 'none', 
                            borderBottom: `2px solid ${activeTab === tab.key ? colors.primary : 'transparent'}`, cursor: 'pointer', marginBottom: '-1px' 
                        }}>
                            <span>{tab.icon}</span>
                            {tab.label}
                            <span style={{ backgroundColor: activeTab === tab.key ? colors.primaryLight : colors.gray[100], padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', border: `1px solid ${colors.gray[200]}`, display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <input type="text" placeholder="Search by name, code, subdomain, industry..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                            style={{ width: '100%', padding: '10px 14px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                    </div>
                    <div style={{ minWidth: '150px' }}>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} 
                            style={{ width: '100%', padding: '10px 14px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}>
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="ON_HOLD">On Hold</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>
                    <div style={{ minWidth: '200px' }}>
                        <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} 
                            style={{ width: '100%', padding: '10px 14px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}>
                            <option value="">All Industries</option>
                            {industryTypes.map(ind => <option key={ind.id || ind.code || ind.name} value={ind.name}>{ind.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${colors.gray[200]}`, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: colors.gray[50] }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Logo</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Code</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Corporate</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Industry</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Health</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Portal</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: colors.gray[600], textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" style={{ padding: '60px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                                        <div style={{ color: colors.gray[500] }}>Loading corporates...</div>
                                    </td></tr>
                                ) : corporates.length === 0 ? (
                                    <tr><td colSpan="8" style={{ padding: '60px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                                        <div style={{ color: colors.gray[500] }}>No corporates found</div>
                                        <Button variant="primary" icon="➕" onClick={handleAdd} style={{ marginTop: '16px' }}>Add First Corporate</Button>
                                    </td></tr>
                                ) : corporates.map(corp => (
                                    <tr key={corp.tenant_id} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: colors.gray[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', overflow: 'hidden' }}>
                                                {corp.branding_config?.logo_url ? (
                                                    <img src={corp.branding_config.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : '🏢'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: colors.gray[900] }}>{corp.tenant_code}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: colors.gray[900] }}>{corp.corporate_legal_name}</div>
                                            <div style={{ fontSize: '12px', color: colors.gray[500] }}>{corp.subdomain}.benefitnest.space</div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px', color: colors.gray[600] }}>{corp.industry_type || '—'}</td>
                                        <td style={{ padding: '12px 16px' }}>{renderStatusBadge(corp.status)}</td>
                                        <td style={{ padding: '12px 16px' }}>{renderHealthBadge(corp.health_score)}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {corp.subdomain && (
                                                <Button size="sm" variant="outline" icon="🔗" onClick={() => checkAndOpenPortal(corp)}>Open</Button>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                <Button size="sm" variant="outline" icon="👁️" onClick={() => handleView(corp)}>View</Button>
                                                <Button size="sm" variant="cyan" icon="✏️" onClick={() => handleEdit(corp)}>Edit</Button>
                                                <Button size="sm" variant="danger" icon="🗑️" onClick={() => handleDeleteClick(corp)}>Delete</Button>
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
                                <Button variant="outline" size="sm" onClick={() => { const p = Math.max(1, currentPage - 1); setCurrentPage(p); fetchCorporates(p); }} disabled={currentPage === 1}>← Prev</Button>
                                <Button variant="outline" size="sm" onClick={() => { const p = Math.min(totalPages, currentPage + 1); setCurrentPage(p); fetchCorporates(p); }} disabled={currentPage === totalPages}>Next →</Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ==================== MODALS ==================== */}

            {/* Add/Edit Form Modal */}
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={selectedCorporate ? 'Edit Corporate' : 'Add New Corporate'} icon={selectedCorporate ? '✏️' : '➕'} size="xl">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Basic Information */}
                    <div>
                        <SectionHeader title="Basic Information" icon="🏢" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <Input label="Corporate Code" required value={formData.tenant_code || ''} onChange={(e) => setFormData({ ...formData, tenant_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} placeholder="e.g., CORP001" disabled={!!selectedCorporate} hint="Unique identifier (cannot be changed)" />
                            <Input label="Subdomain" required value={formData.subdomain || ''} onChange={(e) => { const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''); setFormData({ ...formData, subdomain: val, portal_url: `https://${val}.benefitnest.space` }); }} placeholder="e.g., acmecorp" disabled={!!selectedCorporate} hint="Portal URL prefix" />
                            <Input label="Corporate Legal Name" required value={formData.corporate_legal_name || ''} onChange={(e) => setFormData({ ...formData, corporate_legal_name: e.target.value })} placeholder="Full legal company name" />
                            <Select label="Corporate Type" options={corporateTypes.map(t => ({ value: t.name, label: t.name }))} value={formData.corporate_type || ''} onChange={(e) => setFormData({ ...formData, corporate_type: e.target.value })} />
                            <Select label="Industry Type" options={industryTypes.map(t => ({ value: t.name, label: t.name }))} value={formData.industry_type || ''} onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })} />
                            <Select label="Country" required options={[{ value: 'India', label: 'India' }, { value: 'USA', label: 'USA' }, { value: 'UK', label: 'UK' }, { value: 'UAE', label: 'UAE' }, { value: 'Singapore', label: 'Singapore' }]} value={formData.country || 'India'} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            <Select label="Broker" options={brokers.map(b => ({ value: b.broker_id, label: b.broker_name }))} value={formData.broker_id || ''} onChange={(e) => setFormData({ ...formData, broker_id: e.target.value })} />
                            {selectedCorporate && <Select label="Status" options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'ON_HOLD', label: 'On Hold' }, { value: 'SUSPENDED', label: 'Suspended' }]} value={formData.status || 'ACTIVE'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <SectionHeader title="Registered Address" icon="📍" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div style={{ gridColumn: 'span 2' }}><Input label="Address Line 1" value={formData.address?.line1 || ''} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line1: e.target.value } })} placeholder="Building, Street" /></div>
                            <div style={{ gridColumn: 'span 2' }}><Input label="Address Line 2" value={formData.address?.line2 || ''} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line2: e.target.value } })} placeholder="Area, Landmark" /></div>
                            <Input label="City" value={formData.address?.city || ''} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} />
                            <Input label="State" value={formData.address?.state || ''} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} />
                            <Input label="PIN/ZIP Code" value={formData.address?.pincode || ''} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })} />
                        </div>
                    </div>

                    {/* Registration Details */}
                    <div>
                        <SectionHeader title="Registration Details" icon="📋" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <Input label="PAN" value={formData.registration_details?.pan || ''} onChange={(e) => setFormData({ ...formData, registration_details: { ...formData.registration_details, pan: e.target.value.toUpperCase() } })} placeholder="AAAAA9999A" hint="10-character PAN" />
                            <Input label="GSTIN" value={formData.registration_details?.gstin || ''} onChange={(e) => setFormData({ ...formData, registration_details: { ...formData.registration_details, gstin: e.target.value.toUpperCase() } })} placeholder="22AAAAA0000A1Z5" hint="15-character GSTIN" />
                            <Input label="CIN" value={formData.registration_details?.cin || ''} onChange={(e) => setFormData({ ...formData, registration_details: { ...formData.registration_details, cin: e.target.value.toUpperCase() } })} placeholder="U12345MH2020PTC123456" hint="21-character CIN" />
                            <Input label="TAN" value={formData.registration_details?.tan || ''} onChange={(e) => setFormData({ ...formData, registration_details: { ...formData.registration_details, tan: e.target.value.toUpperCase() } })} placeholder="AAAA99999A" />
                        </div>
                    </div>

                    {/* Contact Persons */}
                    <div>
                        <SectionHeader title="Contact Persons" icon="👥" action={<Button variant="outline" size="sm" icon="➕" onClick={addContact}>Add Contact</Button>} />
                        {contacts.map((contact, index) => (
                            <div key={index} style={{ backgroundColor: contact.is_primary ? colors.primaryLight : colors.gray[50], padding: '16px', borderRadius: '12px', marginBottom: '12px', border: contact.is_primary ? `2px solid ${colors.primary}` : `1px solid ${colors.gray[200]}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: '600', color: colors.gray[700] }}>Contact #{index + 1}</span>
                                        {contact.is_primary && <Badge variant="success">Primary</Badge>}
                                        {contact.is_decision_maker && <Badge variant="info">Decision Maker</Badge>}
                                    </div>
                                    {contacts.length > 1 && <Button variant="ghost" size="xs" icon="🗑️" onClick={() => removeContact(index)}>Remove</Button>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                    <Input label="Full Name" required value={contact.full_name} onChange={(e) => updateContact(index, 'full_name', e.target.value)} placeholder="John Doe" />
                                    <Input label="Email" required type="email" value={contact.email} onChange={(e) => updateContact(index, 'email', e.target.value)} placeholder="john@company.com" />
                                    <Input label="Phone" value={contact.phone} onChange={(e) => updateContact(index, 'phone', e.target.value)} placeholder="+91 98765 43210" />
                                    <Input label="Mobile" value={contact.mobile} onChange={(e) => updateContact(index, 'mobile', e.target.value)} placeholder="+91 98765 43210" />
                                    <Input label="Designation" value={contact.designation} onChange={(e) => updateContact(index, 'designation', e.target.value)} placeholder="HR Manager" />
                                    <Input label="Department" value={contact.department} onChange={(e) => updateContact(index, 'department', e.target.value)} placeholder="Human Resources" />
                                </div>
                                <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                                    <Checkbox label="Primary Contact" checked={contact.is_primary} onChange={(e) => updateContact(index, 'is_primary', e.target.checked)} />
                                    <Checkbox label="Decision Maker" checked={contact.is_decision_maker} onChange={(e) => updateContact(index, 'is_decision_maker', e.target.checked)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contract Details */}
                    <div>
                        <SectionHeader title="Contract Details" icon="📄" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <Input label="Contract Start Date" type="date" value={formData.contract_start_date || ''} onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })} />
                            <Input label="Contract End Date" type="date" value={formData.contract_end_date || ''} onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })} />
                            <Input label="Contract Value (₹)" type="number" value={formData.contract_value || ''} onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })} placeholder="500000" hint="Annual contract value" />
                            <Select label="Compliance Status" options={[{ value: 'PENDING', label: 'Pending' }, { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'COMPLIANT', label: 'Compliant' }, { value: 'NON_COMPLIANT', label: 'Non-Compliant' }]} value={formData.compliance_status || 'PENDING'} onChange={(e) => setFormData({ ...formData, compliance_status: e.target.value })} />
                        </div>
                    </div>

                    {/* BenefitNest Manager */}
                    <div>
                        <SectionHeader title="BenefitNest Account Manager" icon="👤" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <Input label="Manager Name" value={formData.benefitnest_manager?.name || ''} onChange={(e) => setFormData({ ...formData, benefitnest_manager: { ...formData.benefitnest_manager, name: e.target.value } })} placeholder="Internal account manager" />
                            <Input label="Manager Email" type="email" value={formData.benefitnest_manager?.email || ''} onChange={(e) => setFormData({ ...formData, benefitnest_manager: { ...formData.benefitnest_manager, email: e.target.value } })} />
                            <Input label="Manager Phone" value={formData.benefitnest_manager?.phone || ''} onChange={(e) => setFormData({ ...formData, benefitnest_manager: { ...formData.benefitnest_manager, phone: e.target.value } })} />
                        </div>
                    </div>

                    {/* Dynamic Fields (new columns) */}
                    {dynamicFields.length > 0 && (
                        <div>
                            <SectionHeader title="Additional Fields" icon="➕" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                {dynamicFields.map(field => (
                                    <Input key={field} label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={formData[field] || ''} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Internal Notes */}
                    <div>
                        <SectionHeader title="Internal Notes" icon="📝" />
                        <TextArea value={formData.internal_notes || ''} onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })} placeholder="Any internal notes about this corporate (not visible to client)..." style={{ minHeight: '100px' }} />
                    </div>
                </div>

                {/* Form Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${colors.gray[200]}` }}>
                    <div style={{ fontSize: '12px', color: colors.gray[500] }}>
                        {selectedCorporate ? `Editing: ${selectedCorporate.corporate_legal_name}` : 'Fields marked with * are required'}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button variant="primary" onClick={() => handleSave(false)} disabled={savingRecord} loading={savingRecord || aiValidating}>
                            {aiValidating ? '🤖 Validating...' : (selectedCorporate ? 'Update Corporate' : 'Create Corporate')}
                        </Button>
                    </div>
                </div>
            </Modal>

{/* AI Validation Results Modal */}
<Modal
  isOpen={showAIValidationModal}
  onClose={() => setShowAIValidationModal(false)}
  title="AI Validation Results"
  icon="🤖"
  size="lg"
>
  {aiValidationResults?.valid === true &&
  (aiValidationResults.issues?.length ?? 0) === 0 ? (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: colors.success,
          marginBottom: '8px'
        }}
      >
        All Validations Passed!
      </h3>
      <p style={{ color: colors.gray[500] }}>
        No issues found. The corporate data looks good.
      </p>
    </div>
  ) : (
    <>
      <div
        style={{
          backgroundColor: colors.warningLight,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}
      >
        <div
          style={{
            fontWeight: '600',
            color: colors.warning,
            marginBottom: '4px'
          }}
        >
          ⚠️ Found {aiValidationResults.issues?.length || 0} potential issue(s)
        </div>
        <div style={{ fontSize: '13px', color: colors.gray[600] }}>
          Review the issues below. You can fix them or skip validation.
        </div>
      </div>

      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {aiValidationResults.issues?.map((issue, i) => (
          <div
            key={i}
            style={{
              padding: '14px',
              backgroundColor: colors.gray[50],
              borderRadius: '8px',
              marginBottom: '10px',
              borderLeft: `4px solid ${
                issue.severity === 'error'
                  ? colors.danger
                  : colors.warning
              }`
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px'
              }}
            >
              <Badge
                variant={
                  issue.severity === 'error' ? 'danger' : 'warning'
                }
              >
                {issue.severity?.toUpperCase() || 'WARNING'}
              </Badge>
              <strong style={{ color: colors.gray[800] }}>
                {issue.field
                  ?.replace(/_/g, ' ')
                  .replace(/\./g, ' → ')}
              </strong>
            </div>

            <p
              style={{
                margin: '0 0 6px 0',
                color: colors.gray[700],
                fontSize: '14px'
              }}
            >
              {issue.message}
            </p>

            {issue.suggestion && (
              <div
                style={{
                  fontSize: '13px',
                  color: colors.success,
                  backgroundColor: colors.successLight,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  marginTop: '8px'
                }}
              >
                💡 <strong>Suggestion:</strong> {issue.suggestion}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )}

  <div
    style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '24px',
      paddingTop: '16px',
      borderTop: `1px solid ${colors.gray[200]}`
    }}
  >
    <Button
      variant="outline"
      onClick={() => setShowAIValidationModal(false)}
    >
      ← Go Back & Fix
    </Button>

    {/* Skip button - enabled only if there are issues, disabled if no issues */}
    <Button
      variant="warning"
      onClick={() => handleSave(true)}
      disabled={savingRecord || (aiValidationResults.issues?.length === 0)}
      loading={savingRecord}
    >
      Skip & {selectedCorporate ? 'Update' : 'Create'} Anyway
    </Button>

    {/* Create/Update button - enabled only if no issues, disabled if there are issues */}
    <Button
      variant="success"
      onClick={() => handleSave(true)}
      disabled={savingRecord || (aiValidationResults.issues?.length > 0)}
      loading={savingRecord}
    >
      ✓ {selectedCorporate ? 'Update' : 'Create'} Corporate
    </Button>
  </div>
</Modal>

            {/* View Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Corporate Details" icon="👁️" size="lg">
                {selectedCorporate && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                        {Object.entries(selectedCorporate).filter(([key]) => !SYSTEM_FIELDS.includes(key)).map(([key, value]) => (
                            <div key={key} style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: colors.gray[500], textTransform: 'uppercase', marginBottom: '4px' }}>{key.replace(/_/g, ' ')}</div>
                                <div style={{ fontSize: '14px', color: colors.gray[900], wordBreak: 'break-word' }}>
                                    {value === null || value === undefined ? '—' : typeof value === 'object' ? <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>{JSON.stringify(value, null, 2)}</pre> : String(value)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <Button variant="cyan" icon="✏️" onClick={() => { setShowViewModal(false); handleEdit(selectedCorporate); }}>Edit</Button>
                    <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                </div>
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Bulk Upload Corporates" icon="📤" size="md">
                <p style={{ color: colors.gray[600], marginBottom: '20px' }}>Upload an Excel file with corporate data. Download the template first to see the required format.</p>
                <div style={{ backgroundColor: colors.cyanLight, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: '600', color: colors.cyan }}>📥 Download Template First</div>
                            <div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>Get the Excel template with all required columns</div>
                        </div>
                        <Button variant="cyan" size="sm" onClick={handleDownloadTemplate}>Download</Button>
                    </div>
                </div>
                <input type="file" accept=".xlsx,.xls" onChange={handleBulkUpload} style={{ display: 'none' }} id="bulk-upload-input" />
                <label htmlFor="bulk-upload-input" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', border: `2px dashed ${colors.gray[300]}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: colors.gray[50], transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                    <div style={{ fontWeight: '600', color: colors.gray[700] }}>Click to select Excel file</div>
                    <div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>Supports .xlsx, .xls files</div>
                </label>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete" icon="⚠️" size="sm">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
                    <p style={{ color: colors.gray[600], marginBottom: '8px' }}>Are you sure you want to delete</p>
                    <p style={{ fontWeight: '700', color: colors.gray[900], fontSize: '18px' }}>{selectedCorporate?.corporate_legal_name}?</p>
                    <p style={{ color: colors.danger, fontSize: '13px', marginTop: '16px' }}>This action cannot be undone.</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>Delete Corporate</Button>
                </div>
            </Modal>

            {/* Schema Modal */}
            <Modal isOpen={showSchemaModal} onClose={() => setShowSchemaModal(false)} title="Tenants Table Schema" icon="🗂️" size="lg">
                {tableStructure && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '16px', backgroundColor: colors.primaryLight, borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: colors.primary }}>{tableStructure.columns?.length || 0}</div>
                                <div style={{ fontSize: '12px', color: colors.gray[600] }}>Total Columns</div>
                            </div>
                            <div style={{ padding: '16px', backgroundColor: colors.successLight, borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: colors.success }}>{tableStructure.record_count || 0}</div>
                                <div style={{ fontSize: '12px', color: colors.gray[600] }}>Total Records</div>
                            </div>
                            <div style={{ padding: '16px', backgroundColor: colors.cyanLight, borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: colors.cyan }}>tenant_id</div>
                                <div style={{ fontSize: '12px', color: colors.gray[600] }}>Primary Key</div>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: colors.gray[50], position: 'sticky', top: 0 }}>
                                    <tr>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Column Name</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Data Type</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Nullable</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.gray[600] }}>Default</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableStructure.columns?.map(col => (
                                        <tr key={col.column_name} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}>
                                            <td style={{ padding: '10px 12px', fontSize: '14px', fontWeight: '500' }}>{col.column_name}</td>
                                            <td style={{ padding: '10px 12px', fontSize: '14px' }}><Badge variant="cyan">{col.data_type}</Badge></td>
                                            <td style={{ padding: '10px 12px', fontSize: '14px' }}>{col.is_nullable === 'YES' ? '✅' : '❌'}</td>
                                            <td style={{ padding: '10px 12px', fontSize: '12px', color: colors.gray[500] }}>{col.column_default || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <Button variant="outline" onClick={() => setShowSchemaModal(false)}>Close</Button>
                </div>
            </Modal>

            {/* Add Field Modal */}
            <Modal isOpen={showAddFieldModal} onClose={() => setShowAddFieldModal(false)} title="Add New Field to Tenants Table" icon="➕" size="md">
                <div style={{ backgroundColor: colors.warningLight, borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '13px', color: colors.warning }}>⚠️ <strong>Warning:</strong> This will add a new column to the database. Make sure you know what you're doing.</div>
                </div>
                <Input label="Column Name" required value={newField.column_name} onChange={(e) => setNewField({ ...newField, column_name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} placeholder="e.g., custom_field_name" hint="Lowercase letters, numbers, and underscores only" />
                <Select label="Data Type" required value={newField.data_type} onChange={(e) => setNewField({ ...newField, data_type: e.target.value })} options={[
                    { value: 'text', label: 'Text (unlimited)' },
                    { value: 'varchar(255)', label: 'String (max 255 chars)' },
                    { value: 'integer', label: 'Integer (whole number)' },
                    { value: 'numeric', label: 'Decimal (with decimals)' },
                    { value: 'boolean', label: 'Boolean (true/false)' },
                    { value: 'date', label: 'Date' },
                    { value: 'timestamp', label: 'DateTime' },
                    { value: 'jsonb', label: 'JSON Object' }
                ]} />
                <div style={{ marginBottom: '16px' }}>
                    <Checkbox label="Allow NULL values (empty)" checked={newField.is_nullable} onChange={(e) => setNewField({ ...newField, is_nullable: e.target.checked })} />
                </div>
                <Input label="Default Value (optional)" value={newField.default_value} onChange={(e) => setNewField({ ...newField, default_value: e.target.value })} placeholder="Leave empty for no default" />
                <TextArea label="Description (optional)" value={newField.description} onChange={(e) => setNewField({ ...newField, description: e.target.value })} placeholder="What is this field for?" />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <Button variant="outline" onClick={() => setShowAddFieldModal(false)}>Cancel</Button>
                    <Button variant="warning" onClick={handleAddField}>Add Field</Button>
                </div>
            </Modal>

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {/* Global Styles */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                input:focus, select:focus, textarea:focus { border-color: ${colors.primary} !important; box-shadow: 0 0 0 3px ${colors.primaryLight}; }
            `}</style>
        </div>
    );
};

export default CorporateManagement;
