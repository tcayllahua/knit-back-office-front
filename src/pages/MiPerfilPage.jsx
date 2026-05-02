import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  Card,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Typography,
  Grid,
  Divider,
  IconButton,
  Stack,
  Badge,
  Autocomplete,
  Chip,
} from '@mui/material'
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'
import { useGetUserProfile } from '../hooks/queries'
import { useUpdateUserProfileMutation } from '../hooks/mutations'
import countries from 'i18n-iso-countries'
import esLocale from 'i18n-iso-countries/langs/es.json'

countries.registerLocale(esLocale)

const COUNTRY_LIST = Object.entries(countries.getNames('es', { select: 'official' }))
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))

export const MiPerfilPage = () => {
  const user = useAuthStore((state) => state.user)
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const { data: profile, isLoading: isProfileLoading } = useGetUserProfile(user?.id)
  const updateMutation = useUpdateUserProfileMutation(user?.id)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: '',
      country: null,
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        telefono: profile.telefono || '',
        direccion: profile.direccion || '',
        country: profile.country_code
          ? COUNTRY_LIST.find(c => c.code === profile.country_code) || null
          : null,
      })
      if (profile.foto_perfil) {
        setImagePreview(profile.foto_perfil)
      }
    }
  }, [profile, reset])

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({
        profileData: {
          ...data,
          country: data.country?.name || '',
          country_code: data.country?.code || '',
        },
        profileImage: profileImage || undefined,
      })
      setProfileImage(null)
    } catch (error) {
      toast.error(error.message || 'Error al actualizar perfil')
    }
  }

  if (isProfileLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const isLoading = isSubmitting || updateMutation.isPending

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700, textAlign: 'center' }}>
          Mi Perfil
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Gestiona tu información personal y preferencias
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Avatar Section Card */}
          <Card sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600 }}>
              Foto de Perfil
            </Typography>

            <input
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="avatar-input"
              type="file"
            />

            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={
                <label htmlFor="avatar-input">
                  <IconButton
                    aria-label="upload picture"
                    component="span"
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </label>
              }
            >
              <Avatar
                src={imagePreview || profile?.foto_perfil}
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  fontSize: '2rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {profile?.nombre?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </Badge>

            {profileImage && (
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'success.main' }}>
                ✓ {profileImage.name} seleccionada
              </Typography>
            )}
          </Card>

          {/* Information Section */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600 }}>
              Información Personal
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Read-only Fields */}
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
              DATOS DE ACCESO
            </Typography>

            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              disabled
              size="small"
              margin="normal"
              helperText="No editable"
            />

            {profile?.roles?.nombre && (
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Rol
                </Typography>
                <Chip
                  label={profile.roles.nombre.charAt(0).toUpperCase() + profile.roles.nombre.slice(1)}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}

            {profile?.fecha_registro && (
              <TextField
                fullWidth
                label="Miembro desde"
                value={(() => {
                  const [y, m, d] = profile.fecha_registro.slice(0, 10).split('-')
                  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
                  return `${Number(d)} de ${months[Number(m) - 1]} de ${y}`
                })()}
                disabled
                size="small"
                margin="normal"
                helperText="No editable"
              />
            )}

            <Divider sx={{ my: 3 }} />

            {/* Editable Fields */}
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
              DATOS BÁSICOS
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  {
                    ...register('nombre', {
                      required: 'Nombre es requerido',
                      minLength: {
                        value: 3,
                        message: 'Mínimo 3 caracteres',
                      },
                    })
                  }
                  fullWidth
                  label="Nombre"
                  size="small"
                  margin="normal"
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {
                    ...register('apellido', {
                      required: 'Apellido es requerido',
                      minLength: {
                        value: 3,
                        message: 'Mínimo 3 caracteres',
                      },
                    })
                  }
                  fullWidth
                  label="Apellido"
                  size="small"
                  margin="normal"
                  error={!!errors.apellido}
                  helperText={errors.apellido?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
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
                          size="small"
                          margin="normal"
                          error={!!errors.country}
                          helperText={errors.country?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {
                    ...register('telefono')
                  }
                  fullWidth
                  label="Teléfono"
                  type="tel"
                  size="small"
                  margin="normal"
                  placeholder="+34 123 456 789"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {
                    ...register('direccion')
                  }
                  fullWidth
                  label="Dirección"
                  size="small"
                  margin="normal"
                  placeholder="Calle, número, ciudad"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={isLoading}
                sx={{ py: 1 }}
              >
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                type="reset"
                disabled={isLoading}
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
