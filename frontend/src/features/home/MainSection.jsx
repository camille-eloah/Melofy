import React, { useState, useRef } from 'react'
import './MainSection.css'

import guitarraImg from '../../assets/Images-MainSection/guitarra.png'
import baixoImg from '../../assets/Images-MainSection/baixo.png'
import saxofoneImg from '../../assets/Images-MainSection/saxofone.png'
import tecladoImg from '../../assets/Images-MainSection/teclado.png'
import violaoImg from '../../assets/Images-MainSection/violao.png'
import violinoImg from '../../assets/Images-MainSection/violino.png'
import cantoImg from '../../assets/Images-MainSection/canto.png'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const instrumentosBase = [
  { nome: "Teclado", img: tecladoImg, categoria: "Teclas" },
  { nome: "Guitarra", img: guitarraImg, categoria: "Cordas" },
  { nome: "Contrabaixo", img: baixoImg, categoria: "Cordas" },
  { nome: "Violão", img: violaoImg, categoria: "Cordas" },
  { nome: "Violino", img: violinoImg, categoria: "Cordas" },
  { nome: "Saxofone", img: saxofoneImg, categoria: "Sopro" },
  { nome: "Canto", img: cantoImg, categoria: "Vocal" },
]

function MainSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [professores, setProfessores] = useState([])
  const [existeBusca, setExisteBusca] = useState(false)
  const searchRef = useRef(null)

  // Função de busca executada somente ao clicar no botão
  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setProfessores([])
      setExisteBusca(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/professores/buscar?q=${searchQuery}`)
      const data = await res.json()

      if (!Array.isArray(data)) {
        setProfessores([])
      } else {
        setProfessores(data)
      }

      setExisteBusca(true)
    } catch (err) {
      console.error("Erro ao buscar professores:", err)
      setProfessores([])
      setExisteBusca(true)
    }
  }

  const resultadosProfessores = professores.filter((p) => {
    const q = searchQuery.toLowerCase()
    const nomeMatch = p.nome?.toLowerCase().includes(q)
    const instrumentoMatch = p.instrumentos?.some(
      (instr) => instr?.nome?.toLowerCase().includes(q)
    )
    return nomeMatch || instrumentoMatch
  })

  const existemResultados = resultadosProfessores.length > 0

  // Fechar sugestões ao clicar fora
  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setExisteBusca(false)
    }
  }

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ==============================
  // 🎠 CARROSSEL
  // ==============================
  const instrumentos = [...instrumentosBase, ...instrumentosBase]
  const baseLen = instrumentosBase.length
  const [index, setIndex] = useState(baseLen)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const innerRef = useRef(null)
  const [hoveredCard, setHoveredCard] = useState(null)

  const CARD_WIDTH = 160
  const GAP = 24
  const getTranslateX = () => -index * (CARD_WIDTH + GAP)

  function next() {
    setIndex((prev) => prev + 1)
    setIsTransitioning(true)
  }

  function previous() {
    setIndex((prev) => prev - 1)
    setIsTransitioning(true)
  }

  React.useEffect(() => {
    const el = innerRef.current
    if (!el) return

    function handleTransitionEnd() {
      if (index >= baseLen * 2) setIndex(prev => prev - baseLen)
      if (index < baseLen) setIndex(prev => prev + baseLen)
      setIsTransitioning(false)
    }

    el.addEventListener('transitionend', handleTransitionEnd)
    return () => el.removeEventListener('transitionend', handleTransitionEnd)
  }, [index, baseLen])

  React.useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => setTimeout(() => setIsTransitioning(true), 20))
    }
  }, [isTransitioning])

  React.useEffect(() => {
    const interval = setInterval(() => next(), 3500)
    return () => clearInterval(interval)
  }, [])

  // ==============================
  // RENDERIZAÇÃO
  // ==============================

  return (
    <main className="main-section">
      <div className="hero-section">
        <h1 className="logo">Melofy</h1>
        <h2>Encontre o instrumento perfeito para sua jornada musical</h2>

        <div className="search-wrapper" ref={searchRef}>
          <div className="search-box-google">
            <input
              type="text"
              className="search-input-google"
              placeholder='Busque "Violão" ou "Maria"'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn-google" onClick={handleSearch}>Buscar</button>
          </div>
        </div>
      </div>

      <div className="teachers-section">
        {/* SEM BUSCA: mostrar professores */}
        {!existeBusca && (
          <>
            <h3>Professores em Destaque</h3>
            <p>Aprenda com especialistas renomados</p>
            <div className="teachers-grid">
              {professores.map((p) => (
                <div key={p.id} className="teacher-card">
                  <div className="teacher-avatar">
                    {p.nome[0].toUpperCase()}{p.nome[1]?.toUpperCase()}
                  </div>
                  <h4>{p.nome}</h4>
                  <p>{p.instrumentos?.map(i => i.nome).join(", ")}</p>
                  <span className="teacher-rating">⭐ {p.rating ?? "5.0"}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* COM BUSCA */}
        {existeBusca && (
          <>
            <h3>Resultados para: "{searchQuery}"</h3>
            {!existemResultados && <p>Nenhum professor encontrado.</p>}

            <div className="teachers-grid">
              {resultadosProfessores.map((p, idx) => {
                const instrumentosFiltrados = p.instrumentos?.filter(i =>
                  i?.nome?.toLowerCase().includes(searchQuery.toLowerCase())
                ) || []

                return (
                  <div key={idx} className="teacher-card">
                    <div className="teacher-avatar">
                      {p.nome[0]?.toUpperCase()}{p.nome[1]?.toUpperCase()}
                    </div>
                    <h4>{p.nome}</h4>
                    <p className="teacher-instrument">
                      {instrumentosFiltrados.map(i => i.nome).join(", ")}
                    </p>
                    <span className="teacher-rating">⭐ {p.rating ?? "5.0"}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* CARROSSEL */}
      <div className="carousel-section">
        <div className="carousel-wrapper">
          <button className="nav-btn prev-btn" onClick={previous}>◀</button>
          <div className="carousel-viewport">
            <div
              className="carousel-inner"
              ref={innerRef}
              style={{
                transform: `translateX(${getTranslateX()}px)`,
                transition: isTransitioning ? 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              }}
            >
              {instrumentos.map((item, i) => (
                <div
                  key={i}
                  className={`instrument-card ${hoveredCard === i ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="card-content">
                    <img src={item.img} alt={item.nome} className="instrument-img" />
                    <span className="instrument-name">{item.nome}</span>
                    <span className="instrument-category">{item.categoria}</span>
                  </div>
                  <div className="card-action">
                    <button className="explore-btn">Ver aulas</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="nav-btn next-btn" onClick={next}>▶</button>
        </div>
        <div className="carousel-indicators">
          {instrumentosBase.map((_, i) => (
            <button
              key={i}
              className={`indicator ${(index % baseLen) === i ? 'active' : ''}`}
              onClick={() => setIndex(baseLen + i)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default MainSection
