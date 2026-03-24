import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Send, X } from 'lucide-react';
import axios, { API, WS_URL } from './adminApi';
import { useAuth } from '../../context/AuthContext';

const ChatsSection = ({ onBadgeUpdate }) => {
  const { token } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const chatWsRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  useEffect(() => { loadChats(); }, []);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    return () => { if (chatWsRef.current) chatWsRef.current.close(); };
  }, []);

  const loadChats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/chats`);
      setChats(response.data);
      onBadgeUpdate?.('chats', response.data.length);
    } catch (err) { console.error('Error loading chats:', err); }
    setLoading(false);
  };

  const openChat = async (chat) => {
    setActiveChat(chat);
    setChatMessages(chat.messages || []);
    if (chatWsRef.current) chatWsRef.current.close();
    try {
      chatWsRef.current = new WebSocket(`${WS_URL}/ws/chat/${chat.id}/${token}`);
      chatWsRef.current.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') setChatMessages(prev => [...prev, data.message]);
        } catch (e) { console.error('Error parsing chat message:', e); }
      };
    } catch (error) { console.error('Error connecting to chat WebSocket:', error); }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !activeChat) return;
    try {
      const response = await axios.post(`${API}/chat/${activeChat.id}/message`, { content: newChatMessage.trim() }, { headers: { Authorization: `Bearer ${token}` } });
      setChatMessages(prev => [...prev, response.data]);
      setNewChatMessage('');
    } catch (err) { console.error('Error sending message:', err); }
  };

  const closeActiveChat = () => {
    if (chatWsRef.current) { chatWsRef.current.close(); chatWsRef.current = null; }
    setActiveChat(null);
    setChatMessages([]);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
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
              <button key={chat.id} onClick={() => openChat(chat)} className={`w-full p-4 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeChat?.id === chat.id ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a56db] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {chat.userName?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{chat.userName}</p>
                    <p className="text-xs text-gray-500 truncate">{chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1].content : 'Nouvelle conversation'}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        {activeChat ? (
          <>
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
              <button onClick={closeActiveChat} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">Début de la conversation</div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.isAdmin ? 'bg-[#1a56db] text-white rounded-br-md' : 'bg-white text-gray-800 shadow-sm rounded-bl-md'}`}>
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
            <form onSubmit={sendChatMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input type="text" value={newChatMessage} onChange={(e) => setNewChatMessage(e.target.value)} placeholder="Écrivez votre message..." className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#1a56db]" />
                <button type="submit" disabled={!newChatMessage.trim()} className="w-10 h-10 bg-[#1a56db] hover:bg-[#1648b8] text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-colors">
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
  );
};

export default ChatsSection;
