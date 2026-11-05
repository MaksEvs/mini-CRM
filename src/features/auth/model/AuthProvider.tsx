import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from './authContext'
import { supabase } from '../../../shared/api/supabase'
import type { Profile } from '../../../shared/api/database.types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  async function refreshProfile(): Promise<void> {
    if (!supabase || !session) {
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()

    setProfile(data)
  }

  useEffect(() => {
    if (!supabase) {
      return
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)

        if (!data.session) {
          setProfile(null)
          setLoading(false)
        }
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession)
        if (!nextSession) {
          setProfile(null)
          setLoading(false)
        } else {
          setLoading(true)
        }
      }
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadProfile(): Promise<void> {
      if (!supabase || !session) {
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (active) {
        setProfile(data)
        setLoading(false)
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [loading, session])

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
