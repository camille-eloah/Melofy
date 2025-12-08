import React, { useEffect, useState } from 'react';
import './Chat.css';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:8000";

function ChatMelofy() {
  const location = useLocation();
  const contato = location.state?.contato;
  const [mensagens, setMensagens] = useState([]);


  const [chatAtivo, setChatAtivo] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [busca, setBusca] = useState('');
  const [historicoPorChat, setHistoricoPorChat] = useState({});

  const [meuUuid, setMeuUuid] = useState(null);
  const [meuTipo, setMeuTipo] = useState(null);

useEffect(() => {
  const carregarUsuario = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
      if (!resp.ok) throw new Error("Erro ao obter usuário atual");

      const data = await resp.json();

      setMeuUuid(data.global_uuid);
      setMeuTipo(data.tipo_usuario); // 🔥 salva o tipo (aluno ou professor)

      console.log(
        "%c🔎 DEBUG — Usuário logado:",
        "color: #4ade80; font-size: 14px; font-weight: bold;"
      );
      console.log("➡️ UUID:", data.global_uuid);
      console.log("➡️ Tipo:", data.tipo_usuario);
      console.log("➡️ Nome:", data.nome);

    } catch (err) {
      console.error(err);
    }
  };

  carregarUsuario();
}, []);

useEffect(() => {
  const carregarConversas = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/messages/my-conversations`, {
        credentials: "include"
      });
      if (!resp.ok) throw new Error("Erro ao carregar conversas");

      const data = await resp.json();

      console.log("📌 RAW do backend (my-conversations):", data);
      console.log(
        "📌 RAW do backend:",
        JSON.stringify(data, null, 2)
      );
      data.forEach((item, i) => console.log("Item", i, { ...item }));


      const lista = data.map(c => ({
        uuid: c.uuid,
        nome: c.nome,
        foto: c.foto,
        instrumentos: c.instrumentos || [], 
        mensagem: c.mensagem,
        hora: formatarHora(new Date(c.hora)),
        naoLida: false,
        online: false,
      }));

      console.log("📌 Lista montada para setMensagens:", lista);

      setMensagens(lista);
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
    }
  };

  carregarConversas();
}, []);


  const abrirChat = (chatUuid) => {
    const chatSelecionado = mensagens.find(msg => msg.uuid === chatUuid);
    setChatAtivo(chatSelecionado);
    
    setMensagens(prev => prev.map(msg => 
      msg.uuid === chatUuid ? {...msg, naoLida: false} : msg
    ));
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !chatAtivo) return;
    
    // Validar se UUID é real (não temporário)
    if (chatAtivo.uuid.startsWith('tmp-')) {
      alert('⚠️ Você precisa selecionar um contato real para enviar mensagens');
      return;
    }

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
      const atual = prev[chatAtivo.uuid] || criarHistoricoDummy(chatAtivo);
      return { ...prev, [chatAtivo.uuid]: [...atual, novaEntrada] };
    });
    setNovaMensagem('');

    try {
      const resposta = await fetch(`${API_BASE_URL}/messages/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinatario_uuid: chatAtivo.uuid,
          texto: mensagemTexto,
        }),
        credentials: 'include',
      });

      if (!resposta.ok) {
        throw new Error(`Falha ao enviar mensagem: ${resposta.status}`);
      }

      const data = await resposta.json();
      setHistoricoPorChat((prev) => {
        const historico = prev[chatAtivo.uuid] || [];
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
        return { ...prev, [chatAtivo.uuid]: atualizado };
      });
    } catch (error) {
      console.error(error);
      setHistoricoPorChat((prev) => {
        const historico = prev[chatAtivo.uuid] || [];
        const atualizado = historico.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'error' } : msg
        );
        return { ...prev, [chatAtivo.uuid]: atualizado };
      });
    }
  };

  useEffect(() => {
    if (!contato) return;
    const baseChat = {
      uuid: contato.uuid ?? `tmp-${Date.now()}`,
      nome: contato.nome || 'Contato',
      instrumentos: Array.isArray(contato.instrumentos) ? contato.instrumentos : [],
      mensagem: contato.mensagem || 'Nova conversa iniciada',
      hora: 'agora',
      naoLida: false,
      online: true,
      foto: contato.foto || null,
    };

    setMensagens((prev) => {
      const existente = prev.find((msg) => msg.uuid === baseChat.uuid);
      if (existente) {
        const merged = { ...existente, ...baseChat };
        setChatAtivo(merged);
        return prev.map((msg) => (msg.uuid === baseChat.uuid ? merged : msg));
      }
      setChatAtivo(baseChat);
      return prev.some(m => m.uuid === baseChat.uuid)
    ? prev
    : [baseChat, ...prev];

    });
  }, [contato]);

  useEffect(() => {
    if (!chatAtivo || !meuUuid) return; // aguarda UUID ser carregado
    
    // Não fazer requisição se for UUID temporário
    if (chatAtivo.uuid.startsWith('tmp-')) {
      console.warn("⚠️ Chat temporário, ignorando carregamento de histórico");
      return;
    }

    const carregarHistorico = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/messages/conversation/${chatAtivo.uuid}/full`, {
          credentials: "include",
        });

        if (!resp.ok) throw new Error("Erro ao carregar histórico");
        const data = await resp.json();

        // mensagens
        const mensagensFormatadas = data.mensagens.map(msg => ({
          id: msg.id,
          texto: msg.texto,
          hora: formatarHora(new Date(msg.created_at)),
          autor: msg.remetente_uuid === meuUuid ? "me" : "other",
          status: "sent"
        }));

        // atualizar dados do chat ativo com nome/foto/instrumentos atualizados
        setChatAtivo(prev => ({
          ...prev,
          nome: data.pessoa.nome,
          foto: data.pessoa.foto,
          instrumentos: data.pessoa.instrumentos || []
        }));

        // salvar histórico
        setHistoricoPorChat(prev => ({
          ...prev,
          [chatAtivo.uuid]: mensagensFormatadas
        }));


      } catch (err) {
        console.error(err);
      }
    };

    carregarHistorico();
  }, [chatAtivo, meuUuid]);



  const filtrarConversas = mensagens.filter(chat =>
    chat.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (chat.instrumentos || []).some(inst =>
      inst.toLowerCase().includes(busca.toLowerCase())
    )
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

  const historicoMensagens = chatAtivo ? (historicoPorChat[chatAtivo.uuid] || []) : [];

  const criarHistoricoDummy = (chat) => ([
    {
      id: `rcvd-${chat.uuid}-1`,
      autor: 'other',
      texto: 'Olá! Como está o estudo da Sonata? Praticou os movimentos que passei?',
      hora: '20:42',
    },
    {
      id: `sent-${chat.uuid}-1`,
      autor: 'me',
      texto: 'Estou praticando diariamente! Ainda tenho dificuldade com o ritmo do terceiro movimento.',
      hora: '20:44',
    },
    {
      id: `rcvd-${chat.uuid}-2`,
      autor: 'other',
      texto: 'É normal no início. Amanhã focaremos nessa parte específica. Traga suas dúvidas!',
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
                key={chat.uuid}
                className={`conversation-item ${chat.naoLida ? 'unread' : ''} ${
                    chatAtivo?.uuid === chat.uuid ? 'active' : ''
                }`}
                onClick={() => abrirChat(chat.uuid)}
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
                    <div className="instrument-tags">
                    {(chat.instrumentos || []).slice(0, 3).map((inst, index) => (
                      <span key={index} className="instrument-tag">{inst}</span>
                    ))}
                  </div>
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

    {historicoMensagens.map((msg) => (
        <div 
            key={msg.id}
            className={`message-bubble ${msg.autor === "me" ? "sent" : "received"}`}
        >
            {msg.autor === "other" && (
                <div className="message-avatar">
                    {renderAvatar(chatAtivo)}
                </div>
            )}

            <div className="message-content-wrapper">
                <div className="message-content">
                    <p>{msg.texto}</p>
                </div>

                <div className="message-footer">
                    <span className="message-time">{msg.hora}</span>

                    {msg.autor === "me" && (
                        <span className="message-status">

                            {msg.status === "sending" && (
                                <span className="status sending">...</span>
                            )}

                            {msg.status === "sent" && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                    <path d="M20 6 9 17l-5-5"/>
                                </svg>
                            )}

                            {msg.status === "error" && (
                                <span className="status error">!</span>
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    ))}

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
