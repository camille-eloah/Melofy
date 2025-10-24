import { Routes, Route } from 'react-router-dom'
import Login from '../componentes/Login'
import Home from '../features/home/HomePage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  )
}
