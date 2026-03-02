// Appointment Selectors

export const selectAppointment = (state) => state.appointment;

export const selectAppointments = (state) => state.appointment.appointments;

export const selectCurrentAppointment = (state) => state.appointment.currentAppointment;

export const selectAvailableSlots = (state) => state.appointment.availableSlots;

export const selectSelectedSlot = (state) => state.appointment.selectedSlot;

export const selectBookingData = (state) => state.appointment.bookingData;

export const selectRazorpayOrderId = (state) => state.appointment.razorpayOrderId;

export const selectPaymentDetails = (state) => state.appointment.paymentDetails;

export const selectPaymentStatus = (state) => state.appointment.paymentStatus;

export const selectAppointmentLoading = (state) => state.appointment.loading;

export const selectPaymentLoading = (state) => state.appointment.paymentLoading;

export const selectAppointmentError = (state) => state.appointment.error;

export const selectAppointmentSuccess = (state) => state.appointment.successMessage;

export const selectBookingStep = (state) => state.appointment.bookingStep;

export const selectAppointmentStats = (state) => state.appointment.stats;
