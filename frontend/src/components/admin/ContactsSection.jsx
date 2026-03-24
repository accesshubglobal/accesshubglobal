import React, { useState, useEffect } from 'react';
import { PhoneCall, Trash2 } from 'lucide-react';
import axios from './adminApi';

const ContactsSection = () => {
  const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => { loadContacts(); }, []);

  const loadContacts = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/contacts`); setContacts(res.data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleMarkRead = async (id) => { try { await axios.put(`${API}/admin/contacts/${id}/read`); loadContacts(); } catch (err) { console.error(err); } };
  const handleDelete = async (id) => { if (!window.confirm('Supprimer ce message ?')) return; try { await axios.delete(`${API}/admin/contacts/${id}`); setSelectedContact(null); loadContacts(); } catch (err) { console.error(err); } };

  const serviceLabels = { china: 'Études en Chine', france: 'Études en France', housing: 'Logement', visa: 'Visa', other: 'Autre' };

  if (loading) return <div className="bg-white rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>;

  const unread = contacts.filter(c => !c.isRead).length;

  return (
    <div className="space-y-6" data-testid="contacts-admin-section">
      <div><h3 className="font-semibold text-gray-900">Messages de contact ({contacts.length}){unread > 0 && <span className="ml-2 text-sm text-orange-600">{unread} non lus</span>}</h3><p className="text-sm text-gray-500 mt-1">Messages reçus via le formulaire de contact du site</p></div>
      {contacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center"><PhoneCall size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Aucun message de contact</p></div>
      ) : (
        <div className="flex gap-4">
          <div className="w-1/2 space-y-2 max-h-[600px] overflow-y-auto">
            {contacts.map((c) => (
              <div key={c.id} onClick={() => { setSelectedContact(c); if (!c.isRead) handleMarkRead(c.id); }} className={`p-4 rounded-xl cursor-pointer transition-colors border ${selectedContact?.id === c.id ? 'bg-blue-50 border-[#1a56db]' : c.isRead ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50'}`} data-testid={`contact-item-${c.id}`}>
                <div className="flex items-center justify-between mb-1"><h4 className="font-medium text-gray-900 text-sm">{c.name}</h4>{!c.isRead && <span className="w-2 h-2 bg-[#1a56db] rounded-full"></span>}</div>
                <p className="text-xs text-gray-500">{c.email}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{c.message}</p>
              </div>
            ))}
          </div>
          <div className="w-1/2">
            {selectedContact ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div><h4 className="font-semibold text-gray-900">{selectedContact.name}</h4><p className="text-sm text-gray-500">{selectedContact.email}</p>{selectedContact.phone && <p className="text-sm text-gray-500">{selectedContact.phone}</p>}</div>
                  <button onClick={() => handleDelete(selectedContact.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
                {selectedContact.service && <div className="mb-4"><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{serviceLabels[selectedContact.service] || selectedContact.service}</span></div>}
                <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                <p className="text-xs text-gray-400 mt-4">{selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString('fr-FR') : ''}</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-400">Sélectionnez un message</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsSection;
