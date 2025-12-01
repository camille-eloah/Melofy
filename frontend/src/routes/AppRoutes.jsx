import { Routes, Route } from 'react-router-dom'
import Login from '../componentes/login/Login'
import RequireAuth from '../componentes/requireauth/RequireAuth'
import Cadastro from '../componentes/cadastro/Cadastro'
import Home from '../features/home/HomePage'
import ProfileUser from '../componentes/profile/ProfileUser'
import Localizacao from  "../componentes/localizacao/Localizacao"
import Entrada from '../componentes/entrada/Entrada'
import Instrumentos from '../componentes/instrumentos/Instrumentos'
import Feedback from '../componentes/feedback/FeedBack'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Entrada />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />

      <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfileUser /></RequireAuth>} />
      <Route path="/profile/:id" element={<RequireAuth><ProfileUser /></RequireAuth>} />
      <Route path="/localizacao" element={<RequireAuth><Localizacao/></RequireAuth>} />
      <Route path="/instrumentos" element={<RequireAuth><Instrumentos /></RequireAuth>} />
      <Route path="/feedback" element={<RequireAuth><Feedback /></RequireAuth>} />

    </Routes>
  )
}
