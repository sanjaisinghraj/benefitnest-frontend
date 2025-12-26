'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// =====================================================
// CONFIGURATION
// =====================================================
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://benefitnest-backend.onrender.com';
const CORPORATES_API = `${API_URL}/api/admin/corporates`;
const LOOKUP_API = `${API_URL}/api/lookup`;

// =====================================================
// COLORS
// =====================================================
const colors = {
    primary: '#2563eb', primaryHover: '#1d4ed8', primaryLight: '#dbeafe', primaryDark: '#1e40af',
    success: '#10b981', successHover: '#059669', successLight: '#d1fae5', successDark: '#065f46',
    danger: '#ef4444', dangerHover: '#dc2626', dangerLight: '#fee2e2', dangerDark: '#991b1b',
    warning: '#f59e0b', warningHover: '#d97706', warningLight: '#fef3c7', warningDark: '#92400e',
    info: '#8b5cf6', infoHover: '#7c3aed', infoLight: '#ede9fe', infoDark: '#5b21b6',
    gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' }
};

// =====================================================
// CONSTANTS
// =====================================================
const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active', color: 'success' },
    { value: 'INACTIVE', label: 'Inactive', color: 'danger' },
    { value: 'ON_HOLD', label: 'On Hold', color: 'warning' }
];

const ONBOARDING_STATUS_OPTIONS = [
    { value: 'LEAD', label: 'Lead', color: 'gray' },
    { value: 'PROSPECT', label: 'Prospect', color: 'info' },
    { value: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'info' },
    { value: 'NEGOTIATION', label: 'Negotiation', color: 'warning' },
    { value: 'ONBOARDING', label: 'Onboarding', color: 'primary' },
    { value: 'ACTIVE', label: 'Active', color: 'success' },
    { value: 'CHURNED', label: 'Churned', color: 'danger' }
];

const CONTACT_ROLES = [
    { value: 'PRIMARY', label: 'Primary Contact' },
    { value: 'HR_ADMIN', label: 'HR Administrator' },
    { value: 'HR_SPOC', label: 'HR SPOC' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'IT_ADMIN', label: 'IT Administrator' },
    { value: 'GENERAL', label: 'General' }
];

// =====================================================
// UTILITIES
// =====================================================
const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const getHealthColor = (score) => score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.danger;
const getHealthLabel = (score) => score >= 80 ? 'Healthy' : score >= 60 ? 'Moderate' : 'At Risk';
const getDaysUntil = (date) => date ? Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

// =====================================================
// COMPONENTS
// =====================================================

// Modal
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

// Button
const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, disabled, loading, style = {}, type = 'button' }) => {
    const variants = {
        primary: { bg: colors.primary, hoverBg: colors.primaryHover, color: 'white' },
        success: { bg: colors.success, hoverBg: colors.successHover, color: 'white' },
        danger: { bg: colors.danger, hoverBg: colors.dangerHover, color: 'white' },
        warning: { bg: colors.warning, hoverBg: colors.warningHover, color: 'white' },
        info:    { bg: colors.info,    hoverBg: colors.infoHover,    color: 'white' },
        outline: { bg: 'white', hoverBg: colors.gray[50], color: colors.gray[700], border: `1px solid ${colors.gray[300]}` },
        ghost:   { bg: 'transparent', hoverBg: colors.gray[100], color: colors.gray[700] }
    };
    const sizes = { xs: { padding: '4px 8px',  fontSize: '11px' },
                    sm: { padding: '6px 12px', fontSize: '12px' },
                    md: { padding: '10px 16px', fontSize: '14px' } };
    const v = variants[variant] || variants.primary;
    const s = sizes[size] || sizes.md;
    const [hover, setHover] = useState(false);
    return (
        <button type={type} onClick={onClick} disabled={disabled || loading} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: s.padding, fontSize: s.fontSize, fontWeight: '600', color: v.color, backgroundColor: hover && !disabled ? v.hoverBg : v.bg, border: v.border || 'none', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, transition: 'all 0.15s', whiteSpace: 'nowrap', ...style }}>
            {loading 
                ? <span style={{ width: '14px', height: '14px', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                : icon && <span>{icon}</span>
            }
            {children}
        </button>
    );
};

