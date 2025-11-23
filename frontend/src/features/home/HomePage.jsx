// src/pages/HomePage.jsx
import './HomePage.css'
import Header from '../../componentes/layout/Header'
import MainSection from './MainSection'
import Footer from '../../componentes/layout/Footer'
import TeacherList from './TeacherList'



function HomePage() {
  return (
    <div className="home-container">
      <Header />
      <MainSection />
      <TeacherList/>
      <Footer />
    </div>
  )
}

export default HomePage
