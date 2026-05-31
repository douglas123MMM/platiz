import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { AIProvider, ChatMessage, Conversation } from '../types';
import { HiChat, HiPaperAirplane, HiTrash, HiPlus, HiMenu, HiChip } from 'react-icons/hi';

export default function ChatPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/ai/providers/active').then((r) => { setProviders(r.data); if (r.data.length > 0) setSelectedProvider(r.data[0].id); }).catch(() => {});
    api.get('/ai/conversations').then((r) => setConversations(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async (id: string) => {
    setActiveConv(id);
    setSidebarOpen(false);
    const { data } = await api.get(`/ai/conversations/${id}/messages`);
    setMessages(data);
  };

  const newChat = () => {
    setActiveConv(null);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedProvider) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: 'temp', user_id: '', role: 'user', content: userMsg, created_at: new Date().toISOString() }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { provider_id: selectedProvider, message: userMsg, conversation_id: activeConv });
      setMessages((prev) => [...prev, { id: 'resp', user_id: '', provider_id: selectedProvider, role: 'assistant', content: data.response, created_at: new Date().toISOString() }]);
      if (!activeConv) {
        setActiveConv(data.conversation_id);
        api.get('/ai/conversations').then((r) => setConversations(r.data));
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { id: 'err', user_id: '', role: 'assistant', content: `Error: ${err.response?.data?.error || 'Error de conexión'}`, created_at: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const deleteConv = async (id: string) => {
    await api.delete(`/ai/conversations/${id}`);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConv === id) newChat();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 animate-fade-in">
      <div className={`${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:relative lg:flex lg:w-80 flex-col glass rounded-2xl border border-[#FFD700]/10 overflow-hidden`}>
        <div className="p-4 border-b border-[#FFD700]/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">Historial</h2>
          <button onClick={newChat} className="btn-ghost p-2 rounded-lg"><HiPlus className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <div key={conv.id} className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${activeConv === conv.id ? 'bg-[#FFD700]/10 border border-[#FFD700]/20' : 'hover:bg-[#FFD700]/5 border border-transparent'}`} onClick={() => loadConversation(conv.id)}>
              <HiChat className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{conv.title}</p>
                <p className="text-xs text-gray-500">{new Date(conv.updated_at).toLocaleDateString()}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteConv(conv.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"><HiTrash className="w-4 h-4" /></button>
            </div>
          ))}
          {conversations.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Sin conversaciones</p>}
        </div>
        <div className="p-4 border-t border-[#FFD700]/10">
          <button onClick={newChat} className="btn-secondary w-full text-sm flex items-center justify-center gap-2"><HiPlus className="w-4 h-4" /> Nuevo chat</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col glass rounded-2xl border border-[#FFD700]/10 overflow-hidden">
        <div className="p-4 border-b border-[#FFD700]/10 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-[#FFD700]/5 text-gray-400"><HiMenu className="w-5 h-5" /></button>
          <HiChip className="w-6 h-6 text-[#FFD700]" />
          <span className="text-sm text-gray-300 font-medium">IA:</span>
          <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} className="bg-[#0a0a0f] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFD700]">
            {providers.map((p) => <option key={p.id} value={p.id}>{p.name} {p.model ? `(${p.model})` : ''}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <HiChat className="w-16 h-16 text-gray-700 mb-4" />
              <h3 className="text-xl font-display font-bold gold-text mb-2">Chat IA Global Dorado</h3>
              <p className="text-gray-600 max-w-md">Selecciona un proveedor de IA (ChatGPT, Gemini, Claude, Perplexity...) y comienza a chatear. Tus conversaciones se guardan automáticamente.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-[#DAA520] to-[#B8860B] text-black rounded-br-md font-medium' : 'bg-[#0a0a0f]/80 border border-[#FFD700]/10 text-gray-200 rounded-bl-md'}`}>
                {msg.role === 'assistant' && msg.provider_name && <p className="text-xs text-[#FFD700] mb-1 font-medium">{msg.provider_name}</p>}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-[#0a0a0f]/80 border border-[#FFD700]/10 p-4 rounded-2xl rounded-bl-md">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-[#FFD700]/10">
          <div className="flex gap-3">
            <input type="text" className="input flex-1" placeholder="Escribe tu mensaje a la IA..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
            <button onClick={sendMessage} disabled={loading || !input.trim() || !selectedProvider} className="btn-primary px-5 disabled:opacity-50 disabled:cursor-not-allowed"><HiPaperAirplane className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
