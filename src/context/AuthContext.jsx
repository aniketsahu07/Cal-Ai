/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider, hasFirebaseConfig } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
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
      setError(err?.message || 'Google sign-in failed.')
      throw err
    }
  }

  const signOutUser = async () => {
    setError('')
    try {
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
