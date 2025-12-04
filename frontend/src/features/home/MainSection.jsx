import React, { useState, useRef, useEffect } from 'react'
import './MainSection.css'

import guitarraImg from '../../assets/Images-MainSection/guitarra.png'
import baixoImg from '../../assets/Images-MainSection/baixo.png'
import saxofoneImg from '../../assets/Images-MainSection/saxofone.png'
import tecladoImg from '../../assets/Images-MainSection/teclado.png'
import violaoImg from '../../assets/Images-MainSection/violao.png'
import violinoImg from '../../assets/Images-MainSection/violino.png'
import cantoImg from '../../assets/Images-MainSection/canto.png'

const instrumentosBase = [
  { nome: "Teclado", img: tecladoImg, categoria: "Teclas" },
  { nome: "Guitarra", img: guitarraImg, categoria: "Cordas" },
  { nome: "Contrabaixo", img: baixoImg, categoria: "Cordas" },
  { nome: "Violão", img: violaoImg, categoria: "Cordas" },
  { nome: "Violino", img: violinoImg, categoria: "Cordas" },
  { nome: "Saxofone", img: saxofoneImg, categoria: "Sopro" },
  { nome: "Canto", img: cantoImg, categoria: "Vocal" },
]

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

function MainSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const searchInputRef = useRef(null)

  // duplicamos o array para ajudar no loop infinito
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

  useEffect(() => {
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

  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => setTimeout(() => setIsTransitioning(true), 20))
    }
  }, [isTransitioning])

  useEffect(() => {
    const interval = setInterval(() => next(), 3500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const popularSearches = ["Guitarra", "Piano", "Violão", "Canto", "Bateria", "Violino"]

  const handleSearch = async (query = '') => {
    const searchTerm = query || searchQuery
    if (!searchTerm) return

    try {
      const res = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(searchTerm)}`)
      const data = await res.json()
      setSearchResults(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error("Erro na busca:", error)
      setSearchResults([])
    }
  }

  const handleSuggestionClick = (nome) => {
    setSearchQuery(nome)
    handleSearch(nome)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <main className="main-section">
      <div className="hero-section">
        <h1 className="logo">Melofy</h1>
        <h2>Encontre o instrumento perfeito para sua jornada musical</h2>

        <div className="google-like-search">
          <div className="search-container-wrapper" ref={searchInputRef}>
            <div className={`search-box ${showSuggestions ? 'active' : ''}`}>
              <div className="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#5f6368" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder="Pesquise instrumentos ou professores..."
                className="search-input-google"
              />
              {searchQuery && (
                <button 
                  className="clear-button"
                  onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                  aria-label="Limpar busca"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#5f6368"/>
                  </svg>
                </button>
              )}
              <div className="search-tools">
                <button 
                  className="search-button-google"
                  onClick={() => handleSearch()}
                  aria-label="Pesquisar"
                >
                  🔍
                </button>
              </div>
            </div>
          </div>
          
          <div className="search-buttons">
            <button 
              className="google-search-btn"
              onClick={() => handleSearch()}
            >
              Pesquisa Melofy
            </button>
            <button className="google-lucky-btn">
              Estou com sorte
            </button>
          </div>
        </div>
      </div>

      {/* Carrossel Aprimorado */}
      <div className="carousel-section">
        <div className="carousel-wrapper">
          <button className="nav-btn prev-btn" onClick={previous} aria-label="Anterior">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

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
                  onClick={() => handleSuggestionClick(item.nome)}
                >
                  <div className="card-glow"></div>
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

          <button className="nav-btn next-btn" onClick={next} aria-label="Próximo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="carousel-indicators">
          {instrumentosBase.map((_, i) => (
            <button
              key={i}
              className={`indicator ${(index % baseLen) === i ? 'active' : ''}`}
              onClick={() => setIndex(baseLen + i)}
              aria-label={`Ir para instrumento ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="teachers-section">
        <h3>Professores em Destaque</h3>
        <p>Aprenda com especialistas renomados</p>
        
        <div className="teachers-grid">
          <div className="teacher-card">
            <div className="teacher-avatar" style={{background: 'linear-gradient(135deg, #4285f4, #34a853)'}}>JS</div>
            <h4>João Silva</h4>
            <p>Especialista em Guitarra</p>
            <span className="teacher-rating">⭐ 4.9</span>
            <div className="teacher-stats">
              <span>2.5k alunos</span>
              <span>•</span>
              <span>120 aulas</span>
            </div>
          </div>
          
          <div className="teacher-card">
            <div className="teacher-avatar" style={{background: 'linear-gradient(135deg, #ea4335, #fbbc05)'}}>MA</div>
            <h4>Maria Andrade</h4>
            <p>Professora de Piano</p>
            <span className="teacher-rating">⭐ 4.8</span>
            <div className="teacher-stats">
              <span>1.8k alunos</span>
              <span>•</span>
              <span>95 aulas</span>
            </div>
          </div>
          
          <div className="teacher-card">
            <div className="teacher-avatar" style={{background: 'linear-gradient(135deg, #34a853, #4285f4)'}}>PC</div>
            <h4>Pedro Costa</h4>
            <p>Mestre em Violino</p>
            <span className="teacher-rating">⭐ 4.9</span>
            <div className="teacher-stats">
              <span>1.2k alunos</span>
              <span>•</span>
              <span>80 aulas</span>
            </div>
          </div>
          
          <div className="teacher-card">
            <div className="teacher-avatar" style={{background: 'linear-gradient(135deg, #fbbc05, #ea4335)'}}>AF</div>
            <h4>Ana Ferreira</h4>
            <p>Coach Vocal</p>
            <span className="teacher-rating">⭐ 4.7</span>
            <div className="teacher-stats">
              <span>3.1k alunos</span>
              <span>•</span>
              <span>150 aulas</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MainSection
