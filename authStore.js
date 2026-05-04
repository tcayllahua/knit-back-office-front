import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../config/supabase'
import logger from '../utils/logger'

/**
 * Ensures a Google OAuth user has a corresponding row in the public.users table.
 * Runs on every SIGNED_IN event; no-ops if the record already exists.
 */
const ensureGoogleUserRecord = async (authUser) => {
  if (authUser.app_metadata?.provider !== 'google') return

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id_auth', authUser.id)
    .maybeSingle()

  if (existing) return

  const meta = authUser.user_metadata || {}
  const firstName = meta.given_name || meta.full_name?.split(' ')?.[0] || 'Usuario'
  const lastName =
    meta.family_name || meta.full_name?.split(' ').slice(1).join(' ') || 'Google'

  const { data: defaultRole } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'usuario')
    .single()

  const { error } = await supabase.from('users').insert({
    id_auth: authUser.id,
    email: authUser.email,
    first_name: firstName,
    paternal_last_name: lastName,
    role_id: defaultRole?.id || null,
  })

  if (!error) {
    logger.info('Auth', `Usuario Google registrado en tabla users: ${authUser.email}`)
  } else {
    logger.error('Auth', 'Error al registrar usuario Google en tabla users', error)
  }
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,
      authenticated: false,
      userRole: null,

      setUser: (user) => set({ user, authenticated: !!user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      fetchUserRole: async (userId) => {
        try {
          logger.debug('Auth', `Obteniendo rol para userId: ${userId}`)
          const { data, error } = await supabase
            .from('users')
            .select('roles(name)')
            .eq('id_auth', userId)
            .single()
          if (error) {
            logger.warn('Auth', 'No se pudo obtener rol de usuario', error)
            return null
          }
          const role = data?.roles?.name || null
          logger.info('Auth', `Rol obtenido: ${role}`)
          return role
        } catch (err) {
          logger.error('Auth', 'Error inesperado al obtener rol', err)
          return null
        }
      },

      initializeAuth: async () => {
        try {
          set({ loading: true })
          logger.info('Auth', 'Inicializando autenticación...')

          // Listen for ongoing auth changes:
          // - SIGNED_IN  → fires after Google OAuth redirect (processes URL hash token)
          // - SIGNED_OUT → fires when the session expires or is revoked externally
          supabase.auth.onAuthStateChange(async (event, session) => {
            logger.debug('Auth', `Evento auth: ${event}`)

            if (event === 'SIGNED_IN' && session?.user) {
              await ensureGoogleUserRecord(session.user)
              const { data: userData } = await supabase
                .from('users')
                .select('roles(name)')
                .eq('id_auth', session.user.id)
                .single()
              const roleName = userData?.roles?.name || null
              set({ user: session.user, authenticated: true, userRole: roleName, loading: false })
              logger.info('Auth', `SIGNED_IN: ${session.user.email} (rol: ${roleName})`)
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, authenticated: false, userRole: null, loading: false })
              logger.info('Auth', 'Sesión cerrada por evento externo')
            }
          })

          // Also resolve the current session immediately (covers existing sessions
          // and Google OAuth tokens that Supabase processes from the URL hash).
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) throw error

          if (session?.user) {
            logger.info('Auth', `Sesión activa encontrada para: ${session.user.email}`)
            await ensureGoogleUserRecord(session.user)
            const { data: userData } = await supabase
              .from('users')
              .select('roles(name)')
              .eq('id_auth', session.user.id)
              .single()
            const roleName = userData?.roles?.name || null
            set({ user: session.user, authenticated: true, userRole: roleName })
            logger.info('Auth', `Usuario autenticado con rol: ${roleName}`)
          } else {
            logger.info('Auth', 'No hay sesión activa')
            set({ user: null, authenticated: false, userRole: null })
          }
        } catch (err) {
          logger.error('Auth', 'Error al inicializar autenticación', err)
          set({ error: err.message, user: null, authenticated: false, userRole: null })
        } finally {
          set({ loading: false })
        }
      },

      login: async (email, password) => {
        try {
          set({ loading: true, error: null })
          logger.info('Auth', `Intento de login: ${email}`)
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          const { data: userData } = await supabase
            .from('users')
            .select('roles(name)')
            .eq('id_auth', data.user.id)
            .single()
          const roleName = userData?.roles?.name || null

          set({ user: data.user, authenticated: true, userRole: roleName })
          logger.info('Auth', `Login exitoso: ${email} (rol: ${roleName})`)
          return data.user
        } catch (err) {
          const message = err.message || 'Error al iniciar sesión'
          logger.error('Auth', `Login fallido para ${email}`, err)
          set({ error: message })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ loading: true, error: null })
          logger.info('Auth', 'Intento de login con Google')
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin,
            },
          })

          if (error) throw error

          logger.info('Auth', 'Redireccionando a Google OAuth')
          return data
        } catch (err) {
          const message = err.message || 'Error al iniciar sesión con Google'
          logger.error('Auth', 'Login con Google fallido', err)
          set({ error: message })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      sendPasswordResetEmail: async (email) => {
        try {
          set({ loading: true, error: null })
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          if (error) throw error

          return true
        } catch (err) {
          const message = err.message || 'Error al enviar el correo de recuperación'
          set({ error: message })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      updatePassword: async (password) => {
        try {
          set({ loading: true, error: null })
          const { data, error } = await supabase.auth.updateUser({ password })

          if (error) throw error

          if (data?.user) {
            set({ user: data.user, authenticated: true })
          }

          return data.user
        } catch (err) {
          const message = err.message || 'Error al actualizar la contraseña'
          set({ error: message })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      register: async (email, password, userData) => {
        try {
          set({ loading: true, error: null })
          logger.info('Auth', `Registro de nuevo usuario: ${email}`)
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          })

          if (error) throw error

          // Get default role (usuario)
          const { data: defaultRole } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'usuario')
            .single()

          // Insert user data into users table
          const { error: insertError } = await supabase.from('users').insert({
            id_auth: data.user.id,
            email,
            first_name: userData.first_name,
            paternal_last_name: userData.paternal_last_name,
            maternal_last_name: userData.maternal_last_name || null,
            country: userData.country || null,
            country_code: userData.country_code || null,
            role_id: defaultRole?.id || null,
          })

          if (insertError) throw insertError

          logger.info('Auth', `Registro exitoso: ${email}`)
          return data.user
        } catch (err) {
          const message = err.message || 'Error al registrarse'
          logger.error('Auth', `Registro fallido para ${email}`, err)
          set({ error: message })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      logout: async () => {
        try {
          set({ loading: true, error: null })
          logger.info('Auth', 'Cerrando sesión...')
          const { error } = await supabase.auth.signOut()

          if (error) throw error

          set({ user: null, authenticated: false, userRole: null })
          logger.info('Auth', 'Sesión cerrada exitosamente')
        } catch (err) {
          logger.error('Auth', 'Error al cerrar sesión', err)
          set({ error: err.message })
          throw err
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        authenticated: state.authenticated,
        user: state.user,
        userRole: state.userRole,
      }),
    }
  )
)
