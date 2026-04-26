import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Toaster } from 'sonner'
import { QueryClient } from '@tanstack/react-query'
import { lightTheme, darkTheme } from './theme'
import { router } from './router'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

// Create QueryClient outside of component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const darkMode = useThemeStore((state) => state.darkMode)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const theme = darkMode ? darkTheme : lightTheme

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          richColors
          duration={3000}
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
