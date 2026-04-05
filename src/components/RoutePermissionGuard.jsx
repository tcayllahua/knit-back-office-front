import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGetUserPermissions } from '../hooks/queries'

export const RoutePermissionGuard = ({ route, children }) => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const userRole = useAuthStore((state) => state.userRole)
  const { data: permissionsData } = useGetUserPermissions(user?.id)

  // Admin always has access
  if (userRole === 'admin') return children

  // If permissions not loaded yet, render children (ProtectedRoute handles loading)
  if (!permissionsData?.permissions) return children

  const hasAccess = permissionsData.permissions.some(
    (p) => p.ruta === route && p.puede_ver
  )

  if (!hasAccess) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Acceso denegado
        </Typography>
        <Typography color="text.secondary">
          No tienes permisos para acceder a esta sección.
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </Box>
    )
  }

  return children
}
