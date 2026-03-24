import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Building, Home, MessageCircle, FileText, 
  Settings, LogOut, Plus, Edit, Trash2, Eye, Search, Filter, X, Check, Clock,
  ChevronLeft, ChevronRight, Bell, BarChart3, TrendingUp, AlertCircle, Send, Headphones, Award, Mail, Image,
  Star, MessageSquare, HelpCircle, PhoneCall, Download, ExternalLink, ArrowLeft, User, MapPin, Phone, Calendar,
  CreditCard, Paperclip, RefreshCw, AlertTriangle, CheckCircle, XCircle, ClipboardList
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
const API = `${BACKEND_URL}/api`;

const AdminCMS = ({ onClose }) => {
  const { user, token, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [housing, setHousing] = useState([]);
  const [chats, setChats] = useState([]);
  const [newsletterSubs, setNewsletterSubs] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const chatWsRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  // Modal states
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [showHousingModal, setShowHousingModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [inlineReply, setInlineReply] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [uploadingReplyFile, setUploadingReplyFile] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Application detail states
  const [selectedApp, setSelectedApp] = useState(null);
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyReason, setModifyReason] = useState('');
  const [modifyAppId, setModifyAppId] = useState(null);
  const [appMessage, setAppMessage] = useState('');
  const [appMessages, setAppMessages] = useState([]);
  const [sendingAppMessage, setSendingAppMessage] = useState(false);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load data when section changes
  useEffect(() => {
    switch (activeSection) {
      case 'users':
        loadUsers();
        break;
      case 'offers':
        loadOffers();
        break;
      case 'universities':
        loadUniversities();
        break;
      case 'messages':
        loadMessages();
        break;
      case 'applications':
        loadApplications();
        break;
      case 'housing':
        loadHousing();
        break;
      case 'chats':
        loadChats();
        break;
      case 'payment-settings':
        loadPaymentSettings();
        break;
      case 'newsletter':
        loadNewsletter();
        break;
      case 'terms-conditions':
        loadPaymentSettings();
        break;
      case 'scholarships':
        loadOffers();
        break;
      case 'banners':
        loadBanners();
        break;
      case 'testimonials':
        loadTestimonials();
        break;
      case 'contacts':
        loadContacts();
        break;
      case 'faqs':
        loadFaqs();
        break;
      default:
        break;
    }
  }, [activeSection]);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
    setLoading(false);
  };

  const loadOffers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/offers`);
      setOffers(response.data);
    } catch (err) {
      console.error('Error loading offers:', err);
    }
    setLoading(false);
  };

  const loadUniversities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/universities`);
      setUniversities(response.data);
    } catch (err) {
      console.error('Error loading universities:', err);
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/messages`);
      setMessages(response.data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
    setLoading(false);
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/applications`);
      setApplications(response.data);
    } catch (err) {
      console.error('Error loading applications:', err);
    }
    setLoading(false);
  };

  const loadHousing = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/housing`);
      setHousing(response.data);
    } catch (err) {
      console.error('Error loading housing:', err);
    }
    setLoading(false);
  };

  const loadChats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/chats`);
      setChats(response.data);
    } catch (err) {
      console.error('Error loading chats:', err);
    }
    setLoading(false);
  };

  const loadNewsletter = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/newsletter`);
      setNewsletterSubs(response.data);
    } catch (err) {
      console.error('Error loading newsletter:', err);
    }
    setLoading(false);
  };

  const deleteNewsletterSub = async (email) => {
    if (!window.confirm(`Supprimer ${email} de la newsletter ?`)) return;
    try {
      await axios.delete(`${API}/admin/newsletter/${encodeURIComponent(email)}`);
      setNewsletterSubs(prev => prev.filter(s => s.email !== email));
    } catch (err) {
      console.error('Error deleting subscriber:', err);
    }
  };

  // Chat functions
  const openChat = async (chat) => {
    setActiveChat(chat);
    setChatMessages(chat.messages || []);
    
    // Connect to WebSocket
    if (chatWsRef.current) {
      chatWsRef.current.close();
    }
    
    try {
      chatWsRef.current = new WebSocket(`${WS_URL}/ws/chat/${chat.id}/${token}`);
      
      chatWsRef.current.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            setChatMessages(prev => [...prev, data.message]);
          }
        } catch (e) {
          console.error('Error parsing chat message:', e);
        }
      };
    } catch (error) {
      console.error('Error connecting to chat WebSocket:', error);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !activeChat) return;
    
    try {
      const response = await axios.post(
        `${API}/chat/${activeChat.id}/message`,
        { content: newChatMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatMessages(prev => [...prev, response.data]);
      setNewChatMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const closeActiveChat = () => {
    if (chatWsRef.current) {
      chatWsRef.current.close();
      chatWsRef.current = null;
    }
    setActiveChat(null);
    setChatMessages([]);
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (chatWsRef.current) {
        chatWsRef.current.close();
      }
    };
  }, []);

  // User actions
  const toggleUserStatus = async (userId) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/toggle-status`);
      loadUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const makeAdmin = async (userId) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/make-admin`);
      loadUsers();
    } catch (err) {
      console.error('Error making admin:', err);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action est irréversible.')) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      loadUsers();
      loadStats();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  // Message actions
  const markAsRead = async (messageId) => {
    try {
      await axios.put(`${API}/admin/messages/${messageId}/read`);
      loadMessages();
      loadStats();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const replyToMessage = async (messageId, content) => {
    try {
      await axios.post(`${API}/admin/messages/${messageId}/reply`, {
        content,
        attachments: replyAttachments.map(a => a.url)
      });
      loadMessages();
      setShowReplyModal(null);
      setInlineReply('');
      setReplyAttachments([]);
      if (selectedMessage?.id === messageId) {
        const updated = await axios.get(`${API}/admin/messages`);
        const found = updated.data.find(m => m.id === messageId);
        if (found) setSelectedMessage(found);
      }
    } catch (err) {
      console.error('Error replying:', err);
    }
  };

  const handleReplyFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Fichier trop volumineux (max 10 Mo)'); return; }
    setUploadingReplyFile(true);
    try {
      // Try Cloudinary direct upload
      const sigRes = await axios.get(`${API}/upload/signature`);
      const { signature, timestamp, cloud_name, api_key, folder } = sigRes.data;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('signature', signature);
      fd.append('timestamp', String(timestamp));
      fd.append('api_key', api_key);
      fd.append('folder', folder);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setReplyAttachments(prev => [...prev, { name: file.name, url: data.secure_url }]);
    } catch (err) {
      // Fallback backend upload
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await axios.post(`${API}/upload`, fd, { timeout: 60000 });
        setReplyAttachments(prev => [...prev, { name: file.name, url: res.data.url }]);
      } catch (e2) {
        console.error('Upload error:', e2);
      }
    }
    setUploadingReplyFile(false);
    e.target.value = '';
  };

  // Application actions
  const updateApplicationStatus = async (appId, status, reason = null) => {
    try {
      let url = `${API}/admin/applications/${appId}/status?status=${status}`;
      if (reason) url += `&reason=${encodeURIComponent(reason)}`;
      await axios.put(url);
      loadApplications();
      loadStats();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => ({ ...prev, status, ...(reason ? { modifyReason: reason } : {}) }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleModifyStatus = (appId) => {
    setModifyAppId(appId);
    setModifyReason('');
    setShowModifyModal(true);
  };

  const submitModifyStatus = async () => {
    if (!modifyReason.trim()) return;
    await updateApplicationStatus(modifyAppId, 'modify', modifyReason);
    setShowModifyModal(false);
    setModifyReason('');
    setModifyAppId(null);
  };

  const sendApplicationMessage = async (appId) => {
    if (!appMessage.trim()) return;
    setSendingAppMessage(true);
    try {
      const res = await axios.post(`${API}/admin/applications/${appId}/message`, { content: appMessage });
      setAppMessages(prev => [...prev, res.data.data]);
      setAppMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
    setSendingAppMessage(false);
  };

  const loadAppMessages = async (appId) => {
    try {
      const res = await axios.get(`${API}/admin/applications/${appId}/messages`);
      setAppMessages(res.data);
    } catch (err) {
      setAppMessages([]);
    }
  };

  const openApplicationDetail = (app) => {
    setSelectedApp(app);
    loadAppMessages(app.id);
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesSearch = appSearchQuery === '' || 
        (app.firstName + ' ' + app.lastName).toLowerCase().includes(appSearchQuery.toLowerCase()) ||
        app.userEmail?.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
        app.offerTitle?.toLowerCase().includes(appSearchQuery.toLowerCase());
      const matchesStatus = appStatusFilter === 'all' || app.status === appStatusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  // Offer actions
  const deleteOffer = async (offerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre?')) return;
    try {
      await axios.delete(`${API}/admin/offers/${offerId}`);
      loadOffers();
      loadStats();
    } catch (err) {
      console.error('Error deleting offer:', err);
    }
  };

  // University actions
  const deleteUniversity = async (uniId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette université?')) return;
    try {
      await axios.delete(`${API}/admin/universities/${uniId}`);
      loadUniversities();
      loadStats();
    } catch (err) {
      console.error('Error deleting university:', err);
    }
  };

  // Payment Settings state
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);

  // Banner slides state
  const [bannerSlides, setBannerSlides] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);

  // Contact messages state
  const [contactMessages, setContactMessages] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  // FAQ state
  const [faqItems, setFaqItems] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);

  const loadBanners = async () => {
    setBannerLoading(true);
    try {
      const response = await axios.get(`${API}/admin/site-settings/banners`);
      setBannerSlides(response.data.slides || []);
    } catch (err) {
      console.error('Error loading banners:', err);
    }
    setBannerLoading(false);
  };

  const saveBanners = async (slides) => {
    try {
      await axios.post(`${API}/admin/site-settings/banners`, { slides });
      setBannerSlides(slides);
    } catch (err) {
      console.error('Error saving banners:', err);
    }
  };

  const loadTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const res = await axios.get(`${API}/admin/testimonials`);
      setTestimonials(res.data);
    } catch (err) { console.error('Error loading testimonials:', err); }
    setTestimonialsLoading(false);
  };

  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const res = await axios.get(`${API}/admin/contacts`);
      setContactMessages(res.data);
    } catch (err) { console.error('Error loading contacts:', err); }
    setContactsLoading(false);
  };

  const loadFaqs = async () => {
    setFaqLoading(true);
    try {
      const res = await axios.get(`${API}/admin/faqs`);
      setFaqItems(res.data.faqs || []);
    } catch (err) { console.error('Error loading FAQs:', err); }
    setFaqLoading(false);
  };

  const saveFaqs = async (faqs) => {
    try {
      await axios.post(`${API}/admin/faqs`, { faqs });
      setFaqItems(faqs);
    } catch (err) { console.error('Error saving FAQs:', err); }
  };

  const loadPaymentSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/payment-settings`);
      setPaymentSettings(response.data);
    } catch (err) {
      console.error('Error loading payment settings:', err);
    }
  };

  const savePaymentSettings = async (settings) => {
    try {
      await axios.post(`${API}/admin/payment-settings`, settings);
      setPaymentSettings(settings);
      setShowPaymentSettings(false);
    } catch (err) {
      console.error('Error saving payment settings:', err);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'offers', label: 'Offres', icon: GraduationCap, badge: stats?.offers },
    { id: 'universities', label: 'Universités', icon: Building, badge: stats?.universities },
    { id: 'scholarships', label: 'Bourses/Financement', icon: Award },
    { id: 'users', label: 'Utilisateurs', icon: Users, badge: stats?.users },
    { id: 'applications', label: 'Candidatures', icon: FileText, badge: stats?.pendingApplications },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: stats?.unreadMessages },
    { id: 'chats', label: 'Chat en direct', icon: Headphones, badge: chats?.length },
    { id: 'housing', label: 'Logements', icon: Home, badge: stats?.housing },
    { id: 'payment-settings', label: 'Paiements', icon: Settings },
    { id: 'terms-conditions', label: 'Conditions', icon: FileText },
    { id: 'banners', label: 'Banni\u00E8res', icon: Image },
    { id: 'testimonials', label: 'T\u00E9moignages', icon: Star },
    { id: 'contacts', label: 'Contacts', icon: PhoneCall },
    { id: 'faqs', label: 'FAQ', icon: HelpCircle },
    { id: 'newsletter', label: 'Newsletter', icon: Mail, badge: newsletterSubs?.length },
  ];

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'En attente' },
      reviewing: { color: 'bg-blue-100 text-blue-700', label: 'En examen' },
      accepted: { color: 'bg-green-100 text-green-700', label: 'Acceptée' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Refusée' },
      modify: { color: 'bg-orange-100 text-orange-700', label: 'À modifier' }
    };
    const c = config[status] || config.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1e3a5f] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold">Admin CMS</h1>
          <p className="text-sm text-blue-200">Winner's Consulting</p>
        </div>
        
        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-6 py-3 text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-white/10 border-r-4 border-white'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {menuItems.find(m => m.id === activeSection)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell size={20} />
              {stats?.unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.unreadMessages}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a56db] rounded-full flex items-center justify-center text-white font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {/* Dashboard */}
          {activeSection === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                <StatCard 
                  title="Utilisateurs" 
                  value={stats.users} 
                  icon={Users}
                  color="blue"
                />
                <StatCard 
                  title="Offres actives" 
                  value={stats.offers} 
                  icon={GraduationCap}
                  color="green"
                />
                <StatCard 
                  title="Candidatures" 
                  value={stats.applications} 
                  icon={FileText}
                  color="purple"
                  subtitle={`${stats.pendingApplications} en attente`}
                />
                <StatCard 
                  title="Messages" 
                  value={stats.messages} 
                  icon={MessageCircle}
                  color="orange"
                  subtitle={`${stats.unreadMessages} non lus`}
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => { setActiveSection('offers'); setShowOfferModal(true); }}
                      className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Plus size={18} />
                      Nouvelle offre
                    </button>
                    <button 
                      onClick={() => { setActiveSection('universities'); setShowUniversityModal(true); }}
                      className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Plus size={18} />
                      Nouvelle université
                    </button>
                    <button 
                      onClick={() => setActiveSection('applications')}
                      className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <FileText size={18} />
                      Voir candidatures
                    </button>
                    <button 
                      onClick={() => setActiveSection('messages')}
                      className="flex items-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <MessageCircle size={18} />
                      Voir messages
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Statistiques globales</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Universités partenaires</span>
                      <span className="font-semibold">{stats.universities}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Logements disponibles</span>
                      <span className="font-semibold">{stats.housing}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Taux d'acceptation</span>
                      <span className="font-semibold text-green-600">78%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Liste des utilisateurs ({users.length})</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Rechercher..." 
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a56db]"
                    />
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#1a56db] rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-gray-500">{u.phone || 'Pas de téléphone'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role === 'admin' ? 'Admin' : 'Utilisateur'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                u.isActive ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'
                              }`}
                              title={u.isActive ? 'Désactiver' : 'Activer'}
                            >
                              {u.isActive ? <X size={16} /> : <Check size={16} />}
                            </button>
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => makeAdmin(u.id)}
                                className="p-2 hover:bg-purple-50 text-purple-500 rounded-lg transition-colors"
                                title="Promouvoir admin"
                              >
                                <Users size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                              title="Supprimer l'utilisateur"
                              data-testid={`delete-user-${u.id}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Offers Section */}
          {activeSection === 'offers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Offres de programmes ({offers.length})</h3>
                <button
                  onClick={() => { setEditingItem(null); setShowOfferModal(true); }}
                  className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors"
                >
                  <Plus size={18} />
                  Nouvelle offre
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : offers.length === 0 ? (
                  <div className="p-12 text-center">
                    <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucune offre pour le moment</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programme</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Université</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vues</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {offers.map((offer) => (
                        <tr key={offer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={offer.image} 
                                alt={offer.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{offer.title}</p>
                                <p className="text-xs text-gray-500">{offer.degree} • {offer.duration}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{offer.university}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              offer.hasScholarship && !offer.isPartialScholarship ? 'bg-green-100 text-green-700' :
                              offer.isPartialScholarship ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {offer.hasScholarship && !offer.isPartialScholarship ? 'Bourse Complète' :
                               offer.isPartialScholarship ? 'Bourse Partielle' : 'Auto-financé'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{offer.views?.toLocaleString() || 0}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setEditingItem(offer); setShowOfferModal(true); }}
                                className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteOffer(offer.id)}
                                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Universities Section */}
          {activeSection === 'universities' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Universités partenaires ({universities.length})</h3>
                <button
                  onClick={() => { setEditingItem(null); setShowUniversityModal(true); }}
                  className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors"
                >
                  <Plus size={18} />
                  Nouvelle université
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-3 p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : universities.length === 0 ? (
                  <div className="col-span-3 bg-white rounded-xl p-12 text-center">
                    <Building size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucune université pour le moment</p>
                  </div>
                ) : (
                  universities.map((uni) => (
                    <div key={uni.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="h-32 bg-gray-100">
                        {uni.image && (
                          <img src={uni.image} alt={uni.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900">{uni.name}</h4>
                        <p className="text-sm text-gray-500">{uni.city}, {uni.country}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-gray-400">{uni.views || 0} vues</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingItem(uni); setShowUniversityModal(true); }}
                              className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteUniversity(uni.id)}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Applications Section */}
          {activeSection === 'applications' && (
            <div data-testid="applications-admin-section">
              {/* Modify Reason Modal */}
              {showModifyModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="modify-modal">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                      <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Demander une modification
                      </h3>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-600 mb-3">Indiquez la raison pour laquelle le candidat doit modifier sa candidature :</p>
                      <textarea
                        data-testid="modify-reason-input"
                        value={modifyReason}
                        onChange={(e) => setModifyReason(e.target.value)}
                        placeholder="Ex: Le passeport soumis est illisible, veuillez soumettre une copie plus claire..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none h-32"
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => { setShowModifyModal(false); setModifyReason(''); }}
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          data-testid="modify-submit-btn"
                          onClick={submitModifyStatus}
                          disabled={!modifyReason.trim()}
                          className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Envoyer la demande
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Detail View */}
              {selectedApp ? (
                <div className="space-y-6" data-testid="application-detail-view">
                  {/* Header */}
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] px-6 py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          data-testid="back-to-list-btn"
                          onClick={() => setSelectedApp(null)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            {selectedApp.firstName} {selectedApp.lastName}
                          </h3>
                          <p className="text-blue-200 text-sm">{selectedApp.offerTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(selectedApp.status)}
                        <span className="text-blue-200 text-xs">
                          {new Date(selectedApp.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column: Personal Info + Documents */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Personal Information */}
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <User size={18} className="text-[#1e3a5f]" />
                            Informations personnelles
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[
                              { icon: User, label: 'Nom complet', value: `${selectedApp.firstName} ${selectedApp.lastName}` },
                              { icon: Mail, label: 'Email', value: selectedApp.userEmail },
                              { icon: Phone, label: 'Téléphone', value: selectedApp.phoneNumber || '—' },
                              { icon: MapPin, label: 'Adresse', value: selectedApp.address || '—' },
                              { icon: ClipboardList, label: 'Nationalité', value: selectedApp.nationality || '—' },
                              { icon: User, label: 'Sexe', value: selectedApp.sex === 'M' ? 'Masculin' : selectedApp.sex === 'F' ? 'Féminin' : (selectedApp.sex || '—') },
                              { icon: FileText, label: 'N° Passeport', value: selectedApp.passportNumber || '—' },
                              { icon: Calendar, label: 'Date de naissance', value: selectedApp.dateOfBirth || '—' },
                            ].map((item, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-gray-50">
                                  <item.icon size={16} className="text-gray-500" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</p>
                                  <p className="text-sm text-gray-800 font-medium mt-0.5">{item.value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {selectedApp.additionalPrograms?.length > 0 && (
                            <div className="mt-5 pt-5 border-t border-gray-100">
                              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Programmes additionnels</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedApp.additionalPrograms.map((p, i) => (
                                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{p}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Paperclip size={18} className="text-[#1e3a5f]" />
                            Documents téléversés ({selectedApp.documents?.length || 0})
                          </h4>
                        </div>
                        <div className="p-6">
                          {selectedApp.documents?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {selectedApp.documents.map((doc, i) => {
                                const docName = typeof doc === 'string' ? doc : (doc.name || doc.label || `Document ${i + 1}`);
                                const docUrl = typeof doc === 'string' ? doc : (doc.url || doc.file || doc);
                                const isCloudinary = typeof docUrl === 'string' && docUrl.includes('cloudinary');
                                const isImage = typeof docUrl === 'string' && /\.(jpg|jpeg|png|gif|webp)/i.test(docUrl);
                                return (
                                  <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-[#1e3a5f]/30 hover:shadow-sm transition-all group">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2.5 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                        <FileText size={18} className="text-[#1e3a5f]" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{docName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                          {isCloudinary ? 'Cloudinary' : 'Fichier téléversé'}
                                        </p>
                                      </div>
                                    </div>
                                    {typeof docUrl === 'string' && docUrl.startsWith('http') && (
                                      <div className="flex gap-2 mt-3">
                                        <a
                                          href={docUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          data-testid={`view-doc-${i}`}
                                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700 transition-colors"
                                        >
                                          <Eye size={14} /> Voir
                                        </a>
                                        <a
                                          href={docUrl}
                                          download
                                          data-testid={`download-doc-${i}`}
                                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 rounded-lg text-xs font-medium text-[#1e3a5f] transition-colors"
                                        >
                                          <Download size={14} /> Télécharger
                                        </a>
                                      </div>
                                    )}
                                    {isImage && typeof docUrl === 'string' && (
                                      <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
                                        <img src={docUrl} alt={docName} className="w-full h-32 object-cover" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <FileText size={32} className="mx-auto text-gray-200 mb-2" />
                              <p className="text-sm text-gray-400">Aucun document téléversé</p>
                            </div>
                          )}

                          {/* Payment proof */}
                          {selectedApp.paymentProof && (
                            <div className="mt-5 pt-5 border-t border-gray-100">
                              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Preuve de paiement</p>
                              <div className="border border-gray-100 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-lg bg-green-50">
                                    <CreditCard size={18} className="text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">
                                      {selectedApp.paymentMethod || 'Preuve de paiement'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Montant: {selectedApp.paymentAmount} {selectedApp.paymentAmount ? 'CNY' : ''}
                                    </p>
                                  </div>
                                  <a
                                    href={selectedApp.paymentProof.startsWith('http') ? selectedApp.paymentProof : `${BACKEND_URL}${selectedApp.paymentProof}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-testid="view-payment-proof"
                                    className="px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-xs font-medium text-green-700 transition-colors flex items-center gap-1.5"
                                  >
                                    <ExternalLink size={14} /> Voir
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Modify reason display */}
                      {selectedApp.status === 'modify' && selectedApp.modifyReason && (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5" data-testid="modify-reason-display">
                          <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-orange-500 mt-0.5" />
                            <div>
                              <p className="font-semibold text-orange-800 text-sm">Modification demandée</p>
                              <p className="text-sm text-orange-700 mt-1">{selectedApp.modifyReason}</p>
                              {selectedApp.modifyRequestedAt && (
                                <p className="text-xs text-orange-400 mt-2">
                                  {new Date(selectedApp.modifyRequestedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right column: Actions + Messaging */}
                    <div className="space-y-6">
                      {/* Quick Actions */}
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                          <h4 className="font-semibold text-gray-900 text-sm">Actions rapides</h4>
                        </div>
                        <div className="p-4 space-y-2">
                          {[
                            { status: 'reviewing', label: 'En examen', icon: Eye, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                            { status: 'accepted', label: 'Accepter', icon: CheckCircle, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                            { status: 'rejected', label: 'Refuser', icon: XCircle, color: 'bg-red-50 text-red-700 hover:bg-red-100' },
                          ].map(action => (
                            <button
                              key={action.status}
                              data-testid={`action-${action.status}`}
                              onClick={() => updateApplicationStatus(selectedApp.id, action.status)}
                              disabled={selectedApp.status === action.status}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${action.color} disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              <action.icon size={16} />
                              {action.label}
                            </button>
                          ))}
                          <button
                            data-testid="action-modify"
                            onClick={() => handleModifyStatus(selectedApp.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all"
                          >
                            <RefreshCw size={16} />
                            Demander modification
                          </button>

                          {/* Payment status */}
                          <div className="pt-3 mt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 px-1">Statut paiement</p>
                            <select
                              data-testid="payment-status-select"
                              value={selectedApp.paymentStatus || 'pending'}
                              onChange={async (e) => {
                                try {
                                  await axios.put(`${API}/admin/applications/${selectedApp.id}/payment-status?payment_status=${e.target.value}`);
                                  setSelectedApp(prev => ({ ...prev, paymentStatus: e.target.value }));
                                  loadApplications();
                                } catch (err) {
                                  console.error('Error updating payment status:', err);
                                }
                              }}
                              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                            >
                              <option value="pending">En attente</option>
                              <option value="submitted">Soumis</option>
                              <option value="verified">Vérifié</option>
                              <option value="rejected">Rejeté</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Messaging */}
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" data-testid="application-messaging">
                        <div className="px-6 py-4 border-b border-gray-100">
                          <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                            <MessageCircle size={16} className="text-[#1e3a5f]" />
                            Messages au candidat
                          </h4>
                        </div>
                        <div className="flex flex-col" style={{ maxHeight: '400px' }}>
                          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '120px', maxHeight: '280px' }}>
                            {appMessages.length === 0 ? (
                              <div className="text-center py-6">
                                <MessageCircle size={24} className="mx-auto text-gray-200 mb-2" />
                                <p className="text-xs text-gray-400">Aucun message envoyé</p>
                              </div>
                            ) : (
                              appMessages.map((msg, i) => (
                                <div key={msg.id || i} className="bg-[#1e3a5f]/5 rounded-xl px-4 py-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-medium text-[#1e3a5f]">{msg.adminName || 'Admin'}</p>
                                    <p className="text-[10px] text-gray-400">
                                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-700">{msg.content}</p>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="p-4 border-t border-gray-100">
                            <div className="flex gap-2">
                              <input
                                data-testid="app-message-input"
                                value={appMessage}
                                onChange={(e) => setAppMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendApplicationMessage(selectedApp.id)}
                                placeholder="Écrire un message..."
                                className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                              />
                              <button
                                data-testid="send-app-message-btn"
                                onClick={() => sendApplicationMessage(selectedApp.id)}
                                disabled={!appMessage.trim() || sendingAppMessage}
                                className="p-2.5 bg-[#1e3a5f] text-white rounded-xl hover:bg-[#2a5298] transition-colors disabled:opacity-40"
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Applications List View */
                <div className="space-y-4" data-testid="applications-list-view">
                  {/* Header with search + filters */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        Candidatures <span className="text-gray-400 font-normal text-base">({applications.length})</span>
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            data-testid="app-search-input"
                            value={appSearchQuery}
                            onChange={(e) => setAppSearchQuery(e.target.value)}
                            placeholder="Rechercher un candidat..."
                            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                          />
                        </div>
                        <select
                          data-testid="app-status-filter"
                          value={appStatusFilter}
                          onChange={(e) => setAppStatusFilter(e.target.value)}
                          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                        >
                          <option value="all">Tous les statuts</option>
                          <option value="pending">En attente</option>
                          <option value="reviewing">En examen</option>
                          <option value="accepted">Acceptée</option>
                          <option value="rejected">Refusée</option>
                          <option value="modify">À modifier</option>
                        </select>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {[
                        { status: 'pending', label: 'En attente', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                        { status: 'reviewing', label: 'En examen', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                        { status: 'accepted', label: 'Acceptées', color: 'bg-green-50 text-green-700 border-green-200' },
                        { status: 'rejected', label: 'Refusées', color: 'bg-red-50 text-red-700 border-red-200' },
                        { status: 'modify', label: 'À modifier', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                      ].map(pill => {
                        const count = applications.filter(a => a.status === pill.status).length;
                        return (
                          <button
                            key={pill.status}
                            onClick={() => setAppStatusFilter(prev => prev === pill.status ? 'all' : pill.status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              appStatusFilter === pill.status ? pill.color + ' ring-2 ring-offset-1 ring-current/20' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {pill.label} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Loading / Empty / List */}
                  {loading ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : getFilteredApplications().length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                      <FileText size={48} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-gray-500">
                        {applications.length === 0 ? 'Aucune candidature pour le moment' : 'Aucun résultat pour cette recherche'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getFilteredApplications().map((app) => (
                        <div
                          key={app.id}
                          data-testid={`application-card-${app.id}`}
                          onClick={() => openApplicationDetail(app)}
                          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-[#1e3a5f]/10 overflow-hidden"
                        >
                          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Avatar */}
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {(app.firstName?.[0] || app.userName?.[0] || '?').toUpperCase()}{(app.lastName?.[0] || '').toUpperCase()}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {app.firstName || app.userName?.split(' ')[0]} {app.lastName || app.userName?.split(' ')[1] || ''}
                                </h4>
                                {getStatusBadge(app.status)}
                                {app.status === 'modify' && (
                                  <span className="text-orange-500" title="Modification demandée">
                                    <AlertTriangle size={14} />
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-0.5 truncate">{app.offerTitle}</p>
                              <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><Mail size={12} /> {app.userEmail}</span>
                                {app.nationality && <span className="flex items-center gap-1"><MapPin size={12} /> {app.nationality}</span>}
                              </div>
                            </div>
                            {/* Right info */}
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-xs text-gray-400">
                                  {new Date(app.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </p>
                                {app.documents?.length > 0 && (
                                  <p className="text-xs text-[#1e3a5f] font-medium mt-0.5">
                                    {app.documents.length} doc{app.documents.length > 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                              <ChevronRight size={18} className="text-gray-300" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Messages Section */}
          {activeSection === 'messages' && (
            <div className="flex gap-6 h-[calc(100vh-200px)]" data-testid="messages-admin-section">
              {/* Messages List (left panel) */}
              <div className="w-80 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Messages ({messages.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">Aucun message</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (!msg.isRead) markAsRead(msg.id);
                        }}
                        data-testid={`msg-item-${msg.id}`}
                        className={`w-full p-4 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          selectedMessage?.id === msg.id ? 'bg-blue-50' : ''
                        } ${!msg.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {msg.senderName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 truncate text-sm">{msg.senderName}</p>
                              {!msg.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-gray-700 truncate">{msg.subject}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {msg.replies?.length > 0 
                                ? msg.replies[msg.replies.length - 1].content
                                : msg.content}
                            </p>
                          </div>
                        </div>
                        <div className="text-right mt-1">
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                          {msg.replies?.length > 0 && (
                            <span className="ml-2 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              {msg.replies.length} rép.
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Conversation Window (right panel) */}
              <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                {selectedMessage ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {selectedMessage.senderName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedMessage.senderName}</p>
                          <p className="text-xs text-gray-500">{selectedMessage.senderEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {new Date(selectedMessage.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          onClick={() => setSelectedMessage(null)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="px-4 py-2 bg-gray-50 border-b">
                      <p className="text-sm font-medium text-gray-700">Sujet : {selectedMessage.subject}</p>
                    </div>

                    {/* Messages Thread */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                      <div className="space-y-3">
                        {/* Original message (user - left) */}
                        <div className="flex justify-start">
                          <div className="max-w-[70%] rounded-2xl px-4 py-2 bg-white text-gray-800 shadow-sm rounded-bl-md">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                {selectedMessage.senderName?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <span className="text-xs font-medium text-blue-600">{selectedMessage.senderName}</span>
                            </div>
                            <p className="text-sm">{selectedMessage.content}</p>
                            {selectedMessage.attachments?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {selectedMessage.attachments.map((url, aidx) => (
                                  <a key={aidx} href={url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline">
                                    <FileText size={12} />
                                    Pièce jointe {aidx + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(selectedMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        {/* Replies */}
                        {selectedMessage.replies?.map((reply, idx) => (
                          <div key={idx} className={`flex ${reply.isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                reply.isAdmin
                                  ? 'bg-[#1a56db] text-white rounded-br-md'
                                  : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                              }`}
                            >
                              <div className={`flex items-center gap-2 mb-1 ${reply.isAdmin ? 'justify-end' : ''}`}>
                                {!reply.isAdmin && (
                                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                    {selectedMessage.senderName?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                )}
                                <span className={`text-xs font-medium ${reply.isAdmin ? 'text-blue-100' : 'text-blue-600'}`}>
                                  {reply.isAdmin ? (reply.adminName || 'Admin') : selectedMessage.senderName}
                                </span>
                                {reply.isAdmin && (
                                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                    A
                                  </div>
                                )}
                              </div>
                              <p className="text-sm">{reply.content}</p>
                              {reply.attachments?.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {reply.attachments.map((url, aidx) => (
                                    <a key={aidx} href={url} target="_blank" rel="noopener noreferrer"
                                      className={`flex items-center gap-1 text-xs underline ${reply.isAdmin ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}>
                                      <FileText size={12} />
                                      Pièce jointe {aidx + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                              <p className={`text-xs mt-1 ${reply.isAdmin ? 'text-blue-100' : 'text-gray-400'}`}>
                                {new Date(reply.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reply Input */}
                    <div className="border-t">
                      {/* Attached files preview */}
                      {replyAttachments.length > 0 && (
                        <div className="px-4 pt-3 flex flex-wrap gap-2">
                          {replyAttachments.map((att, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs">
                              <FileText size={12} />
                              <span className="max-w-[120px] truncate">{att.name}</span>
                              <button onClick={() => setReplyAttachments(prev => prev.filter((_, i) => i !== idx))}
                                className="ml-1 hover:text-red-500">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (inlineReply.trim() || replyAttachments.length > 0) {
                            replyToMessage(selectedMessage.id, inlineReply.trim() || (replyAttachments.length > 0 ? 'Fichier(s) joint(s)' : ''));
                          }
                        }}
                        className="p-4"
                      >
                        <div className="flex gap-2 items-center">
                          <label
                            className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors ${uploadingReplyFile ? 'opacity-50 pointer-events-none' : ''}`}
                            data-testid="admin-reply-attach-btn"
                          >
                            {uploadingReplyFile ? (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleReplyFileUpload}
                              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                            />
                          </label>
                          <input
                            type="text"
                            value={inlineReply}
                            onChange={(e) => setInlineReply(e.target.value)}
                            placeholder="Écrivez votre réponse..."
                            data-testid="message-reply-input"
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#1a56db]"
                          />
                          <button
                            type="submit"
                            disabled={!inlineReply.trim() && replyAttachments.length === 0}
                            data-testid="message-reply-send-btn"
                            className="w-10 h-10 bg-[#1a56db] hover:bg-[#1648b8] text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Sélectionnez un message</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Housing Section */}
          {activeSection === 'housing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Logements ({housing.length})</h3>
                <button 
                  onClick={() => { setEditingItem(null); setShowHousingModal(true); }}
                  className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors"
                >
                  <Plus size={18} />
                  Nouveau logement
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : housing.length === 0 ? (
                  <div className="p-12 text-center">
                    <Home size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucun logement pour le moment</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-6 p-6">
                    {housing.map((h) => (
                      <div key={h.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-32 bg-gray-100">
                          {h.image && <img src={h.image} alt={h.type} className="w-full h-full object-cover" />}
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900">{h.type}</h4>
                          <p className="text-sm text-gray-500">{h.location}, {h.city}</p>
                          <p className="text-[#1a56db] font-medium mt-2">{h.priceRange}</p>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => { setEditingItem(h); setShowHousingModal(true); }}
                              className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Supprimer ce logement?')) {
                                  await axios.delete(`${API}/admin/housing/${h.id}`);
                                  loadHousing();
                                }
                              }}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chats Section */}
          {activeSection === 'chats' && (
            <div className="flex gap-6 h-[calc(100vh-200px)]">
              {/* Chat List */}
              <div className="w-80 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Conversations actives ({chats.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : chats.length === 0 ? (
                    <div className="p-8 text-center">
                      <Headphones size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">Aucun chat actif</p>
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => openChat(chat)}
                        className={`w-full p-4 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          activeChat?.id === chat.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1a56db] rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {chat.userName?.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{chat.userName}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {chat.messages?.length > 0 
                                ? chat.messages[chat.messages.length - 1].content 
                                : 'Nouvelle conversation'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                {activeChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1a56db] rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {activeChat.userName?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{activeChat.userName}</p>
                          <p className="text-xs text-gray-500">{activeChat.userEmail}</p>
                        </div>
                      </div>
                      <button
                        onClick={closeActiveChat}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                      {chatMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          Début de la conversation
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {chatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                  msg.isAdmin
                                    ? 'bg-[#1a56db] text-white rounded-br-md'
                                    : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${msg.isAdmin ? 'text-blue-100' : 'text-gray-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={chatMessagesEndRef} />
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={sendChatMessage} className="p-4 border-t">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newChatMessage}
                          onChange={(e) => setNewChatMessage(e.target.value)}
                          placeholder="Écrivez votre message..."
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#1a56db]"
                        />
                        <button
                          type="submit"
                          disabled={!newChatMessage.trim()}
                          className="w-10 h-10 bg-[#1a56db] hover:bg-[#1648b8] text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Headphones size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Sélectionnez une conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Settings Section */}
          {activeSection === 'payment-settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Paramètres de paiement</h3>
              </div>

              {paymentSettings ? (
                <PaymentSettingsForm
                  settings={paymentSettings}
                  onSave={savePaymentSettings}
                />
              ) : (
                <div className="bg-white rounded-xl p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}
            </div>
          )}


          {/* Banners Management Section */}
          {activeSection === 'banners' && (
            <BannersManager slides={bannerSlides} loading={bannerLoading} onSave={saveBanners} token={token} />
          )}

          {/* Testimonials Management Section */}
          {activeSection === 'testimonials' && (
            <TestimonialsManager testimonials={testimonials} loading={testimonialsLoading} onReload={loadTestimonials} />
          )}

          {/* Contact Messages Section */}
          {activeSection === 'contacts' && (
            <ContactsManager contacts={contactMessages} loading={contactsLoading} onReload={loadContacts} />
          )}

          {/* FAQ Management Section */}
          {activeSection === 'faqs' && (
            <FAQManager faqs={faqItems} loading={faqLoading} onSave={saveFaqs} />
          )}

          {/* Newsletter Section */}
          {activeSection === 'newsletter' && (
            <div className="space-y-6" data-testid="newsletter-admin-section">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Abonnés Newsletter ({newsletterSubs.length})</h3>
                {newsletterSubs.length > 0 && (
                  <button
                    onClick={() => {
                      const csv = "Email,Date d'inscription\n" + newsletterSubs.map(s => `${s.email},${s.subscribedAt}`).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = 'newsletter_abonnes.csv'; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    data-testid="newsletter-export-btn"
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Exporter CSV
                  </button>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : newsletterSubs.length === 0 ? (
                  <div className="p-12 text-center">
                    <Mail size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucun abonné pour le moment</p>
                    <p className="text-sm text-gray-400 mt-2">Les visiteurs peuvent s'inscrire via le formulaire en bas de page</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date d'inscription</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {newsletterSubs.map((sub, idx) => (
                        <tr key={sub.email} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">{sub.email}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deleteNewsletterSub(sub.email)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              data-testid={`newsletter-delete-${idx}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Scholarships Section - Shows scholarship offers */}
          {/* Terms & Conditions Section */}
          {activeSection === 'terms-conditions' && (
            <div className="space-y-6" data-testid="terms-conditions-section">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Conditions Générales de Candidature</h3>
              </div>
              <p className="text-sm text-gray-500">
                Ces conditions seront affichées aux candidats avant de soumettre leur candidature.
              </p>

              {paymentSettings ? (
                <TermsConditionsEditor
                  settings={paymentSettings}
                  onSave={savePaymentSettings}
                />
              ) : (
                <div className="bg-white rounded-xl p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'scholarships' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Bourses & Opportunités de Financement</h3>
                <button
                  onClick={() => { setEditingOffer(null); setShowOfferModal(true); }}
                  className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors"
                >
                  <Plus size={18} />
                  Nouvelle Bourse
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Les bourses sont gérées via les offres. Pour ajouter une nouvelle bourse, créez une offre avec le type "Bourse Complète" ou "Bourse Partielle".
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h4 className="font-medium text-gray-900">Offres avec bourses ({offers.filter(o => o.hasScholarship).length})</h4>
                </div>
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : offers.filter(o => o.hasScholarship).length === 0 ? (
                  <div className="p-12 text-center">
                    <Award size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucune offre avec bourse</p>
                    <p className="text-sm text-gray-400">Créez une offre avec l'option "Bourse" activée</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Université</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Couverture</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {offers.filter(o => o.hasScholarship).map((offer) => (
                        <tr key={offer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={offer.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100'} alt="" className="w-10 h-10 rounded object-cover" />
                              <div>
                                <p className="font-medium text-gray-900">{offer.title}</p>
                                <p className="text-xs text-gray-500">{offer.degree} • {offer.duration}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{offer.university}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              offer.isPartialScholarship ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {offer.isPartialScholarship ? 'Bourse Partielle' : 'Bourse Complète'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {offer.scholarshipTuition === 0 ? 'Frais: 100%' : `Frais réduits: ${offer.scholarshipTuition?.toLocaleString() || 0}`}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setEditingOffer(offer); setShowOfferModal(true); }}
                                className="p-2 text-gray-500 hover:text-[#1a56db] hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteOffer(offer.id)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <ReplyModal 
          message={showReplyModal}
          onClose={() => setShowReplyModal(null)}
          onSubmit={replyToMessage}
        />
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <OfferFormModal
          offer={editingItem}
          onClose={() => { setShowOfferModal(false); setEditingItem(null); }}
          onSuccess={() => { setShowOfferModal(false); setEditingItem(null); loadOffers(); loadStats(); }}
        />
      )}

      {/* University Modal */}
      {showUniversityModal && (
        <UniversityFormModal
          university={editingItem}
          onClose={() => { setShowUniversityModal(false); setEditingItem(null); }}
          onSuccess={() => { setShowUniversityModal(false); setEditingItem(null); loadUniversities(); loadStats(); }}
        />
      )}

      {/* Housing Modal */}
      {showHousingModal && (
        <HousingFormModal
          housing={editingItem}
          onClose={() => { setShowHousingModal(false); setEditingItem(null); }}
          onSuccess={() => { setShowHousingModal(false); setEditingItem(null); loadHousing(); loadStats(); }}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <TrendingUp size={20} className="text-green-500" />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

// Reply Modal Component
const ReplyModal = ({ message, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(message.id, content);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-900">Répondre au message</h3>
          <p className="text-sm text-gray-500">À: {message.senderName} ({message.senderEmail})</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">{message.subject}</p>
            <p className="text-sm text-gray-600">{message.content}</p>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none"
            rows={4}
            placeholder="Votre réponse..."
            required
          />
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Offer Form Modal
const OfferFormModal = ({ offer, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(offer || {
    title: '',
    university: '',
    city: '',
    country: 'Chine',
    countryCode: 'CN',
    category: 'engineering',
    categoryLabel: 'Ingénierie',
    degree: 'Master',
    duration: '2 ans',
    teachingLanguage: 'Anglais',
    intake: 'Automne 2025',
    deadline: '',
    image: '',
    originalTuition: 0,
    scholarshipTuition: 0,
    currency: 'CNY',
    scholarshipType: '',
    hasScholarship: false,
    isPartialScholarship: false,
    isSelfFinanced: true,
    isOnline: false,
    isNew: true,
    badges: [],
    description: '',
    requirements: { age: '', previousDegree: '', gpa: '', language: '', otherRequirements: [] },
    scholarshipDetails: { tuitionCovered: false, accommodationCovered: false, monthlyAllowance: 0, insuranceCovered: false },
    fees: { originalTuition: 0, scholarshipTuition: 0, accommodationDouble: 0, accommodationSingle: 0, registrationFee: 0, insuranceFee: 0, applicationFee: 0, booksFee: 0, otherFees: [] },
    admissionConditions: [],
    requiredDocuments: [],
    documentTemplates: [{}, {}, {}],
    documents: [],
    serviceFee: 0
  });

  // Update formData when offer prop changes (for edit mode)
  useEffect(() => {
    if (offer) {
      setFormData({
        ...offer,
        // Ensure arrays are initialized even if missing from offer
        admissionConditions: offer.admissionConditions || [],
        requiredDocuments: offer.requiredDocuments || [],
        documentTemplates: offer.documentTemplates || [{}, {}, {}],
        fees: {
          ...offer.fees,
          otherFees: offer.fees?.otherFees || []
        }
      });
    }
  }, [offer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (offer) {
        await axios.put(`${API}/admin/offers/${offer.id}`, formData);
      } else {
        await axios.post(`${API}/admin/offers`, formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving offer:', err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">
            {offer ? 'Modifier l\'offre' : 'Nouvelle offre'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Université</label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({...formData, university: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData({
                  ...formData, 
                  countryCode: e.target.value,
                  country: e.target.value === 'CN' ? 'Chine' : 'France',
                  currency: e.target.value === 'CN' ? 'CNY' : 'EUR'
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              >
                <option value="CN">Chine</option>
                <option value="FR">France</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diplôme</label>
              <select
                value={formData.degree}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              >
                <option value="Licence">Licence</option>
                <option value="Master">Master</option>
                <option value="Doctorat">Doctorat</option>
                <option value="MBA">MBA</option>
                <option value="Certificat">Certificat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const categoryMap = {
                    'engineering': 'Ingénierie',
                    'medicine': 'Médecine',
                    'business': 'Gestion',
                    'economics': 'Économie',
                    'science': 'Sciences',
                    'law': 'Droit',
                    'arts': 'Arts & Design',
                    'literature': 'Littérature',
                    'chinese': 'Langue Chinoise',
                    'french': 'Langue Française'
                  };
                  setFormData({
                    ...formData, 
                    category: e.target.value,
                    categoryLabel: categoryMap[e.target.value] || e.target.value
                  });
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              >
                <option value="engineering">Ingénierie</option>
                <option value="medicine">Médecine</option>
                <option value="business">Gestion</option>
                <option value="economics">Économie</option>
                <option value="science">Sciences</option>
                <option value="law">Droit</option>
                <option value="arts">Arts & Design</option>
                <option value="literature">Littérature</option>
                <option value="chinese">Langue Chinoise</option>
                <option value="french">Langue Française</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                placeholder="Ex: 2 ans"
              />
            </div>
            
            {/* SECTION 1: Champs simples ajoutés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Langue d'enseignement</label>
              <select
                value={formData.teachingLanguage || 'Anglais'}
                onChange={(e) => setFormData({...formData, teachingLanguage: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              >
                <option value="Anglais">Anglais</option>
                <option value="Français">Français</option>
                <option value="Chinois">Chinois</option>
                <option value="Bilingue (Anglais/Chinois)">Bilingue (Anglais/Chinois)</option>
                <option value="Bilingue (Français/Anglais)">Bilingue (Français/Anglais)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rentrée</label>
              <select
                value={formData.intake || 'Automne 2025'}
                onChange={(e) => setFormData({...formData, intake: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              >
                <option value="Automne 2025">Automne 2025</option>
                <option value="Printemps 2025">Printemps 2025</option>
                <option value="Automne 2026">Automne 2026</option>
                <option value="Printemps 2026">Printemps 2026</option>
                <option value="Septembre 2025">Septembre 2025</option>
                <option value="Février 2025">Février 2025</option>
                <option value="Septembre 2026">Septembre 2026</option>
                <option value="Février 2026">Février 2026</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite de candidature</label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais originaux</label>
              <input
                type="number"
                value={formData.originalTuition}
                onChange={(e) => setFormData({...formData, originalTuition: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais après bourse</label>
              <input
                type="number"
                value={formData.scholarshipTuition}
                onChange={(e) => setFormData({...formData, scholarshipTuition: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none"
              rows={3}
            />
          </div>

          {/* SECTION 2: Frais universitaires détaillés */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Frais Universitaires ({formData.currency || 'CNY'})
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Frais de scolarité</label>
                <input
                  type="number"
                  value={formData.fees?.tuitionFee || formData.originalTuition || 0}
                  onChange={(e) => setFormData({...formData, fees: {...(formData.fees || {}), tuitionFee: Number(e.target.value)}})}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Frais d'inscription</label>
                <input
                  type="number"
                  value={formData.fees?.registrationFee || 0}
                  onChange={(e) => setFormData({...formData, fees: {...(formData.fees || {}), registrationFee: Number(e.target.value)}})}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Logement (double)</label>
                <input
                  type="number"
                  value={formData.fees?.accommodationDouble || 0}
                  onChange={(e) => setFormData({...formData, fees: {...(formData.fees || {}), accommodationDouble: Number(e.target.value)}})}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Logement (simple)</label>
                <input
                  type="number"
                  value={formData.fees?.accommodationSingle || 0}
                  onChange={(e) => setFormData({...formData, fees: {...(formData.fees || {}), accommodationSingle: Number(e.target.value)}})}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Assurance</label>
                <input
                  type="number"
                  value={formData.fees?.insuranceFee || 0}
                  onChange={(e) => setFormData({...formData, fees: {...(formData.fees || {}), insuranceFee: Number(e.target.value)}})}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Livres et matériels</label>
                <input
                  type="number"
                  value={formData.fees?.booksFee || 0}
                  onChange={(e) => setFormData({...formData, fees: {...(formData.fees || {}), booksFee: Number(e.target.value)}})}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            {/* Autres frais personnalisés */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">Autres frais (optionnel)</label>
                <button
                  type="button"
                  onClick={() => {
                    const otherFees = formData.fees?.otherFees || [];
                    setFormData({
                      ...formData,
                      fees: {
                        ...(formData.fees || {}),
                        otherFees: [...otherFees, { name: '', amount: 0 }]
                      }
                    });
                  }}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  + Ajouter
                </button>
              </div>
              {(formData.fees?.otherFees || []).map((fee, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={fee.name}
                    onChange={(e) => {
                      const otherFees = [...(formData.fees?.otherFees || [])];
                      otherFees[index] = { ...otherFees[index], name: e.target.value };
                      setFormData({...formData, fees: {...(formData.fees || {}), otherFees}});
                    }}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Nom du frais"
                  />
                  <input
                    type="number"
                    value={fee.amount}
                    onChange={(e) => {
                      const otherFees = [...(formData.fees?.otherFees || [])];
                      otherFees[index] = { ...otherFees[index], amount: Number(e.target.value) };
                      setFormData({...formData, fees: {...(formData.fees || {}), otherFees}});
                    }}
                    className="w-28 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Montant"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const otherFees = (formData.fees?.otherFees || []).filter((_, i) => i !== index);
                      setFormData({...formData, fees: {...(formData.fees || {}), otherFees}});
                    }}
                    className="px-2 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fees Section */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <h4 className="font-medium text-gray-900 mb-3">Frais de service Winner's Consulting</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frais de dossier ({formData.currency})</label>
                <input
                  type="number"
                  value={formData.fees?.applicationFee || 0}
                  onChange={(e) => setFormData({...formData, fees: {...formData.fees, applicationFee: Number(e.target.value)}})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frais de service ({formData.currency})</label>
                <input
                  type="number"
                  value={formData.serviceFee || 0}
                  onChange={(e) => setFormData({...formData, serviceFee: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Conditions d'admission */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Conditions d'Admission
              </h4>
              <button
                type="button"
                onClick={() => {
                  const admissionConditions = formData.admissionConditions || [];
                  setFormData({
                    ...formData,
                    admissionConditions: [...admissionConditions, { condition: '', description: '' }]
                  });
                }}
                className="text-sm px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une condition
              </button>
            </div>
            
            {(formData.admissionConditions || []).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune condition d'admission ajoutée. Cliquez sur "Ajouter une condition" pour commencer.
              </p>
            ) : (
              <div className="space-y-3">
                {(formData.admissionConditions || []).map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Condition {index + 1}
                          </label>
                          <input
                            type="text"
                            value={item.condition}
                            onChange={(e) => {
                              const admissionConditions = [...(formData.admissionConditions || [])];
                              admissionConditions[index] = { ...admissionConditions[index], condition: e.target.value };
                              setFormData({...formData, admissionConditions});
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                            placeholder="Ex: Diplôme de baccalauréat"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Description
                          </label>
                          <textarea
                            value={item.description}
                            onChange={(e) => {
                              const admissionConditions = [...(formData.admissionConditions || [])];
                              admissionConditions[index] = { ...admissionConditions[index], description: e.target.value };
                              setFormData({...formData, admissionConditions});
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                            rows={2}
                            placeholder="Ex: Un diplôme de fin d'études secondaires reconnu est requis avec une moyenne minimale de 12/20"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const admissionConditions = (formData.admissionConditions || []).filter((_, i) => i !== index);
                          setFormData({...formData, admissionConditions});
                        }}
                        className="self-start p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer cette condition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Suggestion de conditions courantes */}
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-xs text-gray-500 mb-2">Suggestions courantes :</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Diplôme requis',
                  'Niveau de langue',
                  'Âge minimum/maximum',
                  'Expérience professionnelle',
                  'Tests standardisés (IELTS, TOEFL, HSK)',
                  'Lettre de motivation'
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const admissionConditions = formData.admissionConditions || [];
                      const exists = admissionConditions.some(c => c.condition === suggestion);
                      if (!exists) {
                        setFormData({
                          ...formData,
                          admissionConditions: [...admissionConditions, { condition: suggestion, description: '' }]
                        });
                      }
                    }}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: Documents requis + Templates à uploader */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents Requis pour Candidature
              </h4>
              
              {/* Documents prédéfinis avec checkboxes */}
              <div className="bg-white rounded-lg p-3 border border-green-200 mb-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Documents standards (cochez ceux requis) :</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Passeport',
                    'Photo d\'identité',
                    'Diplôme de baccalauréat',
                    'Relevé de notes',
                    'Certificat de langue (IELTS/TOEFL/HSK)',
                    'Lettre de motivation',
                    'CV / Curriculum Vitae',
                    'Lettres de recommandation (2)',
                    'Certificat de naissance',
                    'Certificat médical',
                    'Preuve de ressources financières',
                    'Portfolio (pour arts/design)'
                  ].map((doc, idx) => (
                    <label key={idx} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(formData.requiredDocuments || []).includes(doc)}
                        onChange={(e) => {
                          const docs = formData.requiredDocuments || [];
                          if (e.target.checked) {
                            setFormData({...formData, requiredDocuments: [...docs, doc]});
                          } else {
                            setFormData({...formData, requiredDocuments: docs.filter(d => d !== doc)});
                          }
                        }}
                        className="mt-0.5 rounded border-gray-300"
                      />
                      <span className="text-gray-700">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Documents personnalisés */}
              <div className="bg-white rounded-lg p-3 border border-green-200 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">Documents personnalisés :</p>
                  <button
                    type="button"
                    onClick={() => {
                      const customDoc = prompt('Nom du document personnalisé :');
                      if (customDoc && customDoc.trim()) {
                        const docs = formData.requiredDocuments || [];
                        if (!docs.includes(customDoc.trim())) {
                          setFormData({...formData, requiredDocuments: [...docs, customDoc.trim()]});
                        }
                      }
                    }}
                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    + Ajouter
                  </button>
                </div>
                {(formData.requiredDocuments || []).filter(doc => 
                  !['Passeport', 'Photo d\'identité', 'Diplôme de baccalauréat', 'Relevé de notes', 
                    'Certificat de langue (IELTS/TOEFL/HSK)', 'Lettre de motivation', 'CV / Curriculum Vitae',
                    'Lettres de recommandation (2)', 'Certificat de naissance', 'Certificat médical',
                    'Preuve de ressources financières', 'Portfolio (pour arts/design)'].includes(doc)
                ).map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 px-2 bg-green-50 rounded mb-1">
                    <span className="text-sm text-gray-700">{doc}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const docs = (formData.requiredDocuments || []).filter(d => d !== doc);
                        setFormData({...formData, requiredDocuments: docs});
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(formData.requiredDocuments || []).filter(doc => 
                  !['Passeport', 'Photo d\'identité', 'Diplôme de baccalauréat', 'Relevé de notes', 
                    'Certificat de langue (IELTS/TOEFL/HSK)', 'Lettre de motivation', 'CV / Curriculum Vitae',
                    'Lettres de recommandation (2)', 'Certificat de naissance', 'Certificat médical',
                    'Preuve de ressources financières', 'Portfolio (pour arts/design)'].includes(doc)
                ).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">Aucun document personnalisé</p>
                )}
              </div>
            </div>

            {/* Templates à uploader (pour que l'utilisateur télécharge et re-upload) */}
            <div className="border-t border-green-200 pt-3">
              <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Templates de Documents (à uploader pour les étudiants)
              </h5>
              <p className="text-xs text-gray-500 mb-3">
                Uploadez jusqu'à 3 documents templates (contrats, formulaires) que les étudiants devront télécharger, remplir/signer et re-uploader.
              </p>
              
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="bg-white rounded-lg p-2 border border-green-200">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Template {index + 1} {index === 0 && '(Ex: Contrat d\'inscription)'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.documentTemplates?.[index]?.name || ''}
                        onChange={(e) => {
                          const templates = formData.documentTemplates || [{}, {}, {}];
                          templates[index] = { ...templates[index], name: e.target.value };
                          setFormData({...formData, documentTemplates: templates});
                        }}
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        placeholder="Nom du document"
                      />
                      <input
                        type="url"
                        value={formData.documentTemplates?.[index]?.url || ''}
                        onChange={(e) => {
                          const templates = formData.documentTemplates || [{}, {}, {}];
                          templates[index] = { ...templates[index], url: e.target.value };
                          setFormData({...formData, documentTemplates: templates});
                        }}
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        placeholder="URL du fichier (https://...)"
                      />
                    </div>
                    {formData.documentTemplates?.[index]?.url && (
                      <a
                        href={formData.documentTemplates[index].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:underline mt-1 inline-block"
                      >
                        → Prévisualiser
                      </a>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Workflow :</strong> 1) Vous uploadez les templates ici → 2) L'étudiant les télécharge → 3) L'étudiant remplit/signe → 4) L'étudiant les re-upload dans sa candidature → 5) Vous téléchargez et validez
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasScholarship}
                onChange={(e) => {
                  const hasScholarship = e.target.checked;
                  setFormData({
                    ...formData, 
                    hasScholarship,
                    isSelfFinanced: !hasScholarship,
                    scholarshipType: hasScholarship ? 'Bourse Complète' : '',
                    badges: hasScholarship ? ['Bourse Complète'] : []
                  });
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Bourse disponible</span>
            </label>
            {formData.hasScholarship && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPartialScholarship}
                  onChange={(e) => {
                    const isPartial = e.target.checked;
                    setFormData({
                      ...formData, 
                      isPartialScholarship: isPartial,
                      scholarshipType: isPartial ? 'Bourse Partielle' : 'Bourse Complète',
                      badges: [isPartial ? 'Bourse Partielle' : 'Bourse Complète']
                    });
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Bourse Partielle</span>
              </label>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isOnline}
                onChange={(e) => setFormData({...formData, isOnline: e.target.checked})}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Cours en ligne</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Nouveauté</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// University Form Modal
const UniversityFormModal = ({ university, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(university || {
    name: '',
    city: '',
    country: 'Chine',
    countryCode: 'CN',
    image: '',
    ranking: '',
    badges: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (university) {
        await axios.put(`${API}/admin/universities/${university.id}`, formData);
      } else {
        await axios.post(`${API}/admin/universities`, formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving university:', err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-900">
            {university ? 'Modifier l\'université' : 'Nouvelle université'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData({
                  ...formData, 
                  countryCode: e.target.value,
                  country: e.target.value === 'CN' ? 'Chine' : 'France'
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              >
                <option value="CN">Chine</option>
                <option value="FR">France</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classement</label>
            <input
              type="text"
              value={formData.ranking}
              onChange={(e) => setFormData({...formData, ranking: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              placeholder="Ex: Top 100 QS"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Housing Form Modal
const HousingFormModal = ({ housing, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(housing || {
    type: '',
    location: '',
    city: '',
    country: 'Chine',
    priceRange: '',
    priceMin: 0,
    priceMax: 0,
    currency: 'CNY',
    image: '',
    amenities: [],
    description: ''
  });
  const [amenityInput, setAmenityInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (housing) {
        await axios.put(`${API}/admin/housing/${housing.id}`, formData);
      } else {
        await axios.post(`${API}/admin/housing`, formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving housing:', err);
    }
    setLoading(false);
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...(formData.amenities || []), amenityInput.trim()]
      });
      setAmenityInput('');
    }
  };

  const removeAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">
            {housing ? 'Modifier le logement' : 'Nouveau logement'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de logement</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              placeholder="Ex: Studio meublé, Chambre universitaire"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                placeholder="Ex: Campus, Quartier"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({
                  ...formData, 
                  country: e.target.value,
                  currency: e.target.value === 'Chine' ? 'CNY' : 'EUR'
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              >
                <option value="Chine">Chine</option>
                <option value="France">France</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fourchette de prix</label>
              <input
                type="text"
                value={formData.priceRange}
                onChange={(e) => setFormData({...formData, priceRange: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                placeholder="Ex: 3000-5000 CNY/mois"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Équipements</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                placeholder="WiFi, Cuisine équipée..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.amenities || []).map((amenity, index) => (
                <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1">
                  {amenity}
                  <button type="button" onClick={() => removeAmenity(index)} className="hover:text-blue-900">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Payment Settings Form Component
const PaymentSettingsForm = ({ settings, onSave }) => {
  const [formData, setFormData] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(null);
  const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

  const handleQrUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image trop volumineuse (max 5 Mo)'); return; }
    setUploadingQr(field);
    try {
      const token = localStorage.getItem('token');
      const sigRes = await axios.get(`${API}/upload/signature`, { headers: { 'Authorization': `Bearer ${token}` } });
      const { signature, timestamp, cloud_name, api_key, folder } = sigRes.data;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('signature', signature);
      fd.append('timestamp', String(timestamp));
      fd.append('api_key', api_key);
      fd.append('folder', folder);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, [field]: data.secure_url }));
    } catch (err) {
      console.error('QR upload error:', err);
      alert('Erreur lors du téléchargement');
    }
    setUploadingQr(null);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* QR Codes Section */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          QR Codes de paiement
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WeChat Pay QR Code</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1a56db] transition-colors">
              {formData.wechatQrCode ? (
                <div className="relative inline-block">
                  <img src={formData.wechatQrCode} alt="WeChat QR" className="w-40 h-40 object-cover rounded-lg mx-auto" />
                  <button type="button" onClick={() => setFormData({...formData, wechatQrCode: ''})}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  {uploadingQr === 'wechatQrCode' ? (
                    <div className="w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    <>
                      <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">Cliquez pour téléverser</p>
                    </>
                  )}
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" id="wechat-qr-upload"
                onChange={(e) => handleQrUpload(e, 'wechatQrCode')} />
              {!formData.wechatQrCode && (
                <label htmlFor="wechat-qr-upload" className="mt-2 inline-block px-4 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  Choisir une image
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alipay QR Code</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1a56db] transition-colors">
              {formData.alipayQrCode ? (
                <div className="relative inline-block">
                  <img src={formData.alipayQrCode} alt="Alipay QR" className="w-40 h-40 object-cover rounded-lg mx-auto" />
                  <button type="button" onClick={() => setFormData({...formData, alipayQrCode: ''})}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  {uploadingQr === 'alipayQrCode' ? (
                    <div className="w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    <>
                      <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">Cliquez pour téléverser</p>
                    </>
                  )}
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" id="alipay-qr-upload"
                onChange={(e) => handleQrUpload(e, 'alipayQrCode')} />
              {!formData.alipayQrCode && (
                <label htmlFor="alipay-qr-upload" className="mt-2 inline-block px-4 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  Choisir une image
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Section */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          PayPal
        </h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email PayPal</label>
          <input
            type="email"
            value={formData.paypalEmail}
            onChange={(e) => setFormData({...formData, paypalEmail: e.target.value})}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
            placeholder="payments@example.com"
          />
        </div>
      </div>

      {/* Bank Transfer Section */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          Virement bancaire
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la banque</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({...formData, bankName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titulaire du compte</label>
            <input
              type="text"
              value={formData.bankAccountName}
              onChange={(e) => setFormData({...formData, bankAccountName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de compte</label>
            <input
              type="text"
              value={formData.bankAccountNumber}
              onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Code SWIFT</label>
            <input
              type="text"
              value={formData.bankSwiftCode}
              onChange={(e) => setFormData({...formData, bankSwiftCode: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">IBAN (optionnel)</label>
            <input
              type="text"
              value={formData.bankIban}
              onChange={(e) => setFormData({...formData, bankIban: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t flex justify-end gap-4">
        {saved && (
          <span className="flex items-center gap-2 text-green-600">
            <Check size={18} />
            Enregistré!
          </span>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Check size={18} />
          )}
          Enregistrer les paramètres
        </button>
      </div>
    </form>
  );
};

const TermsConditionsEditor = ({ settings, onSave }) => {
  const [terms, setTerms] = useState(settings.termsConditions || []);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onSave({ ...settings, termsConditions: terms });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Aperçu pour le candidat</p>
        <div className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
          {terms.map((t, i) => (
            <p key={i}><strong>{i + 1}. {t.title || '(sans titre)'}</strong> — {t.content || '(vide)'}</p>
          ))}
          {terms.length === 0 && <p className="text-gray-400 italic">Aucune condition définie</p>}
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-3">
        {terms.map((term, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50" data-testid={`term-item-${idx}`}>
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-gray-400 mt-2">{idx + 1}.</span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={term.title}
                  onChange={(e) => {
                    const u = [...terms]; u[idx] = { ...u[idx], title: e.target.value }; setTerms(u);
                  }}
                  placeholder="Titre de la condition"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] font-medium text-sm"
                />
                <textarea
                  value={term.content}
                  onChange={(e) => {
                    const u = [...terms]; u[idx] = { ...u[idx], content: e.target.value }; setTerms(u);
                  }}
                  placeholder="Contenu de la condition"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] text-sm resize-none"
                />
              </div>
              <button type="button" onClick={() => setTerms(terms.filter((_, i) => i !== idx))}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => setTerms([...terms, { title: '', content: '' }])}
        data-testid="add-term-btn"
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1a56db] hover:text-[#1a56db] transition-colors flex items-center justify-center gap-2">
        <Plus size={16} />
        Ajouter une condition
      </button>

      <button onClick={handleSave} disabled={loading}
        data-testid="save-terms-btn"
        className="w-full py-3 bg-[#1a56db] hover:bg-[#1648b8] text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : saved ? (
          <><Check size={18} /> Enregistré</>
        ) : (
          'Enregistrer les conditions'
        )}
      </button>
    </div>
  );
};

// ============= TESTIMONIALS MANAGER =============
const TestimonialsManager = ({ testimonials, loading, onReload }) => {
  const API_URL = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/testimonials/${id}/approve`);
      onReload();
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/testimonials/${id}/reject`);
      onReload();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce t\u00E9moignage ?')) return;
    try {
      await axios.delete(`${API_URL}/admin/testimonials/${id}`);
      onReload();
    } catch (err) { console.error(err); }
  };

  const statusBadge = (status) => {
    const map = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    const labels = { pending: 'En attente', approved: 'Approuv\u00E9', rejected: 'Rejet\u00E9' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || map.pending}`}>{labels[status] || status}</span>;
  };

  if (loading) return <div className="bg-white rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="space-y-6" data-testid="testimonials-admin-section">
      <div>
        <h3 className="font-semibold text-gray-900">T\u00E9moignages ({testimonials.length})</h3>
        <p className="text-sm text-gray-500 mt-1">Validez ou rejetez les t\u00E9moignages soumis par les utilisateurs</p>
      </div>
      {testimonials.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Star size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun t\u00E9moignage pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100" data-testid={`testimonial-admin-${t.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a56db] rounded-full flex items-center justify-center text-white font-bold">{(t.userName || '?')[0]}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t.userName}</h4>
                    <p className="text-xs text-gray-500">{t.program}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(t.status)}
                  <div className="flex gap-1">{[...Array(t.rating || 5)].map((_, i) => <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />)}</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2">
                {t.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(t.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors" data-testid={`approve-${t.id}`}><Check size={14} />Approuver</button>
                    <button onClick={() => handleReject(t.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors" data-testid={`reject-${t.id}`}><X size={14} />Rejeter</button>
                  </>
                )}
                <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors ml-auto" data-testid={`delete-testimonial-${t.id}`}><Trash2 size={14} />Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// ============= CONTACTS MANAGER =============
const ContactsManager = ({ contacts, loading, onReload }) => {
  const API_URL = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
  const [selectedContact, setSelectedContact] = useState(null);

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/contacts/${id}/read`);
      onReload();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      await axios.delete(`${API_URL}/admin/contacts/${id}`);
      setSelectedContact(null);
      onReload();
    } catch (err) { console.error(err); }
  };

  const serviceLabels = { china: '\u00C9tudes en Chine', france: '\u00C9tudes en France', housing: 'Logement', visa: 'Visa', other: 'Autre' };

  if (loading) return <div className="bg-white rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>;

  const unread = contacts.filter(c => !c.isRead).length;

  return (
    <div className="space-y-6" data-testid="contacts-admin-section">
      <div>
        <h3 className="font-semibold text-gray-900">Messages de contact ({contacts.length}){unread > 0 && <span className="ml-2 text-sm text-orange-600">{unread} non lus</span>}</h3>
        <p className="text-sm text-gray-500 mt-1">Messages re\u00E7us via le formulaire de contact du site</p>
      </div>
      {contacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <PhoneCall size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun message de contact</p>
        </div>
      ) : (
        <div className="flex gap-4">
          <div className="w-1/2 space-y-2 max-h-[600px] overflow-y-auto">
            {contacts.map((c) => (
              <div key={c.id} onClick={() => { setSelectedContact(c); if (!c.isRead) handleMarkRead(c.id); }} className={`p-4 rounded-xl cursor-pointer transition-colors border ${selectedContact?.id === c.id ? 'bg-blue-50 border-[#1a56db]' : c.isRead ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50'}`} data-testid={`contact-item-${c.id}`}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{c.name}</h4>
                  {!c.isRead && <span className="w-2 h-2 bg-[#1a56db] rounded-full"></span>}
                </div>
                <p className="text-xs text-gray-500">{c.email}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{c.message}</p>
              </div>
            ))}
          </div>
          <div className="w-1/2">
            {selectedContact ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedContact.name}</h4>
                    <p className="text-sm text-gray-500">{selectedContact.email}</p>
                    {selectedContact.phone && <p className="text-sm text-gray-500">{selectedContact.phone}</p>}
                  </div>
                  <button onClick={() => handleDelete(selectedContact.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
                {selectedContact.service && <div className="mb-4"><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{serviceLabels[selectedContact.service] || selectedContact.service}</span></div>}
                <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                <p className="text-xs text-gray-400 mt-4">{selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString('fr-FR') : ''}</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-400">S\u00E9lectionnez un message</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// ============= FAQ MANAGER =============
const FAQManager = ({ faqs, loading, onSave }) => {
  const [localFaqs, setLocalFaqs] = useState(faqs);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  useEffect(() => { setLocalFaqs(faqs); }, [faqs]);

  const handleAdd = async () => {
    if (!newFaq.question || !newFaq.answer) return;
    const faq = { id: Date.now().toString(), ...newFaq };
    const updated = [...localFaqs, faq];
    setLocalFaqs(updated);
    await onSave(updated);
    setNewFaq({ question: '', answer: '' });
    setShowAddForm(false);
  };

  const handleUpdate = async () => {
    if (!editingFaq) return;
    const updated = localFaqs.map(f => f.id === editingFaq.id ? editingFaq : f);
    setLocalFaqs(updated);
    await onSave(updated);
    setEditingFaq(null);
  };

  const handleDelete = async (faqId) => {
    if (!window.confirm('Supprimer cette question ?')) return;
    const updated = localFaqs.filter(f => f.id !== faqId);
    setLocalFaqs(updated);
    await onSave(updated);
  };

  if (loading) return <div className="bg-white rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="space-y-6" data-testid="faq-admin-section">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Questions Fr\u00E9quentes ({localFaqs.length})</h3>
          <p className="text-sm text-gray-500 mt-1">G\u00E9rez les FAQ affich\u00E9es sur le site</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors text-sm" data-testid="add-faq-btn"><Plus size={18} />Ajouter</button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-[#1a56db]/20">
          <h4 className="font-medium text-gray-900 mb-4">Nouvelle question</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <input type="text" value={newFaq.question} onChange={(e) => setNewFaq({...newFaq, question: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="Saisissez la question..." data-testid="faq-question-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">R\u00E9ponse</label>
              <textarea value={newFaq.answer} onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none" rows={3} placeholder="Saisissez la r\u00E9ponse..." data-testid="faq-answer-input" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowAddForm(false); setNewFaq({ question: '', answer: '' }); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annuler</button>
              <button onClick={handleAdd} disabled={!newFaq.question || !newFaq.answer} className="bg-[#1a56db] text-white px-6 py-2 rounded-lg hover:bg-[#1648b8] disabled:opacity-50" data-testid="save-faq-btn">Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {editingFaq && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-orange-200">
          <h4 className="font-medium text-gray-900 mb-4">Modifier la question</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <input type="text" value={editingFaq.question} onChange={(e) => setEditingFaq({...editingFaq, question: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">R\u00E9ponse</label>
              <textarea value={editingFaq.answer} onChange={(e) => setEditingFaq({...editingFaq, answer: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none" rows={3} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingFaq(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annuler</button>
              <button onClick={handleUpdate} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">Mettre \u00E0 jour</button>
            </div>
          </div>
        </div>
      )}

      {localFaqs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucune FAQ configur\u00E9e</p>
          <p className="text-sm text-gray-400 mt-2">Les FAQ par d\u00E9faut seront utilis\u00E9es</p>
        </div>
      ) : (
        <div className="space-y-3">
          {localFaqs.map((faq, idx) => (
            <div key={faq.id || idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 group" data-testid={`faq-admin-item-${idx}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <h4 className="font-medium text-gray-900 mb-1">{faq.question}</h4>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setEditingFaq({...faq})} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200" data-testid={`edit-faq-${idx}`}><Edit size={14} className="text-gray-700" /></button>
                  <button onClick={() => handleDelete(faq.id)} className="p-2 bg-gray-100 rounded-lg hover:bg-red-100" data-testid={`delete-faq-${idx}`}><Trash2 size={14} className="text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// ============= BANNERS MANAGER COMPONENT =============
const BannersManager = ({ slides, loading, onSave, token }) => {
  const [localSlides, setLocalSlides] = useState(slides);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newSlide, setNewSlide] = useState({ image: '', title: '', subtitle: '' });

  useEffect(() => { setLocalSlides(slides); }, [slides]);

  const handleUploadImage = async (file) => {
    setUploading(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      const sigRes = await fetch(`${API_URL}/api/upload/signature`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!sigRes.ok) throw new Error('Signature failed');
      const sigData = await sigRes.json();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.api_key);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.secure_url) return uploadData.secure_url;
      throw new Error('Upload failed');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur lors du t\u00E9l\u00E9versement');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAddSlide = async () => {
    if (!newSlide.image) return;
    const slide = { id: Date.now().toString(), ...newSlide };
    const updated = [...localSlides, slide];
    setLocalSlides(updated);
    await onSave(updated);
    setNewSlide({ image: '', title: '', subtitle: '' });
    setShowAddForm(false);
  };

  const handleUpdateSlide = async () => {
    if (!editingSlide) return;
    const updated = localSlides.map(s => s.id === editingSlide.id ? editingSlide : s);
    setLocalSlides(updated);
    await onSave(updated);
    setEditingSlide(null);
  };

  const handleDeleteSlide = async (slideId) => {
    if (!window.confirm('Supprimer cette banni\u00E8re ?')) return;
    const updated = localSlides.filter(s => s.id !== slideId);
    setLocalSlides(updated);
    await onSave(updated);
  };

  const handleFileInput = async (e, target) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await handleUploadImage(file);
    if (url) {
      if (target === 'new') setNewSlide({ ...newSlide, image: url });
      else if (editingSlide) setEditingSlide({ ...editingSlide, image: url });
    }
  };

  if (loading) return <div className="bg-white rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="space-y-6" data-testid="banners-section">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Banni\u00E8res d\u00E9filantes</h3>
          <p className="text-sm text-gray-500 mt-1">G\u00E9rez les images du carrousel dans la section des offres</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors text-sm" data-testid="add-banner-btn">
          <Plus size={18} />Ajouter
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-[#1a56db]/20">
          <h4 className="font-medium text-gray-900 mb-4">Nouvelle banni\u00E8re</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <div className="flex gap-3">
                <input type="text" placeholder="URL de l'image ou t\u00E9l\u00E9verser ci-dessous" value={newSlide.image} onChange={(e) => setNewSlide({...newSlide, image: e.target.value})} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" data-testid="banner-image-url" />
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${uploading ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  <Image size={16} />{uploading ? 'Envoi...' : 'T\u00E9l\u00E9verser'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileInput(e, 'new')} disabled={uploading} />
                </label>
              </div>
              {newSlide.image && <img src={newSlide.image} alt="Aper\u00E7u" className="mt-3 h-32 rounded-lg object-cover" />}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input type="text" value={newSlide.title} onChange={(e) => setNewSlide({...newSlide, title: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="Titre de la banni\u00E8re" data-testid="banner-title-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label>
                <input type="text" value={newSlide.subtitle} onChange={(e) => setNewSlide({...newSlide, subtitle: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="Description courte" data-testid="banner-subtitle-input" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowAddForm(false); setNewSlide({ image: '', title: '', subtitle: '' }); }} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
              <button onClick={handleAddSlide} disabled={!newSlide.image} className="bg-[#1a56db] text-white px-6 py-2 rounded-lg hover:bg-[#1648b8] transition-colors disabled:opacity-50" data-testid="save-banner-btn">Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingSlide && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-orange-200">
          <h4 className="font-medium text-gray-900 mb-4">Modifier la banni\u00E8re</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <div className="flex gap-3">
                <input type="text" value={editingSlide.image} onChange={(e) => setEditingSlide({...editingSlide, image: e.target.value})} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${uploading ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  <Image size={16} />{uploading ? 'Envoi...' : 'Changer'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileInput(e, 'edit')} disabled={uploading} />
                </label>
              </div>
              {editingSlide.image && <img src={editingSlide.image} alt="Aper\u00E7u" className="mt-3 h-32 rounded-lg object-cover" />}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input type="text" value={editingSlide.title} onChange={(e) => setEditingSlide({...editingSlide, title: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label>
                <input type="text" value={editingSlide.subtitle} onChange={(e) => setEditingSlide({...editingSlide, subtitle: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingSlide(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
              <button onClick={handleUpdateSlide} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">Mettre \u00E0 jour</button>
            </div>
          </div>
        </div>
      )}

      {/* Slides List */}
      {localSlides.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Image size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucune banni\u00E8re configur\u00E9e</p>
          <p className="text-sm text-gray-400 mt-2">Les images par d\u00E9faut seront utilis\u00E9es</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {localSlides.map((slide, idx) => (
            <div key={slide.id} className="bg-white rounded-xl shadow-sm overflow-hidden group" data-testid={`banner-item-${idx}`}>
              <div className="relative h-40">
                <img src={slide.image} alt={slide.title || `Banni\u00E8re ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-semibold text-sm">{slide.title || 'Sans titre'}</p>
                    <p className="text-white/70 text-xs">{slide.subtitle || ''}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingSlide({...slide})} className="bg-white/90 p-1.5 rounded-lg hover:bg-white transition-colors" data-testid={`edit-banner-${idx}`}><Edit size={14} className="text-gray-700" /></button>
                  <button onClick={() => handleDeleteSlide(slide.id)} className="bg-white/90 p-1.5 rounded-lg hover:bg-white transition-colors" data-testid={`delete-banner-${idx}`}><Trash2 size={14} className="text-red-500" /></button>
                </div>
                <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">#{idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCMS;
