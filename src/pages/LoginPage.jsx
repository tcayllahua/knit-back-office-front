import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Card,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { Visibility, VisibilityOff, Google } from '@mui/icons-material'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle)
  const sendPasswordResetEmail = useAuthStore((state) => state.sendPasswordResetEmail)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered-email')
    if (rememberedEmail) {
      setValue('email', rememberedEmail)
      setValue('rememberMe', true)
    }
  }, [setValue])

  useEffect(() => {
    setResetEmail(watch('email') || '')
  }, [watch])

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)

      if (data.rememberMe) {
        localStorage.setItem('remembered-email', data.email)
      } else {
        localStorage.removeItem('remembered-email')
      }

      toast.success('Sesión iniciada exitosamente')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión con Google')
    }
  }

  const handleSendResetEmail = async () => {
    if (!resetEmail) {
      toast.error('Ingresa tu email para recuperar la contraseña')
      return
    }

    try {
      setResetSubmitting(true)
      await sendPasswordResetEmail(resetEmail)
      toast.success('Te enviamos un correo para restablecer tu contraseña')
      setResetDialogOpen(false)
    } catch (error) {
      toast.error(error.message || 'Error al enviar el correo de recuperación')
    } finally {
      setResetSubmitting(false)
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
      <Container maxWidth="lg">
        <Card
          sx={{
            overflow: 'hidden',
            borderRadius: 4,
            boxShadow: '0 20px 45px rgba(0,0,0,0.12)',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
              minHeight: { md: 560 },
            }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 5 },
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background:
                  'linear-gradient(145deg, #0f4c81 0%, #1976d2 45%, #2e7d32 100%)',
              }}
            >
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.9 }}>
                  KNIT BACK OFFICE
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, mb: 2, fontWeight: 700, lineHeight: 1.1 }}>
                  Control total
                  <br />
                  de tus configuraciones
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 420, opacity: 0.95 }}>
                  Administra parámetros de máquina, tejido, materiales y simulaciones en un solo
                  lugar con trazabilidad por versión.
                </Typography>
              </Box>

              <Box sx={{ mt: 4, display: 'grid', gap: 1 }}>
                <Typography variant="body2">• Versionado automático de configuraciones</Typography>
                <Typography variant="body2">• Carga de archivos PDS e imágenes de simulación</Typography>
                <Typography variant="body2">• Historial centralizado para tu producción</Typography>
              </Box>
            </Box>

            <Box sx={{ p: { xs: 3, sm: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
                Iniciar Sesión
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ingresa para continuar con la gestión de tu planta de tejido.
              </Typography>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <TextField
                  {
                    ...register('email', {
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
                    ...register('password', {
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
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box
                  sx={{
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <FormControlLabel
                    control={<Checkbox {...register('rememberMe')} color="primary" />}
                    label="Recordarme"
                    sx={{ m: 0 }}
                  />

                  <Button
                    type="button"
                    variant="text"
                    size="small"
                    sx={{ textTransform: 'none', minWidth: 'auto', px: 0 }}
                    onClick={() => {
                      setResetEmail(watch('email') || '')
                      setResetDialogOpen(true)
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.2 }}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Cargando...' : 'Iniciar sesión'}
                </Button>

                <Divider sx={{ my: 2 }}>o</Divider>

                <Button
                  fullWidth
                  type="button"
                  variant="outlined"
                  startIcon={<Google />}
                  sx={{ py: 1.2 }}
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  Loguearte con Google
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2">
                  ¿No tienes cuenta?{' '}
                  <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 600 }}>
                    Regístrate aquí
                  </Link>
                </Typography>
              </Box>

              <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Recuperar contraseña</DialogTitle>
                <DialogContent>
                  <DialogContentText sx={{ mb: 2 }}>
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                  </DialogContentText>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    autoFocus
                  />
                </DialogContent>
                <DialogActions>
                  <Button type="button" onClick={() => setResetDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={handleSendResetEmail} disabled={resetSubmitting}>
                    {resetSubmitting ? 'Enviando...' : 'Enviar enlace'}
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  )
}
