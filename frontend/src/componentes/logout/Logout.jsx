import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function LogoutButton() {
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) throw new Error(data?.detail ?? 'Erro ao fazer logout')

      await Swal.fire({
        icon: 'success',
        title: 'Logout realizado',
        text: 'Você saiu da sua conta.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
        timer: 2000,
        timerProgressBar: true,
      })

      navigate('/login', { replace: true })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao sair',
        text: error.message,
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      })
    }
  }

  return (
    <button onClick={handleLogout}>
      Sair
    </button>
  )
}

export default LogoutButton
