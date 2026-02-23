import React from 'react';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';
import EmergencyBooking from '../../components/EmergencyBooking/EmergencyBooking';
import Testimonials from '../../components/Testimonials/Testimonials';
import Stats from '../../components/Stats/Stats';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <Features />
      <EmergencyBooking />
      <Testimonials />
      <Stats />
    </div>
  );
};


export default Home;
