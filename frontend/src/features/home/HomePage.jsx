// src/pages/HomePage.jsx
import './HomePage.css'
import Header from '../../componentes/layout/Header'
import MainSection from './MainSection'
import Footer from '../../componentes/layout/Footer'
import TeacherList from './TeacherList'
import ButtonChat from '../../componentes/layout/ButtonChat'



function HomePage() {
  return (
    <div className="home-container">
      <Header />
      <MainSection />
      <TeacherList/>
      <ButtonChat />
      <Footer />
    </div>
  )
}

export default HomePage
