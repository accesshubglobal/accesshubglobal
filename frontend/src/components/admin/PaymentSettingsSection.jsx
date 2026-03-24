import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Plus } from 'lucide-react';
import axios from './adminApi';

const PaymentSettingsSection = () => {
  const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(null);

  useEffect(() => { loadPaymentSettings(); }, []);

  const loadPaymentSettings = async () => {
    try { const res = await axios.get(`${API}/admin/payment-settings`); setPaymentSettings(res.data); setFormData(res.data); }
    catch (err) { console.error(err); }
  };

  const handleQrUpload = async (e, field) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image trop volumineuse (max 5 Mo)'); return; }
    setUploadingQr(field);
    try {
      const token = localStorage.getItem('token');
      const sigRes = await axios.get(`${API}/upload/signature`, { headers: { 'Authorization': `Bearer ${token}` } });
      const { signature, timestamp, cloud_name, api_key, folder } = sigRes.data;
      const fd = new FormData();
      fd.append('file', file); fd.append('signature', signature); fd.append('timestamp', String(timestamp)); fd.append('api_key', api_key); fd.append('folder', folder);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, [field]: data.secure_url }));
    } catch (err) { console.error(err); alert('Erreur lors du téléchargement'); }
    setUploadingQr(null); e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API}/admin/payment-settings`, formData); setPaymentSettings(formData); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  if (!formData) return <div className="bg-white rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900">Paramètres de paiement</h3>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span>QR Codes de paiement</h4>
          <div className="grid md:grid-cols-2 gap-6">
            {[{ label: 'WeChat Pay QR Code', field: 'wechatQrCode', id: 'wechat-qr-upload' }, { label: 'Alipay QR Code', field: 'alipayQrCode', id: 'alipay-qr-upload' }].map(({ label, field, id }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1a56db] transition-colors">
                  {formData[field] ? (
                    <div className="relative inline-block">
                      <img src={formData[field]} alt={label} className="w-40 h-40 object-cover rounded-lg mx-auto" />
                      <button type="button" onClick={() => setFormData({...formData, [field]: ''})} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="py-4">
                      {uploadingQr === field ? <div className="w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full animate-spin mx-auto"></div> : (
                        <><svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p className="text-sm text-gray-500">Cliquez pour téléverser</p></>
                      )}
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" id={id} onChange={(e) => handleQrUpload(e, field)} />
                  {!formData[field] && <label htmlFor={id} className="mt-2 inline-block px-4 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">Choisir une image</label>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>PayPal</h4>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Email PayPal</label><input type="email" value={formData.paypalEmail || ''} onChange={(e) => setFormData({...formData, paypalEmail: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="payments@example.com" /></div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Virement bancaire</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {[{ label: 'Nom de la banque', field: 'bankName' }, { label: 'Titulaire du compte', field: 'bankAccountName' }, { label: 'Numéro de compte', field: 'bankAccountNumber' }, { label: 'Code SWIFT', field: 'bankSwiftCode' }].map(({ label, field }) => (
              <div key={field}><label className="block text-sm font-medium text-gray-700 mb-2">{label}</label><input type="text" value={formData[field] || ''} onChange={(e) => setFormData({...formData, [field]: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" /></div>
            ))}
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">IBAN (optionnel)</label><input type="text" value={formData.bankIban || ''} onChange={(e) => setFormData({...formData, bankIban: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" /></div>
          </div>
        </div>
        <div className="pt-4 border-t flex justify-end gap-4">
          {saved && <span className="flex items-center gap-2 text-green-600"><Check size={18} />Enregistré!</span>}
          <button type="submit" disabled={loading} className="px-6 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50 flex items-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check size={18} />}
            Enregistrer les paramètres
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentSettingsSection;
