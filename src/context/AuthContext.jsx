/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider, hasFirebaseConfig } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedDemoUser = localStorage.getItem('calai_demo_user')
    if (storedDemoUser) {
      try {
        return JSON.parse(storedDemoUser)
      } catch {
        localStorage.removeItem('calai_demo_user')
      }
    }
    return null
  })
  const [loading, setLoading] = useState(() => {
    const storedDemoUser = localStorage.getItem('calai_demo_user')
    return !storedDemoUser
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      // If demo user is active in state/localStorage, do not overwrite it with null
      if (localStorage.getItem('calai_demo_user')) return
      
      setUser(nextUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!hasFirebaseConfig) {
      setError('Firebase configuration is missing.')
      return null
    }

    setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (err) {
      let friendlyError = err?.message || 'Google sign-in failed.'
      // Provide actionable feedback for sessionStorage / mobile webview blocks
      if (
        friendlyError.includes('storage') || 
        friendlyError.includes('sessionStorage') || 
        friendlyError.includes('initial state') ||
        friendlyError.includes('popup')
      ) {
        friendlyError = 'Google Sign-in was blocked by your browser\'s security settings (sessionStorage/cookies). Please try "Continue in Demo Mode" below to access the full app instantly!'
      }
      setError(friendlyError)
      throw err
    }
  }

  const signInWithDemo = () => {
    setError('')
    const demoUser = {
      uid: 'demo-user-id',
      displayName: 'Beta Tester',
      email: 'tester@calai.app',
      photoURL: '',
      isDemo: true
    }
    localStorage.setItem('calai_demo_user', JSON.stringify(demoUser))
    setUser(demoUser)
    return demoUser
  }

  const signOutUser = async () => {
    setError('')
    try {
      localStorage.removeItem('calai_demo_user')
      setUser(null)
      await signOut(auth)
    } catch (err) {
      setError(err?.message || 'Sign out failed.')
      throw err
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signInWithGoogle,
      signInWithDemo,
      signOutUser,
      hasFirebaseConfig,
    }),
    [user, loading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

