'use client'

import { useEffect, useState } from 'react'
import type { Screen, UserSummary } from '@/models/types'
import { fetchCurrentUser, logout as logoutRequest } from '@/services/authService'

/** Controla la navegación entre pantallas y la sesión del usuario. */
export function useSessionController() {
  const [screen, setScreen] = useState<Screen>('register')
  const [profileOpen, setProfileOpen] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null)

  const [authNotice, setAuthNotice] = useState('')

  const isAuth = screen === 'register' || screen === 'login'

  // Al abrir la app: si ya hay sesión, ir directo a los reportes.
  useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        if (user) {
          setCurrentUser(user)
          // Solo sale de las pantallas de acceso: una respuesta tardía no debe pisar la navegación.
          setScreen((current) => (current === 'register' || current === 'login' ? 'reports' : current))
        }
      })
      .catch(() => undefined)
  }, [])

  // En pantallas protegidas: validar sesión, si no, mostrar "sesión expirada".
  useEffect(() => {
    if (isAuth) return
    fetchCurrentUser()
      .then((user) => {
        if (!user) throw new Error()
        setCurrentUser(user)
      })
      .catch(() => {
        setSessionExpired(true)
        setScreen('login')
      })
  }, [isAuth])

  const navigate = (next: Screen) => {
    setScreen(next)
    setProfileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const expireSession = () => {
    setSessionExpired(true)
    navigate('login')
  }

  const logout = async () => {
    await logoutRequest()
    navigate('login')
  }

  return {
    screen,
    isAuth,
    navigate,
    profileOpen,
    setProfileOpen,
    sessionExpired,
    authNotice,
    setAuthNotice,
    expireSession,
    currentUser,
    logout,
  }
}
