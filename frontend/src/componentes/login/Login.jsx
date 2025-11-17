import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
    const [mostrar, setMostrar] = useState(false)  
    const [email, setEmail] = useState('')  
    const [senha, setSenha] = useState('')
    const navigate = useNavigate()

    function fazerLogin(e) {
        e.preventDefault()
        console.log('Usuário logado:', { email, senha })
        
        if (email && senha) {
            navigate('/home') 
        } else {
            alert('Preencha todos os campos!')
        }
        
        setMostrar(true)
    }

    return(
       <div className="Conteiner">
           <form onSubmit={fazerLogin}>
                <h1>Fazer Login</h1>
                
                <div className="input-group">
                    <label className="input-label">E-mail</label>
                    <input 
                        type="email" 
                        id='email' 
                        placeholder="seu@email.com" 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                
                <div className="input-group">
                    <label className="input-label">Senha</label>
                    <input 
                        type="password" 
                        id='senha' 
                        placeholder="Digite sua senha" 
                        onChange={(e) => setSenha(e.target.value)} 
                    />
                </div>

                <div className="lembrar-senha">
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                        Lembrar minha senha
                    </label>
                    <a href="#" className="esqueci-senha">Esqueci a senha</a>
                </div>

                <button type="submit">ENTRAR</button>

                <div className="cadastro-link">
                    Não tem uma conta? <a href="/cadastro">Cadastre-se</a>
                </div>

                {mostrar && (
                    <div className="mensagem-info">
                        Usuário: {email} | Senha: {senha}
                    </div>
                )}
           </form>
       </div>
    )
}

export default Login