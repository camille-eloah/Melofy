import { Routes, Route } from 'react-router-dom'
import Login from '../componentes/login/Login'
import Cadastro from '../componentes/cadastro/Cadastro'
import Home from '../features/home/HomePage'
import ProfileUser from '../componentes/profile/ProfileUser'
import Localizacao from  "../componentes/localizacao/Localizacao"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<ProfileUser />} />
      <Route path="/localizacao" element={<Localizacao/>} />

    </Routes>
  )
}
