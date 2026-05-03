import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
  Autocomplete,
} from '@mui/material'
import { Visibility, VisibilityOff, Google } from '@mui/icons-material'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'
import countries from 'i18n-iso-countries'
import esLocale from 'i18n-iso-countries/langs/es.json'

countries.registerLocale(esLocale)

const COUNTRY_LIST = Object.entries(countries.getNames('es', { select: 'official' }))
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))

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
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      first_name: '',
      paternal_last_name: '',
      maternal_last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: null,
    },
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await register(data.email, data.password, {
        first_name: data.first_name,
        paternal_last_name: data.paternal_last_name,
        maternal_last_name: data.maternal_last_name || '',
        country: data.country?.name || '',
        country_code: data.country?.code || '',
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
              ...registerField('first_name', {
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
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
          />

          <TextField
            {
              ...registerField('paternal_last_name', {
                required: 'Apellido paterno es requerido',
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres',
                },
              })
            }
            fullWidth
            label="Apellido Paterno"
            margin="normal"
            error={!!errors.paternal_last_name}
            helperText={errors.paternal_last_name?.message}
          />

          <TextField
            {
              ...registerField('maternal_last_name')
            }
            fullWidth
            label="Apellido Materno"
            margin="normal"
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
                validate: (value) => {
                  if (value.length >= 15) return true
                  if (value.length >= 8 && /[a-z]/.test(value) && /[0-9]/.test(value)) return true
                  return 'Debe tener al menos 15 caracteres, o al menos 8 caracteres incluyendo un número y una letra minúscula'
                },
              })
            }
            fullWidth
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message || 'Al menos 15 caracteres, o al menos 8 caracteres incluyendo un número y una letra minúscula.'}
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

          <Controller
            name="country"
            control={control}
            rules={{ required: 'País es requerido' }}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                options={COUNTRY_LIST}
                getOptionLabel={(option) => option.name}
                value={value}
                onChange={(_, newValue) => onChange(newValue)}
                isOptionEqualToValue={(option, val) => option.code === val.code}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="País"
                    margin="normal"
                    error={!!errors.country}
                    helperText={errors.country?.message}
                  />
                )}
              />
            )}
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
