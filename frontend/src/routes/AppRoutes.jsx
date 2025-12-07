import { Routes, Route } from 'react-router-dom'
import Login from '../componentes/login/Login'
{/*import RequireAuth from '../componentes/requireauth/RequireAuth'*/ }
import Cadastro from '../componentes/cadastro/Cadastro'
import Home from '../features/home/HomePage'
import ProfileUser from '../componentes/profile/ProfileUser'
import Localizacao from "../componentes/localizacao/Localizacao"
import Entrada from '../componentes/entrada/Entrada'
import Instrumentos from '../componentes/instrumentos/Instrumentos'
import Feedback from '../componentes/feedback/FeedBack'
import ChatMelofy from '../componentes/chat/Chat'
import NotFound from '../componentes/notfound/NotFound'
import DashProfessor from '../componentes/dashprofessor/DashProfessor'


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Entrada />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<ProfileUser />} />
      <Route path="/profile/:tipo/:uuid" element={<ProfileUser />} />
      <Route path="/professor/:uuid" element={<ProfileUser />} />
      <Route path="/aluno/:uuid" element={<ProfileUser />} />
      <Route path="/localizacao" element={<Localizacao />} />
      <Route path="/instrumentos" element={<Instrumentos />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/chat" element={<ChatMelofy />} />
      <Route path="*" element={<NotFound />} />
      <Route path='/dashprofessor' element={<DashProfessor />} />


    </Routes>
  )
}

{/*
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Entrada />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />

      <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfileUser /></RequireAuth>} />
      <Route path="/profile/:tipo/:uuid" element={<RequireAuth><ProfileUser /></RequireAuth>} />
      <Route path="/professor/:uuid" element={<RequireAuth><ProfileUser /></RequireAuth>} />
      <Route path="/aluno/:uuid" element={<RequireAuth><ProfileUser /></RequireAuth>} />
      <Route path="/localizacao" element={<RequireAuth><Localizacao/></RequireAuth>} />
      <Route path="/instrumentos" element={<RequireAuth><Instrumentos /></RequireAuth>} />
      <Route path="/feedback" element={<RequireAuth><Feedback /></RequireAuth>} />

    </Routes>
  )
}
*/}
