import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('patient');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      console.log('SignUp successful:', { userRole, ...formData });
      setIsLoading(false);
      navigate('/login');
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const roles = [
    { key: 'patient', label: 'Patient' },
    { key: 'doctor', label: 'Doctor' },
    { key: 'hospitaladmin', label: 'Hospital Admin' },
  ];

  return (
    <div className="auth-container">
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      <motion.div
        className="auth-box"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Close button */}
        <motion.button
          onClick={() => navigate('/')}
          className="close-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          ✕
        </motion.button>

        <motion.div className="auth-header" variants={itemVariants}>
          <h2>Create Account</h2>
          <p>Choose your role and get started</p>
        </motion.div>

        <motion.div className="role-selector" variants={itemVariants}>
          <p className="role-label">Sign up as:</p>
          <div className="role-options">
            {roles.map((role) => (
              <button
                key={role.key}
                type="button"
                className={`role-btn ${userRole === role.key ? 'active' : ''}`}
                onClick={() => setUserRole(role.key)}
              >
                {role.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.form onSubmit={handleSubmit} variants={itemVariants}>
          <div className="form-row">
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className={errors.firstName ? 'input-error' : ''}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={errors.lastName ? 'input-error' : ''}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </motion.div>
          </div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </motion.div>

          <div className="form-row">
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={errors.password ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="confirmPassword">Confirm</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </motion.div>
          </div>

          <motion.div className="form-group checkbox-group" variants={itemVariants}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <span>
                I agree to the <Link to="#">Terms & Privacy</Link>
              </span>
            </label>
            {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
          </motion.div>

          <motion.button
            type="submit"
            className="auth-btn"
            disabled={isLoading}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </motion.button>
        </motion.form>

        <motion.div className="auth-footer" variants={itemVariants}>
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUp;
