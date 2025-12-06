import { useState } from 'react';
import './ButtonChat.css'; 

const ChatButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleChatClick = () => {
    window.location.href = '/chat'; 
  };

  return (
    <button
      className="chat-button"
      onClick={handleChatClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Abrir chat de suporte"
    >
      <div className="chat-icon">
        <svg 
          width="30" 
          height="30" 
          viewBox="0 0 24 24" 
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" />
          <path d="M7 9H17V11H7V9ZM7 13H14V15H7V13Z" />
        </svg>
      </div>
      
      {isHovered && (
        <div className="chat-tooltip">
          Chat de Mensagens
        </div>
      )}
    </button>
  );
};

export default ChatButton;