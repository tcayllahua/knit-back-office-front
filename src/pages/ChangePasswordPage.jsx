import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'

export const ChangePasswordPage = () => {
  const navigate = useNavigate()
  const updatePassword = useAuthStore((state) => state.updatePassword)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await updatePassword(data.password)
      toast.success('Contraseña actualizada exitosamente')
      navigate('/perfil')
    } catch (error) {
      toast.error(error.message || 'Error al actualizar la contraseña')
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700, textAlign: 'center' }}>
          Cambiar contraseña
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Ingresa tu contraseña actual y elige una nueva contraseña segura
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600 }}>
              Seguridad de la cuenta
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
              CONTRASEÑA ACTUAL
            </Typography>

            <TextField
              {
                ...register('currentPassword', {
                  required: 'Contraseña actual es requerida',
                })
              }
              fullWidth
              label="Contraseña actual"
              type={showCurrentPassword ? 'text' : 'password'}
              size="small"
              margin="normal"
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end" size="small">
                      {showCurrentPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
              NUEVA CONTRASEÑA
            </Typography>

            <TextField
              {
                ...register('password', {
                  required: 'Nueva contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres',
                  },
                })
              }
              fullWidth
              label="Nueva contraseña"
              type={showPassword ? 'text' : 'password'}
              size="small"
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
              size="small"
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Divider sx={{ my: 3 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                sx={{ py: 1 }}
              >
                {isSubmitting ? 'Actualizando...' : 'Cambiar contraseña'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/perfil')}
                disabled={isSubmitting}
                sx={{ py: 1 }}
              >
                Cancelar
              </Button>
            </Stack>
          </Card>
        </form>
      </Box>
    </Box>
  )
}