// Badge
const Badge = ({ children, variant = 'default', dot }) => {
    const variants = {
        default: { bg: colors.gray[100], color: colors.gray[700] },
        primary: { bg: colors.primaryLight, color: colors.primaryDark },
        success: { bg: colors.successLight, color: colors.successDark },
        danger:  { bg: colors.dangerLight,  color: colors.dangerDark },
        warning: { bg: colors.warningLight, color: colors.warningDark },
        info:    { bg: colors.infoLight,    color: colors.infoDark },
        gray:    { bg: colors.gray[100], color: colors.gray[600] }
    };
    const v = variants[variant] || variants.default;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', backgroundColor: v.bg, color: v.color }}>
            {dot && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: v.color }} />}
            {children}
        </span>
    );
};

// Input
const Input = ({ label, required, error, hint, icon, ...props }) => (
    <div style={{ marginBottom: '16px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}
        <div style={{ position: 'relative' }}>
            {icon && <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.gray[400] }}>{icon}</span>}
            <input {...props} style={{ width: '100%', padding: `10px ${props.style?.paddingRight || '12px'} 10px ${icon ? '38px' : '12px'}`, border: `1px solid ${error ? colors.danger : colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: props.disabled ? colors.gray[50] : 'white', boxSizing: 'border-box', ...props.style }} />
        </div>
        {(error || hint) && <p style={{ marginTop: '4px', fontSize: '12px', color: error ? colors.danger : colors.gray[500] }}>{error || hint}</p>}
    </div>
);

// Select
const Select = ({ label, required, options = [], grouped = false, loading, placeholder, ...props }) => (
    <div style={{ marginBottom: '16px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}
        <select {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer', boxSizing: 'border-box', ...props.style }}>
            <option value="">{loading ? 'Loading...' : placeholder || `Select ${label || 'option'}`}</option>
            {grouped 
                ? Object.entries(options).map(([group, items]) => (
                    <optgroup key={group} label={group}>
                        {Array.isArray(items) && items.map(item => <option key={item.id || item.value} value={item.value || item.name}>{item.label || item.name}</option>)}
                    </optgroup>
                  ))
                : Array.isArray(options) && options.map(opt => <option key={opt.id || opt.value} value={opt.value || opt.name}>{opt.label || opt.name}</option>)
            }
        </select>
    </div>
);

// Textarea
const Textarea = ({ label, required, ...props }) => (
    <div style={{ marginBottom: '16px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: colors.gray[700] }}>{label}{required && <span style={{ color: colors.danger }}>*</span>}</label>}
        <textarea {...props} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', ...props.style }} />
    </div>
);

// Stats Card
const StatsCard = ({ value, label, icon, variant = 'default', onClick }) => {
    const variants = {
        default: { bg: colors.gray[50], color: colors.gray[900] },
        success: { bg: colors.successLight, color: colors.successDark },
        danger: { bg: colors.dangerLight,  color: colors.dangerDark },
        warning: { bg: colors.warningLight, color: colors.warningDark },
        info:    { bg: colors.infoLight,    color: colors.infoDark }
    };
    const v = variants[variant] || variants.default;
    return (
        <div onClick={onClick} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: `1px solid ${colors.gray[200]}`, cursor: onClick ? 'pointer' : 'default', flex: 1, minWidth: '120px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: colors.gray[900] }}>{value}</div>
                    <div style={{ fontSize: '12px', color: colors.gray[500], marginTop: '4px' }}>{label}</div>
                </div>
                <div style={{ fontSize: '28px' }}>{icon}</div>
            </div>
        </div>
    );
};

// Avatar
const Avatar = ({ src, name, size = 40 }) => {
    const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    const bgColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const bgColor = bgColors[name?.charCodeAt(0) % bgColors.length] || bgColors[0];
    return src ? (
        <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '10px', objectFit: 'contain', border: `1px solid ${colors.gray[200]}` }} />
    ) : (
        <div style={{ width: size, height: size, borderRadius: '10px', backgroundColor: bgColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: '600' }}>{initials}</div>
    );
};

// Empty State
const EmptyState = ({ icon, title, description, action }) => (
    <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: colors.gray[50], borderRadius: '12px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.gray[900], marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: colors.gray[500], marginBottom: '20px' }}>{description}</p>
        {action}
    </div>
);

// Tabs
const Tabs = ({ tabs, activeTab, onChange }) => (
    <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${colors.gray[200]}`, marginBottom: '20px', overflowX: 'auto' }}>
        {tabs.map(tab => (
            <button key={tab.id} onClick={() => onChange(tab.id)} style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: activeTab === tab.id ? colors.primary : colors.gray[500], backgroundColor: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? colors.primary : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '-1px', whiteSpace: 'nowrap' }}>
                {tab.icon && <span>{tab.icon}</span>}
                {tab.label}
                {tab.count !== undefined && <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: activeTab === tab.id ? colors.primaryLight : colors.gray[100], fontSize: '11px' }}>{tab.count}</span>}
            </button>
        ))}
    </div>
);

