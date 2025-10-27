import { Routes, Route } from 'react-router-dom'
import Login from '../componentes/login/Login'
import Cadastro from '../componentes/cadastro/Cadastro'
import Home from '../features/home/HomePage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  )
}
