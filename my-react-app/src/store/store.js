import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import hospitalReducer from './slices/hospitalSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    hospital: hospitalReducer,
  },
})

export default store
