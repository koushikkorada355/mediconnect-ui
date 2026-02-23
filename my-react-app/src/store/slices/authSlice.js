import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoggedIn: false,
  user: null,
  token: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isLoggedIn = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.loading = false
      state.error = null
    },
    logout: (state) => {
      state.isLoggedIn = false
      state.user = null
      state.token = null
      state.loading = false
      state.error = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    signupSuccess: (state, action) => {
      state.isLoggedIn = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.loading = false
      state.error = null
    },
  },
})

export const { loginSuccess, logout, setLoading, setError, signupSuccess } = authSlice.actions
export default authSlice.reducer
