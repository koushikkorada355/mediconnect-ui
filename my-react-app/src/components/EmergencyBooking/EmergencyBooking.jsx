import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaAmbulance, FaHospital, FaClock } from 'react-icons/fa';
import './EmergencyBooking.css';

const EmergencyBooking = () => {
  const pathSteps = [
    {
      id: 1,
      icon: FaMapMarkerAlt,
      label: 'Your Location',
      description: 'Real-time GPS tracking',
    },
    {
      id: 2,
      icon: FaAmbulance,
      label: 'Nearest Hospital',
      description: 'AI-powered search',
    },
    {
      id: 3,
      icon: FaHospital,
      label: 'Emergency Care',
      description: 'Instant admission',
    },
    {
      id: 4,
      icon: FaClock,
      label: 'Treatment',
      description: 'Expert medical care',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section className="emergency-booking-section">
      {/* Background Decorations */}
      <div className="emergency-bg-decoration emergency-bg-1" />
      <div className="emergency-bg-decoration emergency-bg-2" />

      <div className="emergency-booking-wrapper">
        {/* Header */}
        <motion.div
          className="emergency-booking-header"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="emergency-booking-badge">
            <motion.div
              className="badge-icon"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaAmbulance size={18} />
            </motion.div>
            Emergency Services
          </div>
          <h2 className="emergency-booking-title">Get Emergency Care in Seconds</h2>
          <p className="emergency-booking-subtitle">
            From detection to treatment — a seamless path to life-saving care
          </p>
        </motion.div>

        {/* Path Steps */}
        <motion.div
          className="emergency-path-container"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {pathSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                className="emergency-path-step"
                variants={stepVariants}
              >
                {/* Connector Line */}
                {index < pathSteps.length - 1 && (
                  <motion.div
                    className="connector-line"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                  />
                )}

                {/* Step Circle */}
                <motion.div
                  className="step-circle"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="step-icon-wrapper">
                    <Icon className="step-icon" size={28} />
                  </div>
                  <span className="step-number">{index + 1}</span>
                </motion.div>

                {/* Step Content */}
                <motion.div
                  className="step-content"
                  whileHover={{ x: 8 }}
                >
                  <h3 className="step-label">{step.label}</h3>
                  <p className="step-description">{step.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="emergency-booking-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="emergency-cta-btn"
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaAmbulance size={20} />
            Start Emergency Navigation
          </motion.button>
          
        </motion.div>
      </div>
    </section>
  );
};

export default EmergencyBooking;