// Toast
const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
    const types = { success: { bg: colors.successLight, color: colors.successDark, icon: '✓' }, error: { bg: colors.dangerLight, color: colors.dangerDark, icon: '✕' }, info: { bg: colors.primaryLight, color: colors.primaryDark, icon: 'ℹ' } };
    const t = types[type] || types.info;
    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: t.bg, color: t.color, padding: '14px 20px', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2000 }}>
            <span style={{ fontWeight: '700' }}>{t.icon}</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.color, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
    );
};

// Detail Panel
const CorporateDetailPanel = ({ corporate, onClose, onEdit }) => {
    if (!corporate) return null;
    const contacts = Array.isArray(corporate.contact_details) ? corporate.contact_details : (corporate.contact_details ? [corporate.contact_details] : []);
    
    return (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', backgroundColor: 'white', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)', zIndex: 999, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <button onClick={onClose} style={{ padding: '8px', backgroundColor: colors.gray[100], border: 'none', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
                    <button onClick={onEdit}  style={{ padding: '8px', backgroundColor: colors.gray[100], border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✏️ Edit</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Avatar src={corporate.branding_config?.logo_url} name={corporate.corporate_legal_name} size={56} />
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.gray[900], marginBottom: '4px' }}>{corporate.corporate_legal_name}</h2>
                        <div style={{ fontSize: '13px', color: colors.gray[500] }}>{corporate.tenant_code} • {corporate.subdomain}</div>
                        <div style={{ marginTop: '8px' }}><Badge variant={STATUS_OPTIONS.find(s => s.value === corporate.status)?.color || 'default'} dot>{corporate.status}</Badge></div>
                    </div>
                </div>
            </div>
            
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>📋 Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: colors.gray[500], marginBottom: '4px' }}>Industry</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{corporate.industry_type || '—'}</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: colors.gray[500], marginBottom: '4px' }}>Type</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{corporate.corporate_type || '—'}</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: colors.gray[500], marginBottom: '4px' }}>Employees</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{corporate.employee_count || 0}</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: colors.gray[500], marginBottom: '4px' }}>Health</div>
                        <div><Badge variant={getHealthColor(corporate.health_score || 0)}>{getHealthLabel(corporate.health_score || 0)}</Badge></div>
                    </div>
                </div>
                
                {corporate.portal_url && (
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>🔗 Portal</h4>
                        <a href={corporate.portal_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '12px', backgroundColor: colors.primaryLight, borderRadius: '8px', color: colors.primary, textDecoration: 'none', fontSize: '14px' }}>
                            {corporate.portal_url.replace('https://', '')}
                        </a>
                    </div>
                )}
                
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>👥 Contacts ({contacts.length})</h4>
                {contacts.length === 0 ? (
                    <p style={{ color: colors.gray[500], fontSize: '14px' }}>No contacts added</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {contacts.map((contact, idx) => (
                            <div key={idx} style={{ padding: '16px', backgroundColor: colors.gray[50], borderRadius: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '600' }}>{contact.name || contact.person || contact.full_name}</span>
                                    {idx === 0 && <Badge variant="primary">Primary</Badge>}
                                </div>
                                <div style={{ fontSize: '12px', color: colors.gray[600] }}>{contact.designation || 'Contact'}</div>
                                {contact.email && <div style={{ fontSize: '13px', marginTop: '8px' }}>📧 {contact.email}</div>}
                                {contact.phone && <div style={{ fontSize: '13px' }}>📱 {contact.phone}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// =====================================================
// MAIN COMPONENT
// =====================================================
const CorporatesManagement = () => {
    const router = useRouter();
    
    // States
    const [corporates, setCorporates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, onboarding: 0, expiring: 0 });
    const [industryTypes, setIndustryTypes] = useState([]);
    const [corporateTypes, setCorporateTypes] = useState([]);
    const [jobLevels, setJobLevels] = useState([]);
    const [loadingLookups, setLoadingLookups] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDetailPanel, setShowDetailPanel] = useState(false);
    const [selectedCorporate, setSelectedCorporate] = useState(null);
    const [viewCorporate, setViewCorporate] = useState(null);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [industryFilter, setIndustryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [activeTab, setActiveTab] = useState('all');
    
    const [formData, setFormData] = useState({
        tenant_code: '', subdomain: '', corporate_legal_name: '', corporate_group_name: '',
        corporate_type: '', industry_type: '', logo_url: '',
        contract_start_date: '', contract_end_date: '', contract_value: '', internal_notes: '',
        contacts: [{ name: '', email: '', phone: '', designation: '', level: '', contact_role: 'PRIMARY' }]
    });
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [uploadingBulk, setUploadingBulk] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [showUrlSuccessModal, setShowUrlSuccessModal] = useState(false);
    const [creatingUrl, setCreatingUrl] = useState(false);
    const [createdUrl, setCreatedUrl] = useState('');

    // Auth
    const getToken = () => {
        if (typeof window === 'undefined') return null;
        return document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token');
    };

    const fetchLookupData = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${LOOKUP_API}/all`);
            if (response.data.success) {
                setCorporateTypes(response.data.data.corporateTypes || []);
                setIndustryTypes(response.data.data.industryTypes || []);
                setJobLevels(response.data.data.jobLevels || []);
            }
        } catch (err) {
            // ignore
        } finally {
            setLoadingLookups(false);
        }
    };

    const fetchCorporates = async () => {
        try {
            setLoading(true);
            const token = getToken();
            if (!token) { router.push('/admin'); return; }
            const response = await axios.get(`${CORPORATES_API}?all=true`, {headers: { Authorization: `Bearer ${token}` }});
            if (response.data.success) {
                const data = response.data.data || [];
                setCorporates(data);
                setStats({
                    total: data.length,
                    active: data.filter(c => c.status === 'ACTIVE').length,
                    onboarding: data.filter(c => ['LEAD', 'PROSPECT', 'ONBOARDING'].includes(c.onboarding_status)).length,
                    expiring: data.filter(c => c.contract_end_date && getDaysUntil(c.contract_end_date) <= 90 && getDaysUntil(c.contract_end_date) >= 0).length
                });
            }
        } catch (err) {
            if (err.response?.status === 401) { router.push('/admin'); }
            else setError(err.response?.data?.message || 'Failed to fetch');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchLookupData(); fetchCorporates(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, industryFilter, itemsPerPage, activeTab]);

    // Filtered data
    const filteredCorporates = useMemo(() => {
        let result = [...corporates];
        if (activeTab === 'active') result = result.filter(c => c.status === 'ACTIVE');
        else if (activeTab === 'onboarding') result = result.filter(c => ['LEAD', 'PROSPECT', 'ONBOARDING'].includes(c.onboarding_status));
        else if (activeTab === 'expiring') result = result.filter(c => c.contract_end_date && getDaysUntil(c.contract_end_date) <= 90 && getDaysUntil(c.contract_end_date) >= 0);
        
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.tenant_code?.toLowerCase().includes(q) ||
                c.subdomain?.toLowerCase().includes(q) ||
                c.corporate_legal_name?.toLowerCase().includes(q) ||
                c.industry_type?.toLowerCase().includes(q) ||
                (Array.isArray(c.contact_details) && c.contact_details.some(contact => contact?.name?.toLowerCase().includes(q) || contact?.email?.toLowerCase().includes(q)))
            );
        }
        if (statusFilter) result = result.filter(c => c.status === statusFilter);
        if (industryFilter) result = result.filter(c => c.industry_type === industryFilter);
        
        result.sort((a, b) => {
            let aVal = a[sortField], bVal = b[sortField];
            if (sortField === 'created_at') { aVal = aVal ? new Date(aVal).getTime() : 0; bVal = bVal ? new Date(bVal).getTime() : 0; }
            if (typeof aVal === 'string') aVal = aVal?.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal?.toLowerCase();
            return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
        return result;
    }, [corporates, searchQuery, statusFilter, industryFilter, sortField, sortOrder, activeTab]);

    const totalPages = Math.ceil(filteredCorporates.length / itemsPerPage);
    const paginatedCorporates = filteredCorporates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    const groupedJobLevels = useMemo(() => jobLevels.reduce((acc, l) => { const c = l.category || 'Other'; if (!acc[c]) acc[c] = []; acc[c].push(l); return acc; }, {}), [jobLevels]);
    const groupedIndustryTypes = useMemo(() => industryTypes.reduce((acc, i) => { const s = i.sector || 'Other'; if (!acc[s]) acc[s] = []; acc[s].push(i); return acc; }, {}), [industryTypes]);

    // Form handlers
    const resetForm = () => {
        setFormData({ tenant_code: '', subdomain: '', corporate_legal_name: '', corporate_group_name: '', corporate_type: '', industry_type: '', logo_url: '', contract_start_date: '', contract_end_date: '', contract_value: '', internal_notes: '', contacts: [{ name: '', email: '', phone: '', designation: '', level: '', contact_role: 'PRIMARY' }] });
        setSelectedCorporate(null);
    };

    const handleContactChange = (index, field, value) => {
        const newContacts = [...formData.contacts];
        newContacts[index][field] = value;
        setFormData({ ...formData, contacts: newContacts });
    };
    const addContact = () => setFormData({ ...formData, contacts: [...formData.contacts, { name: '', email: '', phone: '', designation: '', level: '', contact_role: 'GENERAL' }] });
    const removeContact = (index) => { if (formData.contacts.length > 1) setFormData({ ...formData, contacts: formData.contacts.filter((_, i) => i !== index) }); };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { setToast({ message: 'Please upload an image', type: 'error' }); return; }
        setUploadingLogo(true);
        const reader = new FileReader();
        reader.onloadend = () => { setFormData({ ...formData, logo_url: reader.result }); setUploadingLogo(false); };
        reader.readAsDataURL(file);
    };

    // Bulk upload helpers
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

const parseExcel = async (file) => {
    const XLSX = await import('xlsx');
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
};

const downloadExcel = async (data, filename) => {
    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filename);
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
                        const resp = await axios.post(`${CORPORATES_API}`, payload, { headers: { Authorization: `Bearer ${token}` } });
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

    // CRUD
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const validContacts = formData.contacts.filter(c => c.name || c.email);
            const payload = { ...formData, branding_config: { logo_url: formData.logo_url }, contact_details: validContacts.length ? validContacts : undefined };
            delete payload.logo_url; delete payload.contacts;
            const response = await axios.post(`${CORPORATES_API}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) { setShowForm(false); resetForm(); fetchCorporates(); setToast({ message: 'Created!', type: 'success' }); }
        } catch (err) { setToast({ message: err.response?.data?.message || 'Failed', type: 'error' }); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const validContacts = formData.contacts.filter(c => c.name || c.email);
            const payload = { corporate_legal_name: formData.corporate_legal_name, corporate_group_name: formData.corporate_group_name, corporate_type: formData.corporate_type, industry_type: formData.industry_type, branding_config: { logo_url: formData.logo_url }, contact_details: validContacts, contract_start_date: formData.contract_start_date || null, contract_end_date: formData.contract_end_date || null, internal_notes: formData.internal_notes };
            await axios.put(`${CORPORATES_API}/${selectedCorporate.tenant_id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            setShowForm(false); resetForm(); fetchCorporates(); setToast({ message: 'Updated!', type: 'success' });
        } catch (err) { setToast({ message: err.response?.data?.message || 'Failed', type: 'error' }); }
    };

    const handleDelete = async (corp) => {
        if (!window.confirm(`Delete "${corp.corporate_legal_name}"?`)) return;
        try {
            const token = getToken();
            await axios.delete(`${CORPORATES_API}/${corp.tenant_id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchCorporates(); setToast({ message: 'Deleted!', type: 'success' });
        } catch (err) { setToast({ message: 'Failed to delete', type: 'error' }); }
    };

    const handleEdit = (corp) => {
        setSelectedCorporate(corp);
        const contacts = Array.isArray(corp.contact_details) ? corp.contact_details : (corp.contact_details ? [corp.contact_details] : []);
        setFormData({
            tenant_code: corp.tenant_code, subdomain: corp.subdomain, corporate_legal_name: corp.corporate_legal_name || '',
            corporate_group_name: corp.corporate_group_name || '', corporate_type: corp.corporate_type || '', industry_type: corp.industry_type || '',
            logo_url: corp.branding_config?.logo_url || '', contract_start_date: corp.contract_start_date || '',
            contract_end_date: corp.contract_end_date || '', contract_value: corp.contract_value || '', internal_notes: corp.internal_notes || '',
            contacts: contacts.length ? contacts.map(c => ({ name: c.name || c.person || '', email: c.email || '', phone: c.phone || '', designation: c.designation || '', level: c.level || '', contact_role: c.contact_role || 'GENERAL' })) : [{ name: '', email: '', phone: '', designation: '', level: '', contact_role: 'PRIMARY' }]
        });
        setShowForm(true); setShowDetailPanel(false);
    };

    const handleView = (corp) => { setViewCorporate(corp); setShowDetailPanel(true); };

    // **Create URL Logic from old file**
    const handleCreateUrl = async (corp) => {
        setSelectedCorporate(corp);
        setShowUrlModal(true);
    };
    const confirmCreateUrl = async () => {
        if (!selectedCorporate) return;
        setCreatingUrl(true);
        try {
            const token = getToken();
            if (selectedCorporate.portal_url) {
                setShowUrlModal(false);
                setToast({ message: `URL already exists for this corporate: ${selectedCorporate.portal_url}`, type: 'error' });
                setCreatingUrl(false);
                return;
            }
            const subdomain = selectedCorporate.subdomain.toLowerCase();
            const fullUrl = `https://${subdomain}.benefitnest.space`;
            const response = await axios.put(`${CORPORATES_API}/${selectedCorporate.tenant_id}`, 
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
                setToast({ message: `URL already exists: ${selectedCorporate.subdomain}.benefitnest.space`, type: 'error' });
            } else {
                setToast({ message: err.response?.data?.message || 'Failed to create URL', type: 'error' });
            }
        } finally {
            setCreatingUrl(false);
        }
    };
    // **End URL logic**

    const handleSort = (field) => { 
        if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); 
        else { setSortField(field); setSortOrder('asc'); }
    };
    const handleLogout = () => { localStorage.removeItem('admin_token'); document.cookie = 'admin_token=; path=/; max-age=0'; window.location.href = 'https://www.benefitnest.space'; };

    const tabConfig = [
        { id: 'all', label: 'All', icon: '📋', count: stats.total },
        { id: 'active', label: 'Active', icon: '✅', count: stats.active },
        { id: 'onboarding', label: 'Pipeline', icon: '🚀', count: stats.onboarding },
        { id: 'expiring', label: 'Expiring', icon: '⏰', count: stats.expiring }
    ];

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
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.gray[900], marginBottom: '4px' }}>Corporate Management</h1>
                        <p style={{ color: colors.gray[500], fontSize: '14px' }}>Manage corporate clients and portals</p>
                    </div>
                    {!showForm && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button variant="success" icon="📤" onClick={() => setShowUploadModal(true)} disabled={uploadingBulk}>
                                {uploadingBulk ? 'Uploading...' : 'Upload Corporates'}
                            </Button>
                            <Button variant="primary" icon="+" onClick={() => { resetForm(); setShowForm(true); }}>Add Corporate</Button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                {!showForm && (
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <StatsCard value={stats.total} label="Total" icon="🏢" onClick={() => setActiveTab('all')} />
                        <StatsCard value={stats.active} label="Active" icon="✅" variant="success" onClick={() => setActiveTab('active')} />
                        <StatsCard value={stats.onboarding} label="Pipeline" icon="🚀" variant="info" onClick={() => setActiveTab('onboarding')} />
                        <StatsCard value={stats.expiring} label="Expiring" icon="⏰" variant="warning" onClick={() => setActiveTab('expiring')} />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ backgroundColor: colors.dangerLight, padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: colors.dangerDark }}>⚠️ {error}</span>
                        <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
                    </div>
                )}

                {/* Form */}
                {showForm ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{selectedCorporate ? '✏️ Edit Corporate' : '✨ Create Corporate'}</h2>
                        </div>
                        <form onSubmit={selectedCorporate ? handleUpdate : handleCreate} style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', borderBottom: `2px solid ${colors.primary}`, paddingBottom: '8px', display: 'inline-block' }}>📋 Basic Info</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                <Input label="Tenant Code" required value={formData.tenant_code} onChange={(e) => setFormData({ ...formData, tenant_code: e.target.value.toUpperCase() })} disabled={!!selectedCorporate} placeholder="CORP001" />
                                <Input label="Subdomain" required value={formData.subdomain} onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })} disabled={!!selectedCorporate} placeholder="acmecorp" />
                                <div style={{ gridColumn: '1 / -1' }}><Input label="Corporate Legal Name" required value={formData.corporate_legal_name} onChange={(e) => setFormData({ ...formData, corporate_legal_name: e.target.value })} placeholder="Acme Corp Pvt Ltd" /></div>
                                <Input label="Group Name" value={formData.corporate_group_name} onChange={(e) => setFormData({ ...formData, corporate_group_name: e.target.value })} placeholder="Acme Group" />
                                <Select label="Corporate Type" value={formData.corporate_type} onChange={(e) => setFormData({ ...formData, corporate_type: e.target.value })} options={corporateTypes} loading={loadingLookups} />
                                <Select label="Industry" value={formData.industry_type} onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })} options={groupedIndustryTypes} grouped loading={loadingLookups} />
                            </div>

                            <h3 style={{ fontSize: '15px', fontWeight: '700', marginTop: '32px', marginBottom: '16px', borderBottom: `2px solid ${colors.primary}`, paddingBottom: '8px', display: 'inline-block' }}>📝 Contract</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                                <Input label="Start Date" type="date" value={formData.contract_start_date} onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })} />
                                <Input label="End Date" type="date" value={formData.contract_end_date} onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })} />
                            </div>

                            <h3 style={{ fontSize: '15px', fontWeight: '700', marginTop: '32px', marginBottom: '16px', borderBottom: `2px solid ${colors.primary}`, paddingBottom: '8px', display: 'inline-block' }}>🎨 Branding</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                                <div style={{ width: '80px', height: '80px', border: `2px dashed ${colors.gray[300]}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[50] }}>
                                    {formData.logo_url ? <img src={formData.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '28px' }}>🏢</span>}
                                </div>
                                <div>
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} style={{ display: 'none' }} id="logo-upload" />
                                    <label htmlFor="logo-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: colors.gray[100], borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                                        📁 {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: `2px solid ${colors.primary}`, paddingBottom: '8px', margin: 0 }}>👥 Contacts</h3>
                                <Button type="button" variant="outline" size="sm" icon="+" onClick={addContact}>Add</Button>
                            </div>
                            {formData.contacts.length === 0 ? (
                                <p style={{ color: colors.gray[500], fontSize: '14px' }}>No contacts added</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                    {formData.contacts.map((contact, idx) => (
                                        <div key={idx} style={{ padding: '16px', backgroundColor: colors.gray[50], borderRadius: '8px', position: 'relative' }}>
                                            <button onClick={() => removeContact(idx)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: colors.gray[400] }}>×</button>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                                <Input label="Name" required value={contact.name} onChange={(e) => handleContactChange(idx, 'name', e.target.value)} />
                                                <Input label="Email" required value={contact.email} onChange={(e) => handleContactChange(idx, 'email', e.target.value)} />
                                                <Input label="Phone" value={contact.phone} onChange={(e) => handleContactChange(idx, 'phone', e.target.value)} />
                                                <Input label="Designation" value={contact.designation} onChange={(e) => handleContactChange(idx, 'designation', e.target.value)} />
                                                <Select label="Level" value={contact.level} onChange={(e) => handleContactChange(idx, 'level', e.target.value)} options={groupedJobLevels} grouped loading={loadingLookups} />
                                                <Select label="Role" value={contact.contact_role} onChange={(e) => handleContactChange(idx, 'contact_role', e.target.value)} options={CONTACT_ROLES} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <Button variant="primary" type="submit" icon={selectedCorporate ? '✏️' : '✨'}>{selectedCorporate ? 'Update' : 'Create'}</Button>
                                <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <Tabs tabs={tabConfig} activeTab={activeTab} onChange={setActiveTab} />

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Search by name, code, subdomain, industry, contact..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ flex: '1', minWidth: '300px', maxWidth: '500px', padding: '12px 44px 12px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', outline: 'none', fontSize: '14px' }}
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ padding: '8px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                            >
                                <option value="">All Status</option>
                                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <select
                                value={industryFilter}
                                onChange={(e) => setIndustryFilter(e.target.value)}
                                style={{ padding: '8px 12px', border: `1px solid ${colors.gray[300]}`, borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                            >
                                <option value="">All Industries</option>
                                {industryTypes.map(ind => <option key={ind.id} value={ind.name}>{ind.name}</option>)}
                            </select>
                        </div>

                        {/* Table */}
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: colors.gray[100] }}>
                                        <tr>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap' }}>Logo</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => handleSort('tenant_code')}>
                                                Code {sortField === 'tenant_code' && (sortOrder === 'asc' ? '▲' : '▼')}
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap' }} onClick={() => handleSort('corporate_legal_name')}>
                                                Corporate {sortField === 'corporate_legal_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap' }} onClick={() => handleSort('industry_type')}>
                                                Industry {sortField === 'industry_type' && (sortOrder === 'asc' ? '▲' : '▼')}
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }} onClick={() => handleSort('status')}>
                                                Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>Health</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>Portal</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedCorporates.length === 0 ? (
                                            <tr><td colSpan="8" style={{ padding: '60px' }}><EmptyState icon={searchQuery ? '🔍' : '📋'} title={searchQuery ? 'No results' : 'No corporates'} description={searchQuery ? 'Try different search' : 'Add your first corporate'} action={!searchQuery && <Button variant="primary" icon="+" onClick={() => { resetForm(); setShowForm(true); }}>Add Corporate</Button>} /></td></tr>
                                        ) : paginatedCorporates.map((corp, idx) => (
                                            <tr key={corp.tenant_id} style={{ borderBottom: `1px solid ${colors.gray[100]}`, backgroundColor: idx % 2 === 0 ? 'white' : colors.gray[50], cursor: 'pointer' }} onClick={() => handleView(corp)}>
                                                <td style={{ padding: '12px 16px' }}><Avatar src={corp.branding_config?.logo_url} name={corp.corporate_legal_name} size={40} /></td>
                                                <td style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px' }}>{corp.tenant_code}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{corp.corporate_legal_name}</div>
                                                    {corp.corporate_group_name && <div style={{ fontSize: '12px', color: colors.gray[500] }}>{corp.corporate_group_name}</div>}
                                                    <div style={{ fontSize: '12px', color: colors.gray[400], marginTop: '2px' }}><code style={{ backgroundColor: colors.gray[100], padding: '2px 6px', borderRadius: '4px' }}>{corp.subdomain}</code></div>
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: colors.gray[600] }}>{corp.industry_type || '—'}</td>
                                                <td style={{ padding: '12px 16px' }}><Badge variant={STATUS_OPTIONS.find(s => s.value === corp.status)?.color || 'default'} dot>{corp.status}</Badge></td>
                                                <td style={{ padding: '12px 16px' }}>
    <Badge variant={getHealthColor(corp.health_score || 100)}>
        {getHealthLabel(corp.health_score || 100)}
    </Badge>
</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    {corp.portal_url 
                                                      ? <a href={corp.portal_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: colors.primary, fontSize: '12px', textDecoration: 'none' }}>🔗 Live</a> 
                                                      : <span style={{ color: colors.gray[400], fontSize: '12px' }}>—</span>}
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                        <Button size="sm" variant="info"    icon="👁️" onClick={() => handleView(corp)}>View</Button>
                                                        <Button size="sm" variant="outline" icon="✏️" onClick={() => handleEdit(corp)}>Edit</Button>
                                                        <Button size="sm" variant="success" icon="🔗" onClick={() => handleCreateUrl(corp)} disabled={!!corp.portal_url}>URL</Button>
                                                        <Button size="sm" variant="danger"  icon="🗑️" onClick={() => handleDelete(corp)}>Delete</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.gray[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                    <div style={{ fontSize: '14px', color: colors.gray[600] }}>Page {currentPage} of {totalPages} ({filteredCorporates.length} total)</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</Button>
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</Button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                                            return <button key={pageNum} onClick={() => setCurrentPage(pageNum)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: currentPage === pageNum ? 'none' : `1px solid ${colors.gray[300]}`, backgroundColor: currentPage === pageNum ? colors.primary : 'white', color: currentPage === pageNum ? 'white' : colors.gray[700], cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>{pageNum}</button>;
                                        })}
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</Button>
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Detail Panel */}
            {showDetailPanel && viewCorporate && (
                <CorporateDetailPanel corporate={viewCorporate} onClose={() => { setShowDetailPanel(false); setViewCorporate(null); }} onEdit={() => handleEdit(viewCorporate)} />
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Upload Modal */}
            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Corporates" icon="📤" size="md">
                <p style={{ color: colors.gray[600], marginBottom: '24px' }}>
                    Upload an Excel (.xlsx/.xls) or CSV file with corporate data. Download the template to ensure correct format.
                </p>
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
                                    <span style={{ fontWeight: '600', color: colors.dangerDark }}>⚠️ {uploadResults.failed} record(s) failed</span>
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
                                <div style={{ fontWeight: '600', color: colors.successDark }}>All records uploaded successfully!</div>
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

            {/* Global Styles */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; margin: 0; }
            `}</style>
        </div>
    );
};

export default CorporatesManagement;
