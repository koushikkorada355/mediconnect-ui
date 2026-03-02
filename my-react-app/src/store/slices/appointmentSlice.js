import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/apiClient'

// ============ ASYNC THUNKS ============

// GET ALL APPOINTMENTS FOR PATIENT
export const getMyAppointments = createAsyncThunk(
  'appointment/getMyAppointments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/appointments', { params: filters })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments')
    }
  }
)

// GET APPOINTMENT BY ID
export const getAppointmentById = createAsyncThunk(
  'appointment/getAppointmentById',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment')
    }
  }
)

// GET AVAILABLE SLOTS FOR DOCTOR & HOSPITAL ON A SPECIFIC DATE
export const getAvailableSlots = createAsyncThunk(
  'appointment/getAvailableSlots',
  async ({ doctorId, hospitalId, date }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/appointments/available-slots', {
        params: { doctorId, hospitalId, date }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available slots')
    }
  }
)

// BOOK APPOINTMENT WITH SLOT
export const bookAppointmentWithSlot = createAsyncThunk(
  'appointment/bookAppointmentWithSlot',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/appointments/book-with-slot', bookingData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book appointment')
    }
  }
)

// CREATE RAZORPAY ORDER
export const createRazorpayOrder = createAsyncThunk(
  'appointment/createRazorpayOrder',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/appointments/${appointmentId}/create-order`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment order')
    }
  }
)

// VERIFY RAZORPAY PAYMENT
export const verifyRazorpayPayment = createAsyncThunk(
  'appointment/verifyRazorpayPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/appointments/verify-payment', paymentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment')
    }
  }
)

// GET PAYMENT DETAILS
export const getPaymentDetails = createAsyncThunk(
  'appointment/getPaymentDetails',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/appointments/payment/${paymentId}/details`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment details')
    }
  }
)

// CANCEL APPOINTMENT
export const cancelAppointment = createAsyncThunk(
  'appointment/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/cancel`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment')
    }
  }
)

// GET APPOINTMENT STATISTICS
export const getAppointmentStats = createAsyncThunk(
  'appointment/getAppointmentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/appointments/stats/overview')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics')
    }
  }
)

// ============ SLICE ============

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState: {
    // List and Details
    appointments: [],
    currentAppointment: null,
    
    // Booking State
    availableSlots: [],
    selectedSlot: null,
    bookingData: {
      doctorId: null,
      hospitalId: null,
      medicalReason: '',
    },
    
    // Payment State
    razorpayOrderId: null,
    paymentDetails: null,
    paymentStatus: null, // PENDING, CONFIRMED, COMPLETED, FAILED
    
    // UI State
    loading: false,
    paymentLoading: false,
    error: null,
    successMessage: null,
    bookingStep: 1, // 1: Select slot, 2: Enter details, 3: Payment
    
    // Statistics
    stats: null,
  },
  
  reducers: {
    // Clear error/success messages
    clearAppointmentError: (state) => {
      state.error = null
    },
    clearAppointmentSuccess: (state) => {
      state.successMessage = null
    },
    
    // Reset booking state
    resetBooking: (state) => {
      state.selectedSlot = null
      state.bookingData = {
        doctorId: null,
        hospitalId: null,
        medicalReason: '',
      }
      state.razorpayOrderId = null
      state.paymentStatus = null
      state.bookingStep = 1
    },
    
    // Update booking data
    updateBookingData: (state, action) => {
      state.bookingData = { ...state.bookingData, ...action.payload }
    },
    
    // Select a slot
    selectSlot: (state, action) => {
      state.selectedSlot = action.payload
    },
    
    // Move to next booking step
    nextBookingStep: (state) => {
      if (state.bookingStep < 3) state.bookingStep += 1
    },
    
    // Move to previous booking step
    prevBookingStep: (state) => {
      if (state.bookingStep > 1) state.bookingStep -= 1
    },
    
    // Set payment status (for optimistic updates)
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload
    },
    
    // Clear appointment detail
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null
    },
  },
  
  extraReducers: (builder) => {
    builder
      // ---- GET MY APPOINTMENTS ----
      .addCase(getMyAppointments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyAppointments.fulfilled, (state, action) => {
        state.loading = false
        state.appointments = action.payload.data || []
      })
      .addCase(getMyAppointments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ---- GET APPOINTMENT BY ID ----
      .addCase(getAppointmentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAppointmentById.fulfilled, (state, action) => {
        state.loading = false
        state.currentAppointment = action.payload.data
      })
      .addCase(getAppointmentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ---- GET AVAILABLE SLOTS ----
      .addCase(getAvailableSlots.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.loading = false
        state.availableSlots = action.payload.data || []
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ---- BOOK APPOINTMENT WITH SLOT ----
      .addCase(bookAppointmentWithSlot.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bookAppointmentWithSlot.fulfilled, (state, action) => {
        state.loading = false
        state.currentAppointment = action.payload.data
        state.paymentStatus = action.payload.data.paymentStatus
        state.successMessage = 'Appointment booked! Proceeding to payment...'
      })
      .addCase(bookAppointmentWithSlot.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ---- CREATE RAZORPAY ORDER ----
      .addCase(createRazorpayOrder.pending, (state) => {
        state.paymentLoading = true
        state.error = null
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.paymentLoading = false
        state.razorpayOrderId = action.payload.data.orderId
        state.successMessage = 'Payment order created'
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.paymentLoading = false
        state.error = action.payload
      })

      // ---- VERIFY RAZORPAY PAYMENT ----
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.paymentLoading = true
        state.error = null
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.paymentLoading = false
        state.paymentStatus = 'CONFIRMED'
        state.currentAppointment = action.payload.data
        state.successMessage = 'Payment verified! Appointment confirmed.'
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.paymentLoading = false
        state.paymentStatus = 'FAILED'
        state.error = action.payload
      })

      // ---- GET PAYMENT DETAILS ----
      .addCase(getPaymentDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.loading = false
        state.paymentDetails = action.payload.data
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ---- CANCEL APPOINTMENT ----
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false
        state.currentAppointment = action.payload.data
        state.successMessage = 'Appointment cancelled successfully'
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ---- GET APPOINTMENT STATS ----
      .addCase(getAppointmentStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAppointmentStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.data
      })
      .addCase(getAppointmentStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  clearAppointmentError,
  clearAppointmentSuccess,
  resetBooking,
  updateBookingData,
  selectSlot,
  nextBookingStep,
  prevBookingStep,
  setPaymentStatus,
  clearCurrentAppointment,
} = appointmentSlice.actions

export default appointmentSlice.reducer
