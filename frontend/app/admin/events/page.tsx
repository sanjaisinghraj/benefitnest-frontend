'use client';
import { useState, useEffect, useRef } from 'react';

const API_BASE = 'https://benefitnest-backend.onrender.com';

// Event Types
const EVENT_TYPES = [
  { id: 'virtual-workshops', name: 'Virtual Workshops', icon: '🛠️' },
  { id: 'online-training', name: 'Online Training Sessions', icon: '📚' },
  { id: 'live-qa', name: 'Live Q&A Sessions', icon: '❓' },
  { id: 'panel-discussions', name: 'Panel Discussions', icon: '👥' },
  { id: 'webcasts', name: 'Webcasts', icon: '📡' },
  { id: 'online-conferences', name: 'Online Conferences', icon: '🎪' },
  { id: 'virtual-meetups', name: 'Virtual Meetups', icon: '🤝' },
  { id: 'elearning-modules', name: 'E-learning Modules', icon: '💻' },
  { id: 'podcasts', name: 'Podcasts', icon: '🎙️' },
  { id: 'interactive-tutorials', name: 'Interactive Tutorials', icon: '📝' },
  { id: 'roundtable-discussions', name: 'Roundtable Discussions', icon: '🔄' },
  { id: 'fireside-chats', name: 'Fireside Chats', icon: '🔥' },
  { id: 'networking-events', name: 'Online Networking Events', icon: '🌐' },
  { id: 'virtual-summits', name: 'Virtual Summits', icon: '🏔️' },
  { id: 'live-demonstrations', name: 'Live Demonstrations', icon: '🎯' },
];

// Video Platforms
const VIDEO_PLATFORMS = [
  { id: 'jitsi', name: 'Jitsi Meet', icon: '🔵', default: true },
  { id: 'webex', name: 'Cisco Webex', icon: '🟢' },
  { id: 'teams', name: 'Microsoft Teams', icon: '🟣' },
  { id: 'meet', name: 'Google Meet', icon: '🟡' },
  { id: 'zoom', name: 'Zoom', icon: '🔷' },
];

interface Tenant {
  id: string;
  tenant_code: string;
  corporate_legal_name: string;
  subdomain?: string;
  status?: string;
}

interface Event {
  id: string;
  event_type: string;
  title: string;
  description?: string;
  banner_url?: string;
  mailer_subject?: string;
  mailer_content?: string;
  mailer_html?: string;
  platform: string;
  meeting_link?: string;
  event_date: string;
  event_time: string;
  event_datetime?: string;
  duration_minutes?: number;
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  total_invited?: number;
  total_registered?: number;
  total_attended?: number;
  created_at?: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tenant_code?: string;
  status: 'invited' | 'registered' | 'confirmed' | 'attended' | 'no_show';
  registered_at?: string;
  attended_at?: string;
}

