import { Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuthStore } from '../store/authStore'

export const ProtectedRoute = ({ children }) => {
  const { authenticated, loading, user } = useAuthStore()

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!authenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}
