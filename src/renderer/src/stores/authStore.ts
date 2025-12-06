import { create } from 'zustand'

interface User {
  userId: number
  username: string
  role: string
  teacherId?: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    const result = await window.electronAPI.auth.login(username, password)

    if (!result.success) {
      throw new Error(result.error || 'Login failed')
    }

    set({ user: result.data, isAuthenticated: true })
  },

  logout: async () => {
    await window.electronAPI.auth.logout()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    const result = await window.electronAPI.auth.getCurrentUser()

    if (result.success && result.data) {
      set({ user: result.data, isAuthenticated: true })
    } else {
      set({ user: null, isAuthenticated: false })
    }
  }
}))
