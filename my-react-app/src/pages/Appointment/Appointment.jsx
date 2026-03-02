import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiClock, FiMapPin, FiUser, FiMail, FiPhone, FiFileText,
  FiArrowLeft, FiCheckCircle, FiAlertCircle, FiLoader, FiDollarSign
} from 'react-icons/fi';
import {
  getAvailableSlots,
  bookAppointmentWithSlot,
  updateBookingData,
  selectSlot,
  nextBookingStep,
  prevBookingStep,
  resetBooking,
} from '../../store/slices/appointmentSlice';
import { getDoctorById } from '../../store/slices/doctorSlice';
import { getHospitalById } from '../../store/slices/hospitalSlice';
import {
  selectAppointment,
  selectAppointmentLoading,
  selectAppointmentError,
  selectAvailableSlots,
} from '../../store/selectors/appointmentSelectors';
import { selectIsLoggedIn } from '../../store/selectors/authSelectors';
import { selectDoctor } from '../../store/selectors/doctorSelectors';
import { selectHospital } from '../../store/selectors/hospitalSelectors';
import './Appointment.css';

const Appointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux State
  const appointment = useSelector(selectAppointment);
  const loading = useSelector(selectAppointmentLoading);
  const error = useSelector(selectAppointmentError);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const availableSlots = useSelector(selectAvailableSlots);
  const doctor = useSelector(selectDoctor);
  const hospital = useSelector(selectHospital);

  // Local State
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [medicalReason, setMedicalReason] = useState('');
  const [errors, setErrors] = useState({});

  // Fetch doctor data on mount
  useEffect(() => {
    if (doctorId) dispatch(getDoctorById(doctorId));
  }, [doctorId, dispatch]);

  // Auto-select first hospital when doctor loads
  useEffect(() => {
    if (doctor?.hospitals && doctor.hospitals.length > 0 && !selectedHospital) {
      setSelectedHospital(doctor.hospitals[0].hospitalId);
    }
  }, [doctor, selectedHospital]);

  // Fetch hospital data when hospital is selected
  useEffect(() => {
    if (selectedHospital) dispatch(getHospitalById(selectedHospital));
  }, [selectedHospital, dispatch]);

  // Fetch available slots when doctor, hospital and date are selected
  useEffect(() => {
    if (doctorId && selectedHospital && selectedDate) {
      dispatch(getAvailableSlots({
        doctorId,
        hospitalId: selectedHospital,
        date: selectedDate,
      }));
    }
  }, [doctorId, selectedHospital, selectedDate, dispatch]);

  // Reset booking on mount
  useEffect(() => {
    dispatch(resetBooking());
  }, [dispatch]);

  // Get consultation fee from the doctor-hospital mapping (returned by available-slots API)
  const getConsultationFee = () => {
    if (availableSlots?.consultationFee) return availableSlots.consultationFee;
    return 500; // Default fee
  };

  // Validate form
  const validateForm = (step) => {
    const newErrors = {};

    if (step >= 1) {
      if (!selectedHospital) newErrors.hospital = 'Please select a hospital';
      if (!selectedDate) newErrors.date = 'Please select a date';
      if (!selectedTime) newErrors.time = 'Please select a time slot';
    }

    if (step >= 2) {
      if (!medicalReason.trim()) {
        newErrors.medicalReason = 'Please describe your medical concern';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleReasonChange = (e) => {
    setMedicalReason(e.target.value);
    if (errors.medicalReason) {
      setErrors(prev => ({ ...prev, medicalReason: '' }));
    }
  };

  // Handle hospital selection
  const handleHospitalChange = (e) => {
    setSelectedHospital(e.target.value);
    setSelectedDate('');
    setSelectedTime('');
    if (errors.hospital) {
      setErrors(prev => ({ ...prev, hospital: '' }));
    }
  };

  // Handle date selection
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  // Handle time selection
  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    if (errors.time) {
      setErrors(prev => ({ ...prev, time: '' }));
    }
  };

  // Proceed to next step
  const handleNextStep = () => {
    if (validateForm(appointment.bookingStep)) {
      dispatch(nextBookingStep());
    }
  };

  // Go back to previous step
  const handlePrevStep = () => {
    dispatch(prevBookingStep());
  };

  // Submit booking
  const handleSubmit = async () => {
    if (!validateForm(2)) return;

    // selectedTime is already the ISO startTime from DoctorSchedule slot
    const bookingPayload = {
      doctorId,
      hospitalId: selectedHospital,
      slotTime: selectedTime,
      reason: medicalReason,
    };

    dispatch(bookAppointmentWithSlot(bookingPayload)).then((result) => {
      if (!result.payload?.error) {
        // Redirect to payment page with appointment ID
        navigate(`/payment/${result.payload.data._id}`);
      }
    });
  };

  // Format time from Date object to readable string
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Format time to 24hr for slotTime payload
  const formatTime24 = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString();
  };

  // Get time slots from DoctorSchedule via API
  const getTimeSlots = () => {
    if (!availableSlots?.slots || availableSlots.slots.length === 0) return [];
    return availableSlots.slots.map(slot => ({
      label: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
      value: slot.startTime,
    }));
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from today)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (!isLoggedIn) {
    return (
      <div className="apt">
        <div className="apt__container apt__error-state">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <FiAlertCircle />
          </motion.div>
          <h2>Please Login First</h2>
          <p>You need to be logged in to book an appointment.</p>
          <motion.button
            className="apt__btn apt__btn--primary"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go to Login
          </motion.button>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="apt">
        <div className="apt__container apt__error-state">
          <FiLoader className="apt__loading-spinner" />
          <p>Loading doctor information...</p>
        </div>
      </div>
    );
  }

  const consultationFee = getConsultationFee();
  const timeSlots = getTimeSlots();

  return (
    <div className="apt">
      <div className="apt__container">
        {/* Header */}
        <motion.div
          className="apt__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            className="apt__back-btn"
            onClick={() => navigate(`/doctor/${doctorId}`)}
          >
            <FiArrowLeft /> Back
          </button>
          <div>
            <h1>Book Appointment</h1>
            <p>with Dr. {doctor.userId?.name}</p>
          </div>
        </motion.div>

        <div className="apt__content">
          {/* Doctor & Hospital Info Card */}
          <motion.div
            className="apt__info-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="apt__doctor-info">
              <div className="apt__doctor-header">
                <h3>{doctor.userId?.name}</h3>
                <span className="apt__specialty">{doctor.specialty}</span>
              </div>
              <div className="apt__doctor-details">
                <p><FiFileText /> {doctor.experience || 5}+ years experience</p>
                <p><FiDollarSign /> Consultation Fee: ₹{consultationFee}</p>
              </div>
            </div>
          </motion.div>

          {/* Form Steps */}
          <motion.div
            className="apt__form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Step Indicator */}
            <div className="apt__step-indicator">
              {[1, 2].map(step => (
                <div
                  key={step}
                  className={`apt__step ${appointment.bookingStep >= step ? 'apt__step--active' : ''} ${appointment.bookingStep === step ? 'apt__step--current' : ''}`}
                >
                  <span className="apt__step-number">{step}</span>
                  <span className="apt__step-label">
                    {step === 1 ? 'Select Slot' : 'Medical Reason'}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 1: Slot Selection */}
            {appointment.bookingStep === 1 && (
              <motion.div
                className="apt__step-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2>Select Date & Time</h2>

                {/* Hospital Selection */}
                <div className="apt__form-group">
                  <label htmlFor="hospital">
                    <FiMapPin /> Select Hospital
                  </label>
                  <select
                    id="hospital"
                    value={selectedHospital}
                    onChange={handleHospitalChange}
                    className={`apt__form-select ${errors.hospital ? 'apt__form-select--error' : ''}`}
                  >
                    <option value="">Choose a hospital</option>
                    {doctor.hospitals?.map(h => (
                      <option key={h.hospitalId} value={h.hospitalId}>
                        {h.hospitalName} - {h.department}
                      </option>
                    ))}
                  </select>
                  {errors.hospital && <span className="apt__error">{errors.hospital}</span>}
                </div>

                {/* Date Selection */}
                <div className="apt__form-group">
                  <label htmlFor="date">
                    <FiCalendar /> Select Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className={`apt__form-input ${errors.date ? 'apt__form-input--error' : ''}`}
                  />
                  {errors.date && <span className="apt__error">{errors.date}</span>}
                </div>

                {/* Time Slot Selection */}
                <div className="apt__form-group">
                  <label htmlFor="time">
                    <FiClock /> Select Time Slot
                  </label>
                  {selectedDate && !loading && timeSlots.length === 0 && (
                    <p className="apt__no-slots">No available slots on this date. Doctor may not be available.</p>
                  )}
                  {loading && selectedDate && (
                    <p className="apt__loading-slots"><FiLoader className="apt__spinner" /> Loading slots...</p>
                  )}
                  <select
                    id="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    className={`apt__form-select ${errors.time ? 'apt__form-select--error' : ''}`}
                    disabled={timeSlots.length === 0}
                  >
                    <option value="">{timeSlots.length === 0 ? 'Select a date first' : 'Choose a time slot'}</option>
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                  {selectedDate && availableSlots?.availableSlots !== undefined && (
                    <p className="apt__slots-info">{availableSlots.availableSlots} of {availableSlots.totalSlots} slots available</p>
                  )}
                  {errors.time && <span className="apt__error">{errors.time}</span>}
                </div>

                {/* Hospital Details */}
                {selectedHospital && hospital && (
                  <motion.div
                    className="apt__hospital-details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h4>{hospital.name}</h4>
                    <p><FiMapPin /> {hospital.address}</p>
                    <p><FiPhone /> {hospital.phone}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Medical Reason */}
            {appointment.bookingStep === 2 && (
              <motion.div
                className="apt__step-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2>Medical Reason</h2>

                <div className="apt__form-group">
                  <label htmlFor="medicalReason">
                    <FiFileText /> Reason for Visit
                  </label>
                  <textarea
                    id="medicalReason"
                    value={medicalReason}
                    onChange={handleReasonChange}
                    rows="4"
                    className={`apt__form-textarea ${errors.medicalReason ? 'apt__form-textarea--error' : ''}`}
                    placeholder="Describe your medical concern or reason for visit..."
                  />
                  {errors.medicalReason && <span className="apt__error">{errors.medicalReason}</span>}
                </div>

                {/* Summary */}
                <motion.div
                  className="apt__summary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4>Appointment Summary</h4>
                  <div className="apt__summary-item">
                    <span>Doctor:</span>
                    <strong>Dr. {doctor.userId?.name}</strong>
                  </div>
                  <div className="apt__summary-item">
                    <span>Hospital:</span>
                    <strong>{hospital?.name || 'Selected Hospital'}</strong>
                  </div>
                  <div className="apt__summary-item">
                    <span>Date:</span>
                    <strong>{selectedDate || 'Not selected'}</strong>
                  </div>
                  <div className="apt__summary-item">
                    <span>Time:</span>
                    <strong>{selectedTime ? formatTime(selectedTime) : 'Not selected'}</strong>
                  </div>
                  <div className="apt__summary-item">
                    <span>Consultation Fee:</span>
                    <strong className="apt__fee">₹{consultationFee}</strong>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Error Alert */}
            {error && (
              <motion.div
                className="apt__alert apt__alert--error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FiAlertCircle />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="apt__buttons">
              {appointment.bookingStep === 2 && (
                <motion.button
                  className="apt__btn apt__btn--secondary"
                  onClick={handlePrevStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiArrowLeft /> Previous
                </motion.button>
              )}

              {appointment.bookingStep === 1 && (
                <motion.button
                  className="apt__btn apt__btn--primary"
                  onClick={handleNextStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  {loading ? <FiLoader className="apt__spinner" /> : 'Continue'}
                </motion.button>
              )}

              {appointment.bookingStep === 2 && (
                <motion.button
                  className="apt__btn apt__btn--primary"
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  {loading ? <FiLoader className="apt__spinner" /> : 'Proceed to Payment'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
