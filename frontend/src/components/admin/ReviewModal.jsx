import React, { useState, useEffect } from 'react';
import {
  X, User, Building, Mail, Phone, Globe, MapPin, FileText,
  Download, ExternalLink, CheckCircle, XCircle, Calendar,
  Briefcase, AlertCircle, Loader
} from 'lucide-react';
import axios, { API } from './adminApi';
import { fixPdfUrl, downloadFile } from '../../utils/fileUtils';

/* ── Small helpers ──────────────────────────────────────────────── */
const Field = ({ label, value, mono }) => (
  value ? (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 14, color: '#1e293b', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</p>
    </div>
  ) : null
);

const DocLink = ({ label, url, name }) => {
  if (!url) return null;
  const display = name || label;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0',
      background: '#f8fafc',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileText size={16} style={{ color: '#64748b' }} />
        <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{display}</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <a
          href={fixPdfUrl(url)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 6, background: '#e0f2fe',
            color: '#0284c7', fontSize: 12, fontWeight: 600, textDecoration: 'none',
            border: 'none', cursor: 'pointer',
          }}
        >
          <ExternalLink size={12} /> Voir
        </a>
        <button
          onClick={() => downloadFile(url, name || label)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 6, background: '#f0fdf4',
            color: '#16a34a', fontSize: 12, fontWeight: 600,
            border: 'none', cursor: 'pointer',
          }}
        >
          <Download size={12} /> Télécharger
        </button>
      </div>
    </div>
  );
};

const Section = ({ title, icon: Icon, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <Icon size={15} style={{ color: '#64748b' }} />
      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{title}</h4>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
      {children}
    </div>
  </div>
);

/* ── Employer Review Modal ──────────────────────────────────────── */
export const EmployerReviewModal = ({ employerId, onClose, onApprove, onReject }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/admin/employers/${employerId}/details`);
        setData(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [employerId]);

  const handleApprove = async () => {
    setActing(true);
    await onApprove(employerId);
    setActing(false);
    onClose();
  };

  const handleReject = async () => {
    setActing(true);
    await onReject(employerId);
    setActing(false);
    onClose();
  };

  return (
    <ModalShell title="Revue avant approbation" subtitle="Employeur" onClose={onClose} loading={loading} acting={acting}
      onApprove={handleApprove} onReject={handleReject}
      isApproved={data?.isApproved}
    >
      {data && (
        <>
          <Section title="Informations personnelles" icon={User}>
            <Field label="Prénom" value={data.firstName} />
            <Field label="Nom" value={data.lastName} />
            <Field label="Email" value={data.email} />
            <Field label="Téléphone" value={data.phone} />
            <Field label="Inscrit le" value={data.createdAt ? new Date(data.createdAt).toLocaleDateString('fr-FR') : ''} />
            <Field label="Email vérifié" value={data.emailVerified ? 'Oui ✓' : 'Non'} />
          </Section>

          {data.company?.companyName && (
            <Section title="Informations entreprise" icon={Building}>
              <Field label="Nom entreprise" value={data.company.companyName} />
              <Field label="Secteur" value={data.company.industry} />
              <Field label="Site web" value={data.company.website} />
              <Field label="Taille" value={data.company.size} />
              <Field label="Téléphone" value={data.company.phone} />
              <Field label="Adresse" value={data.company.address} />
              <Field label="Ville" value={data.company.city} />
              <Field label="Pays" value={data.company.country} />
              <Field label="Fondée en" value={data.company.foundedYear} />
              <Field label="LinkedIn" value={data.company.linkedin} />
              {data.company.description && (
                <div style={{ gridColumn: '1/-1' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Description</p>
                  <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{data.company.description}</p>
                </div>
              )}
            </Section>
          )}

          {(data.officialDocUrl || data.idDocUrl) && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <FileText size={15} style={{ color: '#64748b' }} />
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Documents officiels</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <DocLink label="Document officiel" url={data.officialDocUrl} name={data.officialDocName} />
                <DocLink label="Pièce d'identité" url={data.idDocUrl} name={data.idDocName} />
                <DocLink label="Justificatif d'adresse" url={data.addressDocUrl} name={data.addressDocName} />
              </div>
            </div>
          )}

          {(!data.company?.companyName || !data.officialDocUrl) && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, background: '#fef3c7',
              border: '1px solid #fde68a', display: 'flex', gap: 10, alignItems: 'flex-start',
              marginBottom: 16,
            }}>
              <AlertCircle size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', margin: 0 }}>Dossier incomplet</p>
                <p style={{ fontSize: 12, color: '#92400e', margin: '4px 0 0' }}>
                  {!data.company?.companyName && '• Infos entreprise manquantes  '}
                  {!data.officialDocUrl && '• Document officiel manquant'}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </ModalShell>
  );
};

/* ── Partner Review Modal ───────────────────────────────────────── */
export const PartnerReviewModal = ({ partnerId, onClose, onApprove, onReject }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/admin/partners/${partnerId}/details`);
        setData(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [partnerId]);

  const handleApprove = async () => {
    setActing(true);
    await onApprove(partnerId);
    setActing(false);
    onClose();
  };

  const handleReject = async () => {
    setActing(true);
    await onReject(partnerId);
    setActing(false);
    onClose();
  };

  return (
    <ModalShell title="Revue avant approbation" subtitle="Partenaire Universitaire" onClose={onClose} loading={loading} acting={acting}
      onApprove={handleApprove} onReject={handleReject}
      isApproved={data?.isApproved}
    >
      {data && (
        <>
          <Section title="Informations personnelles" icon={User}>
            <Field label="Prénom" value={data.firstName} />
            <Field label="Nom" value={data.lastName} />
            <Field label="Email" value={data.email} />
            <Field label="Téléphone" value={data.phone} />
            <Field label="Entreprise / Organisation" value={data.company || data.companyName} />
            <Field label="Inscrit le" value={data.createdAt ? new Date(data.createdAt).toLocaleDateString('fr-FR') : ''} />
            <Field label="Email vérifié" value={data.emailVerified ? 'Oui ✓' : 'Non'} />
            <Field label="Code de connexion" value={data.partnerCode} mono />
          </Section>

          {(data.officialDocUrl || data.idDocUrl) && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <FileText size={15} style={{ color: '#64748b' }} />
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Documents officiels</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <DocLink label="Document officiel" url={data.officialDocUrl} name={data.officialDocName} />
                <DocLink label="Pièce d'identité" url={data.idDocUrl} name={data.idDocName} />
                <DocLink label="Justificatif d'adresse" url={data.addressDocUrl} name={data.addressDocName} />
              </div>
            </div>
          )}

          {(!data.company && !data.companyName) && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, background: '#fef3c7',
              border: '1px solid #fde68a', display: 'flex', gap: 10,
              marginBottom: 16,
            }}>
              <AlertCircle size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>Nom de l'organisation non renseigné</p>
            </div>
          )}
        </>
      )}
    </ModalShell>
  );
};

