// src/pages/HomePage.jsx
import Header from '../../componentes/layout/Header'
import MainSection from './MainSection'
import Footer from '../../componentes/layout/Footer'
import './HomePage.css'

function HomePage() {
  return (
    <div className="home-container">
      <Header />
      <MainSection />
      <Footer />
    </div>
  )
}

export default HomePage
