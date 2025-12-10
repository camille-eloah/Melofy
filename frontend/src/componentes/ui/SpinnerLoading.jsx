import './SpinnerLoading.css'

export default function SpinnerLoading({ size = 'medium', fullScreen = false, message = 'Carregando...' }) {
  const sizeClass = `spinner-${size}`
  
  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        <div className="spinner-content">
          <div className={`spinner ${sizeClass}`}>
            <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13M9 18l12-2v3L9 21v-3z" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          {message && <p className="spinner-message">{message}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClass}`}>
        <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13M9 18l12-2v3L9 21v-3z" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  )
}
