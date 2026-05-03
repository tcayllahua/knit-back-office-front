import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useHeaderActions } from '../components/HeaderActionsContext'
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material'
import { useGetProvider } from '../hooks/queries'
import {
  useCreateProviderMutation,
  useUpdateProviderMutation,
} from '../hooks/mutations'

const DEFAULT_VALUES = {
  razon_social: '',
  ruc: '',
  direccion: '',
  email: '',
  telefono: '',
  celular: '',
}

export const ProveedorFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setActions, clearActions } = useHeaderActions()
  const isEditMode = !!id

  const { data: provider, isLoading: isProviderLoading } = useGetProvider(id)
  const createMutation = useCreateProviderMutation()
  const updateMutation = useUpdateProviderMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULT_VALUES })

  useEffect(() => {
    if (provider) {
      reset({
        razon_social: provider.razon_social ?? '',
        ruc: provider.ruc ?? '',
        direccion: provider.direccion ?? '',
        email: provider.email ?? '',
        telefono: provider.telefono ?? '',
        celular: provider.celular ?? '',
      })
    }
  }, [provider, reset])

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      navigate('/proveedores')
    } catch {
      // Managed in mutation onError
    }
  }

  if (isProviderLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    const title = isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor'
    setActions(<Typography variant="h5" fontWeight={700}>{title}</Typography>)
    return () => clearActions()
  }, [isEditMode])

  return (
    <Box>
      <Card sx={{ p: 3, maxWidth: 820 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Información general
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                {...register('razon_social', {
                  required: 'La razón social es requerida',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                })}
                fullWidth
                label="Razón social *"
                error={!!errors.razon_social}
                helperText={errors.razon_social?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('ruc', {
                  required: 'El RUC es requerido',
                  minLength: { value: 8, message: 'RUC inválido' },
                })}
                fullWidth
                label="RUC *"
                error={!!errors.ruc}
                helperText={errors.ruc?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido',
                  },
                })}
                fullWidth
                label="Email *"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register('direccion', {
                  required: 'La dirección es requerida',
                })}
                fullWidth
                label="Dirección *"
                error={!!errors.direccion}
                helperText={errors.direccion?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('telefono', {
                  required: 'El teléfono es requerido',
                })}
                fullWidth
                label="Teléfono *"
                error={!!errors.telefono}
                helperText={errors.telefono?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('celular', {
                  required: 'El celular es requerido',
                })}
                fullWidth
                label="Celular *"
                error={!!errors.celular}
                helperText={errors.celular?.message}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            >
              {isLoading ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear proveedor'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/proveedores')}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  )
}
