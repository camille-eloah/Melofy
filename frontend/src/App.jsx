import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './componentes/login/Login'
import Cadastro from './componentes/cadastro/Cadastro'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <Login /> */}
      <Cadastro/>
    </>
  )
}

export default App
