import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import SignUp from './pages/SignUp/SignUp'
import Hospitals from './pages/Hospitals/Hospitals'
import './App.css'

const App = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="app">
      {!hideNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<div className="p-6 text-center">Find Doctors (Coming Soon)</div>} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </main>
      {!hideNavbar && <Footer />}
    </div>
  )
}


const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default AppWrapper