export default function EventManagementPage() {
  // View state
  const [activeView, setActiveView] = useState<'list' | 'create' | 'edit' | 'participants'>('list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Events list
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // Create/Edit form
  const [formData, setFormData] = useState({
    eventType: '',
    title: '',
    description: '',
    bannerUrl: '',
    bannerFile: null as File | null,
    bannerPreview: '',
    mailerSubject: '',
    mailerContent: '',
    platform: 'jitsi',
    eventDate: '',
    eventTime: '',
    durationMinutes: 60,
    selectedTenants: [] as Tenant[],
  });
  
  // Tenants
  const [tenantsList, setTenantsList] = useState<Tenant[]>([]);
  const [tenantSearch, setTenantSearch] = useState('');
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  
  // Participants
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantStats, setParticipantStats] = useState({
    invited: 0,
    registered: 0,
    confirmed: 0,
    attended: 0,
  });
  
  // Mailer Preview
  const [showMailerPreview, setShowMailerPreview] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get auth token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token') || localStorage.getItem('jwt');
    }
    return null;
  };

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = `${API_BASE}/api/admin/events/list?`;
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterType) url += `eventType=${filterType}&`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tenants
  const fetchTenants = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/events/tenants/list`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTenantsList(data.tenants || []);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  // Fetch participants for an event
  const fetchParticipants = async (eventId: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/events/${eventId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants || []);
        if (data.grouped) {
          setParticipantStats({
            invited: data.grouped.invited?.length || 0,
            registered: data.grouped.registered?.length || 0,
            confirmed: data.grouped.confirmed?.length || 0,
            attended: data.grouped.attended?.length || 0,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchTenants();
  }, [filterStatus, filterType]);

  // Handle banner upload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        bannerFile: file,
        bannerPreview: URL.createObjectURL(file),
      }));
    }
  };

  // Toggle tenant selection
  const toggleTenant = (tenant: Tenant) => {
    setFormData(prev => {
      const isSelected = prev.selectedTenants.some(t => t.id === tenant.id);
      return {
        ...prev,
        selectedTenants: isSelected
          ? prev.selectedTenants.filter(t => t.id !== tenant.id)
          : [...prev.selectedTenants, tenant],
      };
    });
  };

  // Create event
  const handleCreateEvent = async () => {
    if (!formData.eventType || !formData.title || !formData.eventDate || !formData.eventTime) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      
      // TODO: Upload banner to storage first if file exists
      // For now, use URL directly
      
      const res = await fetch(`${API_BASE}/api/admin/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventType: formData.eventType,
          title: formData.title,
          description: formData.description,
          bannerUrl: formData.bannerUrl || formData.bannerPreview,
          mailerSubject: formData.mailerSubject,
          mailerContent: formData.mailerContent,
          platform: formData.platform,
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          durationMinutes: formData.durationMinutes,
          selectedTenants: formData.selectedTenants,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Event created successfully!');
        resetForm();
        setActiveView('list');
        fetchEvents();
      } else {
        alert(data.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  // Publish event
  const handlePublishEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to publish this event and send invitations?')) return;

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/events/${eventId}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchEvents();
      } else {
        alert(data.error || 'Failed to publish event');
      }
    } catch (err) {
      console.error('Error publishing event:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchEvents();
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      eventType: '',
      title: '',
      description: '',
      bannerUrl: '',
      bannerFile: null,
      bannerPreview: '',
      mailerSubject: '',
      mailerContent: '',
      platform: 'jitsi',
      eventDate: '',
      eventTime: '',
      durationMinutes: 60,
      selectedTenants: [],
    });
  };

  // View participants
  const viewParticipants = (event: Event) => {
    setSelectedEvent(event);
    fetchParticipants(event.id);
    setActiveView('participants');
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'live': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Filtered tenants
  const filteredTenants = tenantsList.filter(t => 
    t.corporate_legal_name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
    t.tenant_code.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📅 Event Management</h1>
          <p className="text-gray-600 mt-1">Create and manage virtual events for corporates</p>
        </div>
        
        {activeView === 'list' && (
          <button
            onClick={() => { resetForm(); setActiveView('create'); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 shadow-lg"
          >
            ➕ Create Event
          </button>
        )}
        
        {activeView !== 'list' && (
          <button
            onClick={() => { setActiveView('list'); setSelectedEvent(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← Back to Events
          </button>
        )}
      </div>

      {/* List View */}
      {activeView === 'list' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                {EVENT_TYPES.map(t => (
                  <option key={t.id} value={t.name}>{t.icon} {t.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => { setFilterStatus(''); setFilterType(''); }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 mt-6"
            >
              Clear Filters
            </button>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first event</p>
              <button
                onClick={() => setActiveView('create')}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Banner */}
                  <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                    {event.banner_url ? (
                      <img src={event.banner_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white text-6xl">
                        {EVENT_TYPES.find(t => t.name === event.event_type)?.icon || '📅'}
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="text-sm text-indigo-600 font-medium mb-1">
                      {EVENT_TYPES.find(t => t.name === event.event_type)?.icon} {event.event_type}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{event.title}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
                      <span>🕐 {event.event_time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {VIDEO_PLATFORMS.find(p => p.id === event.platform)?.icon} {VIDEO_PLATFORMS.find(p => p.id === event.platform)?.name || 'Jitsi Meet'}
                      </span>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-lg font-semibold text-gray-700">{event.total_invited || 0}</div>
                        <div className="text-xs text-gray-500">Invited</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-lg font-semibold text-blue-700">{event.total_registered || 0}</div>
                        <div className="text-xs text-gray-500">Registered</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <div className="text-lg font-semibold text-green-700">{event.total_attended || 0}</div>
                        <div className="text-xs text-gray-500">Attended</div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewParticipants(event)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        👥 Participants
                      </button>
                      {event.status === 'draft' && (
                        <button
                          onClick={() => handlePublishEvent(event.id)}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                        >
                          🚀 Publish
                        </button>
                      )}
                      {event.meeting_link && (
                        <a
                          href={event.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm"
                        >
                          🔗
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Event View */}
      {activeView === 'create' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Event Type Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">1. Select Event Type</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setFormData(prev => ({ ...prev, eventType: type.name }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    formData.eventType === type.name
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs text-gray-600">{type.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">2. Event Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Employee Wellness Workshop 2025"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe your event..."
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Time *</label>
                  <input
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Banner & Mailer Design */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">3. Banner & Mailer Design</h2>
            
            {/* Banner Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Banner</label>
              <div className="flex gap-4 items-start">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-64 h-36 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors overflow-hidden"
                >
                  {formData.bannerPreview ? (
                    <img src={formData.bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-3xl mb-1">🖼️</div>
                      <div className="text-sm">Click to upload</div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Or paste image URL</label>
                  <input
                    type="url"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, bannerUrl: e.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Mailer Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={formData.mailerSubject}
                  onChange={(e) => setFormData(prev => ({ ...prev, mailerSubject: e.target.value }))}
                  placeholder="You're Invited: Join us for an exclusive wellness workshop!"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Body Content</label>
                <textarea
                  value={formData.mailerContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, mailerContent: e.target.value }))}
                  rows={6}
                  placeholder={`Dear {{name}},

We are excited to invite you to our upcoming event!

Event: {{event_title}}
Date: {{event_date}}
Time: {{event_time}}

Click here to register: {{registration_link}}

Looking forward to seeing you there!

Best regards,
The BenefitNest Team`}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Available placeholders: {`{{name}}, {{event_title}}, {{event_date}}, {{event_time}}, {{registration_link}}, {{meeting_link}}`}
                </div>
              </div>
              
              <button
                onClick={() => setShowMailerPreview(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                👁️ Preview Email
              </button>
            </div>
          </div>

          {/* Video Platform */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">4. Video Conference Platform</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {VIDEO_PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    formData.platform === platform.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{platform.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{platform.name}</div>
                  {platform.default && <div className="text-xs text-green-600">Default</div>}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-500">
              ℹ️ Jitsi Meet links are automatically generated. Other platforms require manual link entry or API integration.
            </p>
          </div>

          {/* Tenant Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">5. Select Corporates to Invite</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                value={tenantSearch}
                onChange={(e) => { setTenantSearch(e.target.value); setShowTenantDropdown(true); }}
                onFocus={() => setShowTenantDropdown(true)}
                placeholder="🔍 Search corporates..."
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              
              {showTenantDropdown && tenantSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-auto">
                  {filteredTenants.length === 0 ? (
                    <div className="p-3 text-gray-500 text-center">No corporates found</div>
                  ) : (
                    filteredTenants.map(tenant => (
                      <div
                        key={tenant.id}
                        onClick={() => { toggleTenant(tenant); setShowTenantDropdown(false); setTenantSearch(''); }}
                        className={`p-3 cursor-pointer hover:bg-indigo-50 flex justify-between items-center ${
                          formData.selectedTenants.some(t => t.id === tenant.id) ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div>
                          <div className="font-medium text-gray-800">{tenant.corporate_legal_name}</div>
                          <div className="text-sm text-gray-500">{tenant.tenant_code}</div>
                        </div>
                        {formData.selectedTenants.some(t => t.id === tenant.id) && (
                          <span className="text-green-600">✓</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {/* Selected Tenants */}
            {formData.selectedTenants.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Selected ({formData.selectedTenants.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedTenants.map(tenant => (
                    <span
                      key={tenant.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {tenant.corporate_legal_name}
                      <button
                        onClick={() => toggleTenant(tenant)}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quick Select All */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFormData(prev => ({ ...prev, selectedTenants: [...tenantsList] }))}
                className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                Select All
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, selectedTenants: [] }))}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => { resetForm(); setActiveView('list'); }}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateEvent}
              disabled={loading || !formData.eventType || !formData.title || !formData.eventDate || !formData.eventTime}
              className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creating...' : '✨ Create Event'}
            </button>
          </div>
        </div>
      )}

      {/* Participants View */}
      {activeView === 'participants' && selectedEvent && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Event Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 text-indigo-200 text-sm mb-2">
              {EVENT_TYPES.find(t => t.name === selectedEvent.event_type)?.icon} {selectedEvent.event_type}
            </div>
            <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
            <div className="flex items-center gap-6 text-indigo-100">
              <span>📅 {new Date(selectedEvent.event_date).toLocaleDateString()}</span>
              <span>🕐 {selectedEvent.event_time}</span>
              {selectedEvent.meeting_link && (
                <a href={selectedEvent.meeting_link} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  🔗 Join Meeting
                </a>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-3xl font-bold text-gray-700">{participantStats.invited}</div>
              <div className="text-gray-500">Invited</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-blue-500">
              <div className="text-3xl font-bold text-blue-600">{participantStats.registered}</div>
              <div className="text-gray-500">Registered</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-yellow-500">
              <div className="text-3xl font-bold text-yellow-600">{participantStats.confirmed}</div>
              <div className="text-gray-500">Confirmed</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-green-500">
              <div className="text-3xl font-bold text-green-600">{participantStats.attended}</div>
              <div className="text-gray-500">Attended</div>
            </div>
          </div>

          {/* Participants Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">Participants ({participants.length})</h3>
            </div>
            
            {participants.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <p>No participants yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Corporate</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Registered</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Attended</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {participants.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                        <td className="px-4 py-3 text-gray-600">{p.email}</td>
                        <td className="px-4 py-3 text-gray-600">{p.tenant_code || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === 'attended' ? 'bg-green-100 text-green-700' :
                            p.status === 'registered' ? 'bg-blue-100 text-blue-700' :
                            p.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                            p.status === 'no_show' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-sm">
                          {p.registered_at ? new Date(p.registered_at).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-sm">
                          {p.attended_at ? new Date(p.attended_at).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mailer Preview Modal */}
      {showMailerPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800">Email Preview</h3>
              <button onClick={() => setShowMailerPreview(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Subject:</div>
                <div className="font-medium text-gray-800">
                  {formData.mailerSubject || 'No subject set'}
                </div>
              </div>
              <hr className="my-4" />
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {(formData.mailerContent || 'No content set')
                    .replace(/{{name}}/g, 'John Doe')
                    .replace(/{{event_title}}/g, formData.title || 'Event Title')
                    .replace(/{{event_date}}/g, formData.eventDate || 'Date TBD')
                    .replace(/{{event_time}}/g, formData.eventTime || 'Time TBD')
                    .replace(/{{registration_link}}/g, 'https://events.benefitnest.space/register/abc123')
                    .replace(/{{meeting_link}}/g, 'https://meet.jit.si/benefitnest-event')
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
