import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

const LiveChat = ({ onOpenAuth }) => {
  const { t } = useTranslation();
  const { token, user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to WebSocket when chat is open
  const connectWebSocket = useCallback((chatId) => {
    if (!token || !chatId || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      wsRef.current = new WebSocket(`${WS_URL}/ws/chat/${chatId}/${token}`);

      wsRef.current.onopen = () => {
        console.log('Chat WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            setMessages(prev => [...prev, data.message]);
          }
        } catch (e) {
          console.error('Error parsing chat message:', e);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Chat WebSocket closed');
      };
    } catch (error) {
      console.error('Error creating chat WebSocket:', error);
    }
  }, [token]);

  // Start or get existing chat
  const startChat = async () => {
    if (!isAuthenticated) {
      setIsOpen(false);
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    setLoading(true);
    try {
      // Try to get existing chat first
      const existingResponse = await axios.get(`${BACKEND_URL}/api/chat/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (existingResponse.data) {
        setChat(existingResponse.data);
        setMessages(existingResponse.data.messages || []);
        connectWebSocket(existingResponse.data.id);
      } else {
        // Start new chat
        const response = await axios.post(`${BACKEND_URL}/api/chat/start`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChat(response.data);
        setMessages([]);
        connectWebSocket(response.data.id);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
    setLoading(false);
  };

  // Open chat
  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    if (!chat) {
      startChat();
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat || sending) return;

    setSending(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/chat/${chat.id}/message`,
        { content: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSending(false);
  };

  // Close chat
  const closeChat = async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsOpen(false);
    setChat(null);
    setMessages([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-24 w-14 h-14 bg-[#1a56db] hover:bg-[#1648b8] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
          data-testid="live-chat-button"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-24 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 transition-all ${
            isMinimized ? 'w-72 h-14' : 'w-96 h-[500px]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#1a56db] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Chat en direct</h3>
                {!isMinimized && (
                  <p className="text-xs text-blue-100">Nous sommes là pour vous aider</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={closeChat}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-[380px] overflow-y-auto p-4 bg-gray-50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 size={32} className="animate-spin text-[#1a56db]" />
                  </div>
                ) : !isAuthenticated ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">Connectez-vous pour démarrer une conversation</p>
                    <button
                      onClick={() => { setIsOpen(false); if (onOpenAuth) onOpenAuth('login'); }}
                      className="bg-[#1a56db] text-white px-6 py-2 rounded-lg hover:bg-[#1648b8] transition-colors"
                    >
                      Se connecter
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-[#1a56db]/10 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle size={32} className="text-[#1a56db]" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">Bienvenue {user?.firstName} !</p>
                    <p className="text-gray-500 text-sm">Comment pouvons-nous vous aider ?</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            msg.senderId === user?.id
                              ? 'bg-[#1a56db] text-white rounded-br-md'
                              : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                          }`}
                        >
                          {msg.isAdmin && msg.senderId !== user?.id && (
                            <p className="text-xs text-[#1a56db] font-medium mb-1">
                              {msg.senderName} (Conseiller)
                            </p>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              {isAuthenticated && (
                <form onSubmit={sendMessage} className="p-3 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#1a56db]"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="w-10 h-10 bg-[#1a56db] hover:bg-[#1648b8] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default LiveChat;
