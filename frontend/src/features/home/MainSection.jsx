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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function MainSection({ searchTerm = "", onSearchChange = () => {} }) {
  const [searchQuery, setSearchQuery] = useState(searchTerm || '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredInstruments, setFilteredInstruments] = useState([])
  const [instrumentosApi, setInstrumentosApi] = useState([])
  const searchInputRef = useRef(null)

  
  const instrumentos = [...instrumentosBase, ...instrumentosBase]
  const baseLen = instrumentosBase.length

 
  const [index, setIndex] = useState(baseLen)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const innerRef = useRef(null)
  const [hoveredCard, setHoveredCard] = useState(null)

 
  const CARD_WIDTH = 160
  const GAP = 24 

  
  const getTranslateX = () => {
    
    return -index * (CARD_WIDTH + GAP)
  }

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
      if (index >= baseLen * 2) {
        setIsTransitioning(false)
        setIndex((prev) => prev - baseLen)
      }
    
      if (index < baseLen) {
        setIsTransitioning(false)
        setIndex((prev) => prev + baseLen)
      }
    }

    el.addEventListener('transitionend', handleTransitionEnd)
    return () => el.removeEventListener('transitionend', handleTransitionEnd)
  }, [index, baseLen])


  useEffect(() => {
    if (!isTransitioning) {
     
      requestAnimationFrame(() => {
        setTimeout(() => setIsTransitioning(true), 20)
      })
    }
  }, [isTransitioning])

  
  useEffect(() => {
    const interval = setInterval(() => {
      next()
    }, 3500)
    
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const loadInstruments = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/instruments`);
        if (!resp.ok) throw new Error("erro_instruments");
        const data = await resp.json();
        if (Array.isArray(data)) {
          setInstrumentosApi(
            data.map((inst) => ({
              nome: inst.nome,
              categoria: inst.tipo || "",
            }))
          );
        } else {
          setInstrumentosApi([]);
        }
      } catch (err) {
        setInstrumentosApi([]);
      }
    };
    loadInstruments();
  }, []);

  useEffect(() => {
    if ((searchQuery || '').trim() === '') {
      setFilteredInstruments([])
      return
    }
    const lista = instrumentosApi.length ? instrumentosApi : instrumentosBase;
    const filtered = lista.filter(instrument =>
      (instrument.nome || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (instrument.categoria || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredInstruments(filtered)
  }, [searchQuery, instrumentosApi])
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

  const handleSearch = (query = '') => {
    if (query) {
      setSearchQuery(query)
      onSearchChange(query)
    } else {
      onSearchChange(searchQuery)
    }
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (instrumentName) => {
    setSearchQuery(instrumentName)
    handleSearch(instrumentName)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <main className="main-section">
      <div className="hero-section">
        <h1 className="logo">MELOFY</h1>
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
                placeholder="Pesquise instrumentos musicais..."
                className="search-input-google"
              />
              {searchQuery && (
                <button 
                  className="clear-button"
                  onClick={() => setSearchQuery('')}
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" fill="#4285f4"/>
                  </svg>
                </button>
              </div>
            </div>
            {showSuggestions && (
              <div className="suggestions-dropdown">
                {searchQuery ? (
                  <>
                    {filteredInstruments.length > 0 ? (
                      <div className="suggestions-list">
                        {filteredInstruments.map((instrument, index) => (
                          <button
                            key={index}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(instrument.nome)}
                          >
                            <div className="suggestion-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#5f6368" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div className="suggestion-content">
                              <div className="suggestion-title">{instrument.nome}</div>
                              <div className="suggestion-category">{instrument.categoria}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="no-results">
                        <div className="no-results-icon">🎵</div>
                        <div className="no-results-text">
                          <div className="no-results-title">Nenhum resultado para "{searchQuery}"</div>
                          <div className="no-results-subtitle">Tente buscar por outro instrumento</div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="popular-searches">
                    <div className="popular-title">Buscas populares</div>
                    <div className="popular-tags">
                      {popularSearches.map((search, index) => (
                        <button
                          key={index}
                          className="popular-tag"
                          onClick={() => handleSuggestionClick(search)}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
        
        </div>
      </div>


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
    </main>
  )
}

export default MainSection 
