import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../config/supabase'

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
          const { data, error } = await supabase
            .from('usuarios')
            .select('roles(nombre)')
            .eq('id_auth', userId)
            .single()
          if (error) return null
          return data?.roles?.nombre || null
        } catch {
          return null
        }
      },

      initializeAuth: async () => {
        try {
          set({ loading: true })
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) throw error

          if (session?.user) {
            const { data: userData } = await supabase
              .from('usuarios')
              .select('roles(nombre)')
              .eq('id_auth', session.user.id)
              .single()
            const roleName = userData?.roles?.nombre || null
            set({ user: session.user, authenticated: true, userRole: roleName })
          } else {
            set({ user: null, authenticated: false, userRole: null })
          }
        } catch (err) {
          set({ error: err.message, user: null, authenticated: false, userRole: null })
        } finally {
          set({ loading: false })
        }
      },

      login: async (email, password) => {
        try {
          set({ loading: true, error: null })
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          const { data: userData } = await supabase
            .from('usuarios')
            .select('roles(nombre)')
            .eq('id_auth', data.user.id)
            .single()
          const roleName = userData?.roles?.nombre || null

          set({ user: data.user, authenticated: true, userRole: roleName })
          return data.user
        } catch (err) {
          const message = err.message || 'Error al iniciar sesión'
          set({ error: message })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ loading: true, error: null })
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin,
            },
          })

          if (error) throw error

          return data
        } catch (err) {
          const message = err.message || 'Error al iniciar sesión con Google'
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
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          })

          if (error) throw error

          // Get default role (usuario)
          const { data: defaultRole } = await supabase
            .from('roles')
            .select('id')
            .eq('nombre', 'usuario')
            .single()

          // Insert user data into usuarios table
          const { error: insertError } = await supabase.from('usuarios').insert({
            id_auth: data.user.id,
            email,
            nombre: userData.nombre,
            apellido: userData.apellido,
            rol_id: defaultRole?.id || null,
          })

          if (insertError) throw insertError

          return data.user
        } catch (err) {
          const message = err.message || 'Error al registrarse'
          set({ error: message })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      logout: async () => {
        try {
          set({ loading: true, error: null })
          const { error } = await supabase.auth.signOut()

          if (error) throw error

          set({ user: null, authenticated: false, userRole: null })
        } catch (err) {
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
