import React, { useEffect, useState } from 'react';
import './Chat.css';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:8000";

function ChatMelofy() {
  const location = useLocation();
  const contato = location.state?.contato;
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      nome: 'Prof. Carlos Silva - Violão',
      instrumento: 'Violão Clássico',
      mensagem: 'Lembre-se de praticar os acordes da semana passada',
      hora: '20:46',
      naoLida: true,
      online: true
    },
    {
      id: 2,
      nome: 'Aula de Piano Avançado',
      instrumento: 'Piano',
      mensagem: 'Jucelino JK: Enviei o exercício no portal',
      hora: '20:21',
      naoLida: false,
      online: true
    },
    {
      id: 3,
      nome: 'João Goulart',
      instrumento: 'Canto Coral',
      mensagem: 'Jango: sábado, 14h no auditório',
      hora: '18:08',
      naoLida: true,
      online: false
    },
    {
      id: 4,
      nome: 'Mariana Costa',
      instrumento: 'Teoria Musical',
      mensagem: 'Tenho dúvidas sobre o exercício de escalas',
      hora: '15:56',
      naoLida: false,
      online: true
    },
    {
      id: 5,
      nome: 'Orquestra Jovem Melofy',
      instrumento: 'Múltiplos Instrumentos',
      mensagem: 'Repertório atualizado disponível no drive',
      hora: '14:30',
      naoLida: true,
      online: true
    }
  ]);

  const [chatAtivo, setChatAtivo] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [busca, setBusca] = useState('');
  const [historicoPorChat, setHistoricoPorChat] = useState({});

  const abrirChat = (chatId) => {
    const chatSelecionado = mensagens.find(msg => msg.id === chatId);
    setChatAtivo(chatSelecionado);
    
    setMensagens(prev => prev.map(msg => 
      msg.id === chatId ? {...msg, naoLida: false} : msg
    ));
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !chatAtivo) return;

    const tempId = `temp-${Date.now()}`;
    const agora = new Date();
    const mensagemTexto = novaMensagem.trim();
    const novaEntrada = {
      id: tempId,
      autor: 'me',
      texto: mensagemTexto,
      hora: formatarHora(agora),
      status: 'sending',
    };

    setHistoricoPorChat((prev) => {
      const atual = prev[chatAtivo.id] || criarHistoricoDummy(chatAtivo);
      return { ...prev, [chatAtivo.id]: [...atual, novaEntrada] };
    });
    setNovaMensagem('');

    try {
      const resposta = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinatario_id: chatAtivo.id,
          texto: mensagemTexto,
        }),
        credentials: 'include',
      });

      if (!resposta.ok) {
        throw new Error(`Falha ao enviar mensagem: ${resposta.status}`);
      }

      const data = await resposta.json();
      setHistoricoPorChat((prev) => {
        const historico = prev[chatAtivo.id] || [];
        const atualizado = historico.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: data.id ?? msg.id,
                status: 'sent',
                hora: data.created_at ? formatarHora(new Date(data.created_at)) : msg.hora,
              }
            : msg
        );
        return { ...prev, [chatAtivo.id]: atualizado };
      });
    } catch (error) {
      console.error(error);
      setHistoricoPorChat((prev) => {
        const historico = prev[chatAtivo.id] || [];
        const atualizado = historico.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'error' } : msg
        );
        return { ...prev, [chatAtivo.id]: atualizado };
      });
    }
  };

  useEffect(() => {
    if (!contato) return;
    const baseChat = {
      id: contato.id ?? `tmp-${Date.now()}`,
      nome: contato.nome || 'Contato',
      instrumento: contato.instrumento || 'Instrumento',
      mensagem: contato.mensagem || 'Nova conversa iniciada',
      hora: 'agora',
      naoLida: false,
      online: true,
      foto: contato.foto || null,
    };

    setMensagens((prev) => {
      const existente = prev.find((msg) => msg.id === baseChat.id);
      if (existente) {
        const merged = { ...existente, ...baseChat };
        setChatAtivo(merged);
        return prev.map((msg) => (msg.id === baseChat.id ? merged : msg));
      }
      setChatAtivo(baseChat);
      return [baseChat, ...prev];
    });
  }, [contato]);

  useEffect(() => {
    if (!chatAtivo) return;
    setHistoricoPorChat((prev) => {
      if (prev[chatAtivo.id]) return prev;
      return { ...prev, [chatAtivo.id]: criarHistoricoDummy(chatAtivo) };
    });
  }, [chatAtivo]);

  const filtrarConversas = mensagens.filter(chat =>
    chat.nome.toLowerCase().includes(busca.toLowerCase()) ||
    chat.instrumento.toLowerCase().includes(busca.toLowerCase())
  );

  const getIniciais = (nome) => {
    const palavras = nome.split(' ');
    if (palavras.length >= 2) {
      return (palavras[0][0] + palavras[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const renderAvatar = (chat) => {
    if (chat?.foto) {
      return (
        <img
          src={chat.foto}
          alt={`Foto de ${chat.nome}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      );
    }
    return getIniciais(chat?.nome || '');
  };

  const formatarHora = (date) => {
    try {
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    } catch {
      return '';
    }
  };

  const historicoMensagens = chatAtivo ? (historicoPorChat[chatAtivo.id] || []) : [];

  const criarHistoricoDummy = (chat) => ([
    {
      id: `rcvd-${chat.id}-1`,
      autor: 'other',
      texto: 'OlÇ­! Como estÇ­ o estudo da Sonata? Praticou os movimentos que passei?',
      hora: '20:42',
    },
    {
      id: `sent-${chat.id}-1`,
      autor: 'me',
      texto: 'Estou praticando diariamente! Ainda tenho dificuldade com o ritmo do terceiro movimento.',
      hora: '20:44',
    },
    {
      id: `rcvd-${chat.id}-2`,
      autor: 'other',
      texto: 'Ç% normal no inÇðcio. AmanhÇœ focaremos nessa parte especÇðfica. Traga suas dÇ§vidas!',
      hora: '20:46',
    },
  ]);

  return (
    <div className="app-container">   
        <Header/>
        <div className="chat-container">
        <div className="chat-sidebar">
            <div className="sidebar-header">
            <div className="header-content">
                <h2>Conversas</h2>
            </div>
            
            <div className="search-container">
                <div className="search-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                    type="text"
                    placeholder="Buscar conversas..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="search-input"
                />
                {busca && (
                    <button 
                    className="clear-search"
                    onClick={() => setBusca('')}
                    >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                    </svg>
                    </button>
                )}
                </div>
            </div>
            </div>

            <div className="conversations-list">
            {filtrarConversas.map((chat) => (
                <div
                key={chat.id}
                className={`conversation-item ${chat.naoLida ? 'unread' : ''} ${
                    chatAtivo?.id === chat.id ? 'active' : ''
                }`}
                onClick={() => abrirChat(chat.id)}
                >
                <div className="avatar-container">
                    <div className={`avatar ${chat.online ? 'online' : ''}`}>
                    {renderAvatar(chat)}
                    </div>
                </div>
                
                <div className="conversation-info">
                    <div className="conversation-header">
                    <div className="name-wrapper">
                        <h4 className="conversation-name">{chat.nome}</h4>
                        {chat.naoLida && <span className="unread-badge"></span>}
                    </div>
                    <span className="time-badge">{chat.hora}</span>
                    </div>
                    
                    <div className="conversation-details">
                    <span className="instrument-tag">{chat.instrumento}</span>
                    <p className="message-preview">{chat.mensagem}</p>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* Área do Chat */}
        <div className="chat-area">
            {chatAtivo ? (
            <>
                <div className="chat-header">
                <div className="chat-user-info">
                    <div className="user-avatar">{renderAvatar(chatAtivo)}</div>
                    <div className="user-details">
                    <h3>{chatAtivo.nome}</h3>
                    <div className="user-status">
                        <span className={`status-dot ${chatAtivo.online ? 'online' : 'offline'}`}></span>
                        <span className="status-text">
                        {chatAtivo.online ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    </div>
                </div>
                </div>

                <div className="messages-container">
                <div className="message-day">
                    <span className="day-label">Hoje</span>
                </div>
                
                <div className="message-bubble received">
                    <div className="message-avatar">{renderAvatar(chatAtivo)}</div>
                    <div className="message-content-wrapper">
                    <div className="message-content">
                        <p>Olá! Como está o estudo da Sonata? Praticou os movimentos que passei?</p>
                    </div>
                    <div className="message-footer">
                        <span className="message-time">20:42</span>
                    </div>
                    </div>
                </div>

                <div className="message-bubble sent">
                    <div className="message-content-wrapper">
                    <div className="message-content">
                        <p>Estou praticando diariamente! Ainda tenho dificuldade com o ritmo do terceiro movimento.</p>
                    </div>
                    <div className="message-footer">
                        <span className="message-time">20:44</span>
                        <span className="message-status">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                            <path d="M20 6 9 17l-5-5"/>
                        </svg>
                        </span>
                    </div>
                    </div>
                </div>

                <div className="message-bubble received">
                    <div className="message-avatar">{renderAvatar(chatAtivo)}</div>
                    <div className="message-content-wrapper">
                    <div className="message-content">
                        <p>É normal no início. Amanhã focaremos nessa parte específica. Traga suas dúvidas!</p>
                    </div>
                    <div className="message-footer">
                        <span className="message-time">20:46</span>
                    </div>
                    </div>
                </div>
                </div>

                <div className="message-input-container">
                <div className="message-input-wrapper">
                    <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                    className="message-input"
                    />
                </div>
                
                <button 
                    onClick={enviarMensagem} 
                    className="send-button"
                    disabled={!novaMensagem.trim()}
                >
                    <svg className="send-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m22 2-7 20-4-9-9-4Z"/>
                    <path d="M22 2 11 13"/>
                    </svg>
                </button>
                </div>
            </>
            ) : (
            <div className="empty-chat">
                <div className="empty-chat-content">
                <div className="empty-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"/>
                    </svg>
                </div>
                <h3>Selecione uma conversa</h3>
                <p>Escolha um chat para começar a conversar sobre música!</p>
                </div>
            </div>
            )}
        </div>
        </div>
        <Footer/>
    </div>
    );
}

export default ChatMelofy;
