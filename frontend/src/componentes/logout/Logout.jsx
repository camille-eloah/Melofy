import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { logoutRequest } from '../services/auth'

function LogoutButton() {
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logoutRequest()

      Swal.fire({
        icon: 'success',
        title: 'Logout realizado',
        text: 'Você saiu da sua conta.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
        timer: 2000,
        timerProgressBar: true,
      })

      navigate('/login')
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao sair',
        text: err.message,
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
