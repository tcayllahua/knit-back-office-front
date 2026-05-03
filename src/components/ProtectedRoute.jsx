import { Navigate } from 'react-router-dom'
import { CircularProgress, Box, Typography } from '@mui/material'
import { useAuthStore } from '../store/authStore'
import { useGetUserPermissions } from '../hooks/queries'

export const ProtectedRoute = ({ children, requiredRoute }) => {
  const { authenticated, loading, user, userRole } = useAuthStore()
  const { data: permissionsData, isLoading: permissionsLoading } = useGetUserPermissions(user?.id)

  if (loading || permissionsLoading) {
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

  // If a specific route is required, check permissions
  if (requiredRoute && permissionsData?.permissions) {
    const hasAccess = permissionsData.permissions.some(
      (p) => p.route === requiredRoute && p.can_view
    )
    // Admin always has access
    if (!hasAccess && userRole !== 'admin') {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h5">Acceso denegado</Typography>
          <Typography color="text.secondary">
            No tienes permisos para acceder a esta sección.
          </Typography>
        </Box>
      )
    }
  }

  return children
}
