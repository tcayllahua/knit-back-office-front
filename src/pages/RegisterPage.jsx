import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Card,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material'
import { Visibility, VisibilityOff, Google } from '@mui/icons-material'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle)
  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await register(data.email, data.password, {
        nombre: data.nombre,
        apellido: data.apellido,
      })
      toast.success('Cuenta creada exitosamente. Por favor inicia sesión.')
      navigate('/login')
    } catch (error) {
      toast.error(error.message || 'Error al registrarse')
    }
  }

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      toast.error(error.message || 'Error al registrarse con Google')
    }
  }

  return (
    <Container maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh', py: 4 }}>
      <Card sx={{ width: '100%', p: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
          Registrarse
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            {
              ...registerField('nombre', {
                required: 'Nombre es requerido',
                minLength: {
                  value: 3,
                  message: 'Mínimo 3 caracteres',
                },
              })
            }
            fullWidth
            label="Nombre"
            margin="normal"
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
          />

          <TextField
            {
              ...registerField('apellido', {
                required: 'Apellido es requerido',
                minLength: {
                  value: 3,
                  message: 'Mínimo 3 caracteres',
                },
              })
            }
            fullWidth
            label="Apellido"
            margin="normal"
            error={!!errors.apellido}
            helperText={errors.apellido?.message}
          />

          <TextField
            {
              ...registerField('email', {
                required: 'Email es requerido',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email inválido',
                },
              })
            }
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            {
              ...registerField('password', {
                required: 'Contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'Mínimo 6 caracteres',
                },
              })
            }
            fullWidth
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            {
              ...registerField('confirmPassword', {
                required: 'Confirmación de contraseña es requerida',
                validate: (value) => value === password || 'Las contraseñas no coinciden',
              })
            }
            fullWidth
            label="Confirmar Contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </Button>

          <Divider sx={{ my: 2 }}>o</Divider>

          <Button
            fullWidth
            type="button"
            variant="outlined"
            startIcon={<Google />}
            sx={{ mb: 2 }}
            onClick={handleGoogleRegister}
            disabled={isSubmitting}
          >
            Registrarte con Google
          </Button>
        </form>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
              Inicia sesión aquí
            </Link>
          </Typography>
        </Box>
      </Card>
    </Container>
  )
}
