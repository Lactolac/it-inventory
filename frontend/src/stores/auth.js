import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.nombre || '')
  const userGroups = computed(() => user.value?.groups || [])
  const isAdmin = computed(() => 
    userGroups.value.includes('AdminInv') || 
    userGroups.value.includes('it')
  )

  async function login(credentials) {
    try {
      const response = await authApi.login(credentials)
      const { token: newToken, user: userData } = response.data.data
      
      token.value = newToken
      user.value = userData
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      return { success: false, message }
    }
  }

  async function verifyToken() {
    try {
      const response = await authApi.verify()
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(response.data.data))
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    user,
    token,
    isAuthenticated,
    userName,
    userGroups,
    isAdmin,
    login,
    verifyToken,
    logout
  }
})
