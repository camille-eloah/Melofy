import { useState } from 'react'
import './Cadastro.css'

function Cadastro() {
    const [mostrar, setMostrar] = useState(false)
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [tipo, setTipo] = useState('')

    function cadastrarUsuario(e){
        e.preventDefault()
        console.log('Usuário cadastrado:', { nome, email, senha, tipo })
        setMostrar(true)
    }

    return(
       <div className="Conteiner">
           <form onSubmit={cadastrarUsuario}>
                <h1>Cadastre-se</h1>

                <div className="input-group">
                    <label className="input-label">Nome Completo</label>
                    <input 
                        type="text" 
                        id="nome" 
                        placeholder="Digite seu nome completo" 
                        onChange={(e) => setNome(e.target.value)} 
                    />
                </div>

                <div className="linha-dupla">
                    <div className="input-group">
                        <label className="input-label">CPF</label>
                        <input type="text" id="cpf" placeholder="000.000.000-00" />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Data de Nascimento</label>
                        <input type="date" id="nascimento" />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">E-mail</label>
                    <input 
                        type="email" 
                        id="email" 
                        placeholder="seu@email.com" 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>

                <div className="linha-dupla">
                    <div className="input-group">
                        <label className="input-label">Senha</label>
                        <input 
                            type="password" 
                            id="senha" 
                            placeholder="Crie uma senha" 
                            onChange={(e) => setSenha(e.target.value)} 
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Confirmar Senha</label>
                        <input 
                            type="password" 
                            id="confirmarSenha" 
                            placeholder="Confirme sua senha" 
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Tipo de Usuário</label>
                    <select 
                        id="tipo" 
                        value={tipo} 
                        onChange={(e) => setTipo(e.target.value)}
                    >
                        <option value="">Selecione...</option>
                        <option value="Professor">Professor</option>
                        <option value="Aluno">Aluno</option>
                    </select>
                </div>

                <button type="submit">CADASTRAR</button>

                <div className="cadastro-link">
                     Já tem uma conta? <a href="/">Faça Login</a>
                </div>
                {mostrar && (
                    <div className="mensagem-sucesso">
                        <span className="icone-sucesso">✓</span>
                        Usuário cadastrado com sucesso!
                    </div>
                )}
           </form>
       </div>
    )
}

export default Cadastro