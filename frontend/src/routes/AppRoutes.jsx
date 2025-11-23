import { Routes, Route } from 'react-router-dom'
import Login from '../componentes/login/Login'
import Cadastro from '../componentes/cadastro/Cadastro'
import Home from '../features/home/HomePage'
import ProfileUser from '../componentes/profile/ProfileUser'
import Localizacao from  "../componentes/localizacao/Localizacao"
import Entrada from '../componentes/entrada/Entrada'
import Instrumentos from '../componentes/instrumentos/Instrumentos'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Entrada />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<ProfileUser />} />
      <Route path="/profile/:id" element={<ProfileUser />} />
      <Route path="/localizacao" element={<Localizacao/>} />
      <Route path="/instrumentos" element={<Instrumentos />} />
    </Routes>
  )
}
