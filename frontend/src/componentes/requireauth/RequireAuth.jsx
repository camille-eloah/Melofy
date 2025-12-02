// src/components/RequireAuth.jsx
{/*
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function RequireAuth({ children }) {
  const [carregando, setCarregando] = useState(true)
  const [autenticado, setAutenticado] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function checarAuth() {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include',
        })

        if (res.ok) {
          setAutenticado(true)
        } else {
          setAutenticado(false)
          navigate('/login', { replace: true })
        }
      } catch {
        setAutenticado(false)
        navigate('/login', { replace: true })
      } finally {
        setCarregando(false)
      }
    }

    checarAuth()
  }, [navigate])

  if (carregando) {
    return <div>Carregando...</div> // pode trocar por um loader bonitinho
  }

  if (!autenticado) {
    return null
  }

  return children
}

export default RequireAuth
*/}