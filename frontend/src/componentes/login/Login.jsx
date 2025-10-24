import { useState} from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login (){
    const [mostrar, setMostrar] = useState(false)  
    const [email, setEmail] = useState('')  
    const [senha, setSenha] = useState('')
    const navigate = useNavigate()

    function cadastrarUsuario(e){
        e.preventDefault()
        console.log('Usuário cadastrado:', { email, senha })
        
        if (email && senha) {
            navigate('/home') // redireciona para a Home
        } else {
            alert('Preencha todos os campos!')
        }
        
        setMostrar(true)
    }


    return(
       <div className="Conteiner">
           <form onSubmit={cadastrarUsuario}>
                <h1>Fazer Login</h1>
                <div>
                    <input type="email" id='email' placeholder="E-mail" onChange={(e) =>  setEmail(e.target.value)} />
                </div>
                <div>
                    <input type="password" id='senha' placeholder="Senha" name='senha' onChange={(e) => setSenha(e.target.value)} />
                </div>
                <button>Entrar</button>
                {mostrar && <p>Usuario: {email} | Senha: {senha}</p>}
           </form>
       </div>
    )
}

export default Login