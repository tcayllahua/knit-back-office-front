import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'

export const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const updatePassword = useAuthStore((state) => state.updatePassword)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await updatePassword(data.password)
      toast.success('Contraseña actualizada exitosamente')
      navigate('/login')
    } catch (error) {
      toast.error(error.message || 'Error al actualizar la contraseña')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 3, md: 6 },
        background:
          'radial-gradient(circle at 10% 20%, rgba(25, 118, 210, 0.18) 0%, rgba(25, 118, 210, 0) 40%), radial-gradient(circle at 90% 80%, rgba(46, 125, 50, 0.15) 0%, rgba(46, 125, 50, 0) 40%)',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, boxShadow: '0 20px 45px rgba(0,0,0,0.12)' }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
            Restablecer contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              {
                ...register('password', {
                  required: 'Contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres',
                  },
                })
              }
              fullWidth
              label="Nueva contraseña"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {
                ...register('confirmPassword', {
                  required: 'Confirmación de contraseña es requerida',
                  validate: (value) => value === password || 'Las contraseñas no coinciden',
                })
              }
              fullWidth
              label="Confirmar nueva contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button fullWidth variant="contained" sx={{ mt: 3, py: 1.2 }} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </Card>
      </Container>
    </Box>
  )
}