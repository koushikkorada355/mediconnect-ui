import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import hospitalReducer from './slices/hospitalSlice'
import doctorReducer from './slices/doctorSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    hospital: hospitalReducer,
    doctor: doctorReducer,
  },
})

export default store