/* ── Shared Modal Shell ─────────────────────────────────────────── */
const ModalShell = ({ title, subtitle, onClose, loading, acting, onApprove, onReject, isApproved, children }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
  }}>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
    <div style={{
      position: 'relative', background: '#fff', borderRadius: 18,
      width: '100%', maxWidth: 600, maxHeight: '88vh',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
    }}
      data-testid="review-modal"
    >
      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{title}</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>{subtitle}</h3>
        </div>
        <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', color: '#64748b' }}>
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 }}>
            <Loader size={20} className="animate-spin" style={{ color: '#94a3b8' }} />
            <span style={{ color: '#94a3b8', fontSize: 14 }}>Chargement du dossier...</span>
          </div>
        ) : children}
      </div>

      {/* Footer actions */}
      <div style={{
        padding: '16px 24px', borderTop: '1px solid #f1f5f9',
        display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          padding: '9px 18px', borderRadius: 9, border: '1px solid #e2e8f0',
          background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          Fermer
        </button>
        {!isApproved && (
          <>
            <button onClick={onReject} disabled={acting} style={{
              padding: '9px 18px', borderRadius: 9, border: 'none',
              background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              opacity: acting ? 0.7 : 1,
            }}
              data-testid="review-reject-btn"
            >
              <XCircle size={14} /> Rejeter
            </button>
            <button onClick={onApprove} disabled={acting} style={{
              padding: '9px 18px', borderRadius: 9, border: 'none',
              background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: acting ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
            }}
              data-testid="review-approve-btn"
            >
              {acting ? <Loader size={13} className="animate-spin" /> : <CheckCircle size={14} />}
              Approuver
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);
