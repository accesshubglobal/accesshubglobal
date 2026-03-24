import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Eye, Heart, Star, MapPin, Calendar, Users, Globe, GraduationCap,
  Building2, CheckCircle, Image as ImageIcon, Play, ExternalLink, Loader2, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const UniversityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [uni, setUni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    loadUniversity();
    if (isAuthenticated) checkLikeStatus();
  }, [id]);

  const loadUniversity = async () => {
    try {
      const res = await axios.get(`${API}/universities/${id}`);
      setUni(res.data);
      setLikes(res.data.likes || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const checkLikeStatus = async () => {
    try {
      const res = await axios.get(`${API}/universities/${id}/like-status`);
      setLiked(res.data.liked);
    } catch (err) {}
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.post(`${API}/universities/${id}/like`);
      setLiked(res.data.liked);
      setLikes(res.data.likes);
    } catch (err) {}
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
        </div>
      </div>
    );
  }

  if (!uni) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Universite non trouvee</h2>
          <button onClick={() => navigate('/')} className="text-[#1e3a5f] hover:underline">Retour</button>
        </div>
      </div>
    );
  }

  const embedUrl = getYoutubeEmbedUrl(uni.youtubeUrl);
  const coverImg = uni.coverImage || uni.image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200';

  const infoItems = [
    { label: 'Annee de creation', value: uni.foundedYear, icon: Calendar },
    { label: 'President / Recteur', value: uni.president, icon: Users },
    { label: 'Etudiants total', value: uni.totalStudents, icon: Users },
    { label: 'Etudiants etrangers', value: uni.internationalStudents, icon: Globe },
    { label: 'Site web', value: uni.website, icon: ExternalLink, isLink: true },
  ].filter(item => item.value);

  return (
    <div className="min-h-screen bg-gray-50" data-testid="university-detail-page">
      <Header />

      {/* Cover Image */}
      <div className="relative h-56 sm:h-72 lg:h-80">
        <img src={coverImg} alt={uni.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-colors shadow-md z-10">
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Profile Card - overlapping cover */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-md -mt-20 relative z-10 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Top row: logo + name + stats */}
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Logo */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0 -mt-16 sm:-mt-20">
                {uni.logo ? (
                  <img src={uni.logo} alt="Logo" className="w-full h-full object-contain p-1.5 bg-white" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 sm:pt-0 pt-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight" data-testid="uni-name">
                  {uni.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={14} className="text-gray-400" />
                    {uni.city}{uni.province ? `, ${uni.province}` : ''}, {uni.country}
                  </span>
                  {uni.status && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      uni.status === 'public' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {uni.status === 'public' ? 'Publique' : 'Privee'}
                    </span>
                  )}
                  {uni.ranking && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">{uni.ranking}</span>
                  )}
                </div>
                {uni.badges?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {uni.badges.map((b, i) => (
                      <span key={i} className="bg-[#1e3a5f]/10 text-[#1e3a5f] text-[11px] px-2.5 py-1 rounded-full font-medium">{b}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Eye size={16} className="text-gray-400" />
                <span className="font-semibold text-gray-800">{(uni.views || 0).toLocaleString()}</span>
                <span>vues</span>
              </div>
              <button onClick={handleLike} data-testid="like-btn"
                className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                <span className="font-semibold">{likes}</span>
                <span>j'aime</span>
              </button>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-800">{uni.rating || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content below card */}
        <div className="mt-6 space-y-6 pb-12">

          {/* YouTube Video */}
          {embedUrl && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-5 pb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Play size={20} className="text-red-500" /> Presentation video
                </h2>
              </div>
              <div className="aspect-video">
                <iframe src={embedUrl} title="Video" className="w-full h-full" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            </div>
          )}

          {/* Description */}
          {uni.description && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 size={20} className="text-[#1e3a5f]" /> A propos
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{uni.description}</p>
            </div>
          )}

          {/* Info Grid */}
          {infoItems.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {infoItems.map(item => (
                <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <item.icon size={16} className="text-[#1e3a5f]" />
                    <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                  </div>
                  {item.isLink ? (
                    <a href={item.value.startsWith('http') ? item.value : `https://${item.value}`} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#1e3a5f] hover:underline truncate block">{item.value}</a>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Faculties */}
          {uni.faculties?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-[#1e3a5f]" /> Facultes
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {uni.faculties.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <ChevronRight size={14} className="text-[#1e3a5f] flex-shrink-0" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {uni.conditions?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" /> Conditions d'admission
              </h2>
              <div className="space-y-2">
                {uni.conditions.map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50/60 border border-green-100">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos Gallery */}
          {uni.photos?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-[#1e3a5f]" /> Galerie photos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {uni.photos.map((photo, i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-gray-100"
                    onClick={() => setLightboxImg(photo)}>
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Photo" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UniversityDetailPage;
