import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, FileText, Paperclip } from 'lucide-react';
import axios, { API } from './adminApi';

const MessagesSection = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [inlineReply, setInlineReply] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [uploadingReplyFile, setUploadingReplyFile] = useState(false);

  useEffect(() => { loadMessages(); }, []);

  const loadMessages = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/messages`); setMessages(res.data); }
    catch (err) { console.error('Error loading messages:', err); }
    setLoading(false);
  };

  const markAsRead = async (messageId) => {
    try { await axios.put(`${API}/admin/messages/${messageId}/read`); loadMessages(); }
    catch (err) { console.error(err); }
  };

  const replyToMessage = async (messageId, content) => {
    try {
      await axios.post(`${API}/admin/messages/${messageId}/reply`, { content, attachments: replyAttachments.map(a => a.url) });
      loadMessages();
      setInlineReply('');
      setReplyAttachments([]);
      if (selectedMessage?.id === messageId) {
        const updated = await axios.get(`${API}/admin/messages`);
        const found = updated.data.find(m => m.id === messageId);
        if (found) setSelectedMessage(found);
      }
    } catch (err) { console.error('Error replying:', err); }
  };

  const handleReplyFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Fichier trop volumineux (max 10 Mo)'); return; }
    setUploadingReplyFile(true);
    try {
      const sigRes = await axios.get(`${API}/upload/signature`);
      const { signature, timestamp, cloud_name, api_key, folder } = sigRes.data;
      const fd = new FormData();
      fd.append('file', file); fd.append('signature', signature);
      fd.append('timestamp', String(timestamp)); fd.append('api_key', api_key); fd.append('folder', folder);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setReplyAttachments(prev => [...prev, { name: file.name, url: data.secure_url }]);
    } catch (err) {
      try {
        const fd = new FormData(); fd.append('file', file);
        const res = await axios.post(`${API}/upload`, fd, { timeout: 60000 });
        setReplyAttachments(prev => [...prev, { name: file.name, url: res.data.url }]);
      } catch (e2) { console.error('Upload error:', e2); }
    }
    setUploadingReplyFile(false);
    e.target.value = '';
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]" data-testid="messages-admin-section">
      {/* Messages List */}
      <div className="w-80 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b"><h3 className="font-semibold text-gray-900">Messages ({messages.length})</h3></div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center"><MessageCircle size={40} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-500 text-sm">Aucun message</p></div>
          ) : messages.map((msg) => (
            <button key={msg.id} onClick={() => { setSelectedMessage(msg); if (!msg.isRead) markAsRead(msg.id); }}
              data-testid={`msg-item-${msg.id}`}
              className={`w-full p-4 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedMessage?.id === msg.id ? 'bg-blue-50' : ''} ${!msg.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{msg.senderName?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate text-sm">{msg.senderName}</p>
                    {!msg.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>}
                  </div>
                  <p className="text-xs font-medium text-gray-700 truncate">{msg.subject}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{msg.replies?.length > 0 ? msg.replies[msg.replies.length - 1].content : msg.content}</p>
                </div>
              </div>
              <div className="text-right mt-1">
                <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                {msg.replies?.length > 0 && <span className="ml-2 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{msg.replies.length} rép.</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Window */}
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        {selectedMessage ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{selectedMessage.senderName?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div><p className="font-semibold text-gray-900">{selectedMessage.senderName}</p><p className="text-xs text-gray-500">{selectedMessage.senderEmail}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{new Date(selectedMessage.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
            </div>

            <div className="px-4 py-2 bg-gray-50 border-b"><p className="text-sm font-medium text-gray-700">Sujet : {selectedMessage.subject}</p></div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-3">
                {/* Original message */}
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-2xl px-4 py-2 bg-white text-gray-800 shadow-sm rounded-bl-md">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{selectedMessage.senderName?.charAt(0)?.toUpperCase() || 'U'}</div>
                      <span className="text-xs font-medium text-blue-600">{selectedMessage.senderName}</span>
                    </div>
                    <p className="text-sm">{selectedMessage.content}</p>
                    {selectedMessage.attachments?.length > 0 && <div className="mt-2 space-y-1">{selectedMessage.attachments.map((url, aidx) => <a key={aidx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"><FileText size={12} /> Pièce jointe {aidx + 1}</a>)}</div>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(selectedMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Replies */}
                {selectedMessage.replies?.map((reply, idx) => (
                  <div key={idx} className={`flex ${reply.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${reply.isAdmin ? 'bg-[#1a56db] text-white rounded-br-md' : 'bg-white text-gray-800 shadow-sm rounded-bl-md'}`}>
                      <div className={`flex items-center gap-2 mb-1 ${reply.isAdmin ? 'justify-end' : ''}`}>
                        {!reply.isAdmin && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{selectedMessage.senderName?.charAt(0)?.toUpperCase() || 'U'}</div>}
                        <span className={`text-xs font-medium ${reply.isAdmin ? 'text-blue-100' : 'text-blue-600'}`}>{reply.isAdmin ? (reply.adminName || 'Admin') : selectedMessage.senderName}</span>
                        {reply.isAdmin && <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white text-[10px] font-bold">A</div>}
                      </div>
                      <p className="text-sm">{reply.content}</p>
                      {reply.attachments?.length > 0 && <div className="mt-2 space-y-1">{reply.attachments.map((url, aidx) => <a key={aidx} href={url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-xs underline ${reply.isAdmin ? 'text-blue-100' : 'text-blue-600'}`}><FileText size={12} /> Pièce jointe {aidx + 1}</a>)}</div>}
                      <p className={`text-xs mt-1 ${reply.isAdmin ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(reply.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Input */}
            <div className="border-t">
              {replyAttachments.length > 0 && (
                <div className="px-4 pt-3 flex flex-wrap gap-2">
                  {replyAttachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs">
                      <FileText size={12} /><span className="max-w-[120px] truncate">{att.name}</span>
                      <button onClick={() => setReplyAttachments(prev => prev.filter((_, i) => i !== idx))} className="ml-1 hover:text-red-500"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); if (inlineReply.trim() || replyAttachments.length > 0) replyToMessage(selectedMessage.id, inlineReply.trim() || 'Fichier(s) joint(s)'); }} className="p-4">
                <div className="flex gap-2 items-center">
                  <label className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors ${uploadingReplyFile ? 'opacity-50 pointer-events-none' : ''}`} data-testid="admin-reply-attach-btn">
                    {uploadingReplyFile ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> : <Paperclip size={16} className="text-gray-500" />}
                    <input type="file" className="hidden" onChange={handleReplyFileUpload} accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls" />
                  </label>
                  <input type="text" value={inlineReply} onChange={(e) => setInlineReply(e.target.value)} placeholder="Écrivez votre réponse..." data-testid="message-reply-input" className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#1a56db]" />
                  <button type="submit" disabled={!inlineReply.trim() && replyAttachments.length === 0} data-testid="message-reply-send-btn" className="w-10 h-10 bg-[#1a56db] hover:bg-[#1648b8] text-white rounded-full flex items-center justify-center disabled:opacity-50"><Send size={18} /></button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center"><MessageCircle size={48} className="mx-auto mb-4 opacity-50" /><p>Sélectionnez un message</p></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesSection;
