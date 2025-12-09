import './NotificationModal.css'

function NotificationModal({ showNotifications, setShowNotifications }) {
  const notifications = [
    {
      id: 1,
      title: 'Bem-vindo ao MELOFY!',
      message: 'Comece a explorar sua nova experiência musical',
      time: 'Agora mesmo',
      read: false,
      type: 'welcome'
    },
    {
      id: 2,
      title: 'Playlist Atualizada',
      message: 'Sua playlist "Favoritos" foi atualizada com novas músicas',
      time: '2 horas atrás',
      read: false,
      type: 'music'
    },
    {
      id: 3,
      title: 'Novo Amigo',
      message: 'João começou a seguir você',
      time: '1 dia atrás',
      read: true,
      type: 'friend'
    },
    {
      id: 4,
      title: 'Evento Próximo',
      message: 'Show ao vivo em sua localização em 3 dias',
      time: '2 dias atrás',
      read: true,
      type: 'event'
    }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'welcome':
        return (
          <svg className="icon-welcome" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'music':
        return (
          <svg className="icon-music" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        );
      case 'friend':
        return (
          <svg className="icon-friend" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
          </svg>
        );
      case 'event':
        return (
          <svg className="icon-event" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      default:
        return (
          <svg className="icon-bell" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        );
    }
  }

  const markAsRead = (id) => {
    console.log('Marcando como lida:', id)
  }

  const markAllAsRead = () => {
    console.log('Marcando todas como lidas')
  }

  if (!showNotifications) return null

  return (
    <>
      <div
        className="notification-overlay"
        onClick={() => setShowNotifications(false)}
      />
      <div className="notification-modal">
        <div className="notification-header">
          <div className="notification-title">
            <svg className="notification-header-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <h3>Notificações</h3>
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount} novas</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className="mark-all-read"
              onClick={markAllAsRead}
            >
              Limpar todas
            </button>
          )}
        </div>

        <div className="notification-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-icon-item">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header-item">
                    <h4>{notification.title}</h4>
                    {!notification.read && <span className="new-badge">NOVA</span>}
                  </div>
                  <p>{notification.message}</p>
                  <span className="notification-time">{notification.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-notifications">
              <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <p>Nenhuma notificação</p>
              <span className="empty-subtitle">Tudo atualizado!</span>
            </div>
          )}
        </div>

        <div className="notification-footer">
          <button className="view-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Ver todas as notificações
          </button>
        </div>
      </div>
    </>
  )
}

export default NotificationModal
