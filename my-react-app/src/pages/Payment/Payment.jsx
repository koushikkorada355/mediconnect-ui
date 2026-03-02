import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiLoader, FiCheckCircle, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import {
  getAppointmentById,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../../store/slices/appointmentSlice';
import {
  selectAppointment,
  selectAppointmentLoading,
  selectAppointmentError,
} from '../../store/selectors/appointmentSelectors';
import './Payment.css';

const Payment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const appointment = useSelector(selectAppointment);
  const loading = useSelector(selectAppointmentLoading);
  const error = useSelector(selectAppointmentError);

  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Fetch appointment details on mount
  useEffect(() => {
    if (appointmentId) {
      dispatch(getAppointmentById(appointmentId));
    }
  }, [appointmentId, dispatch]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePaymentClick = async () => {
    try {
      setRazorpayLoading(true);
      setPaymentError(null);

      // Step 1: Create Razorpay Order
      const orderResult = await dispatch(
        createRazorpayOrder({ appointmentId })
      );

      if (!orderResult.payload?.success) {
        setPaymentError(orderResult.payload?.message || 'Failed to create payment order');
        setRazorpayLoading(false);
        return;
      }

      const { orderId, amount, keyId } = orderResult.payload.data;

      // Step 2: Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        order_id: orderId,
        name: 'Hospital Finder',
        description: `Appointment Consultation - ₹${amount / 100}`,
        image: '/logo.png', // Add your logo path
        handler: async function (response) {
          // Step 3: Verify Payment
          try {
            const verifyResult = await dispatch(
              verifyRazorpayPayment({
                appointmentId,
                razorpayOrderId: orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
            );

            if (verifyResult.payload?.success) {
              // Payment successful
              navigate(`/appointment-success/${appointmentId}`);
            } else {
              setPaymentError(verifyResult.payload?.message || 'Payment verification failed');
            }
          } catch (err) {
            setPaymentError('Payment verification error: ' + err.message);
          }
        },
        prefill: {
          email: appointment?.patientId?.email || '',
          contact: appointment?.patientId?.phone || '',
        },
        notes: {
          appointmentId: appointmentId,
        },
        theme: {
          color: '#007bff',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle payment failure
      razorpay.on('payment.failed', function (response) {
        setPaymentError(`Payment failed: ${response.error.description}`);
      });

      setRazorpayLoading(false);
    } catch (err) {
      setPaymentError('Error: ' + err.message);
      setRazorpayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment">
        <div className="payment__container">
          <FiLoader className="payment__spinner" />
          <p>Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment || !appointment._id) {
    return (
      <div className="payment">
        <div className="payment__container payment__error-state">
          <FiAlertCircle className="payment__error-icon" />
          <h2>Appointment Not Found</h2>
          <p>Unable to load appointment details.</p>
          <motion.button
            className="payment__btn payment__btn--secondary"
            onClick={() => navigate('/doctors')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft /> Back to Doctors
          </motion.button>
        </div>
      </div>
    );
  }

  const consultationFee = appointment.consultationFee || 500;
  const platformFee = Math.round(consultationFee * 0.02); // 2% platform fee
  const totalAmount = consultationFee + platformFee;

  return (
    <div className="payment">
      <div className="payment__container">
        {/* Header */}
        <motion.div
          className="payment__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            className="payment__back-btn"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft /> Back
          </button>
          <h1>Complete Payment</h1>
        </motion.div>

        <div className="payment__content">
          {/* Order Summary */}
          <motion.div
            className="payment__summary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2>Order Summary</h2>

            <div className="payment__item">
              <span>Appointment ID</span>
              <strong>{appointmentId.substring(0, 12)}...</strong>
            </div>
            
            <div className="payment__item">
              <span>Consultation Fee</span>
              <strong>₹{consultationFee}</strong>
            </div>

            <div className="payment__item">
              <span>Platform Fee (2%)</span>
              <strong>₹{platformFee}</strong>
            </div>

            <div className="payment__divider"></div>

            <div className="payment__item payment__item--total">
              <span>Total Amount</span>
              <strong>₹{totalAmount}</strong>
            </div>

            <div className="payment__appointment-details">
              <h3>Appointment Details</h3>
              <div className="payment__detail-item">
                <span>Date & Time</span>
                <p>
                  {new Date(appointment.slotTime).toLocaleDateString()} at{' '}
                  {new Date(appointment.slotTime).toLocaleTimeString()}
                </p>
              </div>
              {appointment.reason && (
                <div className="payment__detail-item">
                  <span>Reason for Visit</span>
                  <p>{appointment.reason}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            className="payment__card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Payment Method</h2>

            {/* Error Alert */}
            {(error || paymentError) && (
              <motion.div
                className="payment__alert payment__alert--error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FiAlertCircle />
                <span>{paymentError || error}</span>
              </motion.div>
            )}

            <div className="payment__method">
              <div className="payment__method-icon">
                <img
                  src="https://www.razorpay.com/favicon.ico"
                  alt="Razorpay"
                />
              </div>
              <div className="payment__method-info">
                <h3>Pay with Razorpay</h3>
                <p>Secure payment via Credit Card, Debit Card, or UPI</p>
              </div>
            </div>

            <motion.button
              className="payment__btn payment__btn--primary payment__btn--large"
              onClick={handlePaymentClick}
              disabled={razorpayLoading || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {razorpayLoading ? (
                <>
                  <FiLoader className="payment__spinner-small" />
                  Processing...
                </>
              ) : (
                <>
                  <FiDollarSign /> Pay ₹{totalAmount}
                </>
              )}
            </motion.button>

            <p className="payment__secure-text">
              🔒 Your payment is secure and encrypted
            </p>

            <div className="payment__test-cards">
              <h4>Test Card Details</h4>
              <p>
                <strong>Card Number:</strong> 4111 1111 1111 1111
              </p>
              <p>
                <strong>Expiry:</strong> 12/25
              </p>
              <p>
                <strong>CVV:</strong> 123
              </p>
              <p className="payment__test-note">
                Use any OTP: 123456 for test payments
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
