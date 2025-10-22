// src/TesteHook.jsx
import { useNavigate } from 'react-router-dom'

export default function TesteHook() {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/home')}>Ir para Home</button>
}
