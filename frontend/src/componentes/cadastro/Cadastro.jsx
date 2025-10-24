import { useState} from 'react'
import './Cadastro.css'

function Login (){
    const [mostrar, setMostrar] = useState(false)  
    const [email, setEmail] = useState('')  
    const [senha, setSenha] = useState('')
    const [nome, setNome] = useState('')

    function cadastrarUsuario(e){
        e.preventDefault()
        console.log('Usuário cadastrado:', { email, senha })
        setMostrar(true)
    }


    return(
       <div className="Conteiner">
           <form onSubmit={cadastrarUsuario}>
                <h1>Cadastre-se</h1>
                <div>
                    <input type="nome" id='nome' placeholder='Nome Completo' onChange={(e) => setNome(e.target.value)} />
                </div>
                <div>
                    <input type="cpf" name="" id="" placeholder="CPF"/>
                    <input type="nascimento" placeholder="data"/>
                </div>
                <div>
                    <input type="email" id='email' placeholder="E-mail" onChange={(e) =>  setEmail(e.target.value)} />
                </div>
                <div>
                    <input type="password" id='senha' placeholder="Senha" name='senha' onChange={(e) => setSenha(e.target.value)} />
                </div>
                <button>Entrar</button>
                {mostrar && <p>Usuario: {nome} | {email} | Senha: {senha}</p>}
           </form>
       </div>
    )
}

export default Login