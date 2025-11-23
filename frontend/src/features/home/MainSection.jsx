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
  { nome: "Teclado", img: tecladoImg },
  { nome: "Guitarra", img: guitarraImg },
  { nome: "Contrabaixo", img: baixoImg },
  { nome: "Violão", img: violaoImg },
  { nome: "Violino", img: violinoImg },
  { nome: "Saxofone", img: saxofoneImg },
  { nome: "Canto", img: cantoImg },
]

function MainSection() {
  // duplicamos o array para ajudar no loop infinito
  const instrumentos = [...instrumentosBase, ...instrumentosBase]
  const baseLen = instrumentosBase.length

  // index inicia no começo da segunda metade para que possamos "rolar" para frente e voltar sem pulo
  const [index, setIndex] = useState(baseLen)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const innerRef = useRef(null)

  // largura de cada card (incluindo gap). Ajuste se modificar CSS
  const CARD_WIDTH = 140 // px (min-width + margin)
  const GAP = 20 // px (gap between cards)

  // calcular deslocamento em px
  const getTranslateX = () => {
    // queremos deslocar de acordo com o index (a partir do início do array duplicado)
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

  // quando a transição termina, ajustamos o index se estivermos nas extremidades
  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    function handleTransitionEnd() {
      // se chegamos ao final da segunda metade (index >= baseLen * 2), voltamos para a metade equivalente sem transition
      if (index >= baseLen * 2) {
        setIsTransitioning(false)
        setIndex((prev) => prev - baseLen)
      }
      // se chegamos antes da primeira metade (index < baseLen), pulamos para a segunda metade equivalente sem transition
      if (index < baseLen) {
        setIsTransitioning(false)
        setIndex((prev) => prev + baseLen)
      }
    }

    el.addEventListener('transitionend', handleTransitionEnd)
    return () => el.removeEventListener('transitionend', handleTransitionEnd)
  }, [index, baseLen])

  // quando desligamos a transição (reset instantâneo), react precisa reaplicar a posição sem animação,
  // então usamos um pequeno efeito para reativar a transição em seguida
  useEffect(() => {
    if (!isTransitioning) {
      // força repaint antes de reativar transição
      requestAnimationFrame(() => {
        setTimeout(() => setIsTransitioning(true), 20)
      })
    }
  }, [isTransitioning])

  return (
    <main className="main-section">
      <h2>Dê um passo a mais no seu aprendizado com o Melofy</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder='Busque “Guitarra”'
          className="search-input"
        />
        <button className="search-button">Pesquisar</button>
      </div>

      <div className="carousel-wrapper">
        <button className="arrow-btn left" onClick={previous} aria-label="Anterior">
          &#8249;
        </button>

        <div className="carousel-viewport">
          <div
            className="carousel-inner"
            ref={innerRef}
            style={{
              transform: `translateX(${getTranslateX()}px)`,
              transition: isTransitioning ? 'transform 400ms ease' : 'none',
            }}
          >
            {instrumentos.map((item, i) => (
              <button key={i} className="instrument-card">
                <img src={item.img} alt={item.nome} className="instrument-img" />
                <span>{item.nome}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="arrow-btn right" onClick={next} aria-label="Próximo">
          &#8250;
        </button>
      </div>
    </main>
  )
}

export default MainSection
