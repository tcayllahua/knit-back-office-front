import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
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
import { useGetThread } from '../hooks/queries'
import {
  useCreateThreadMutation,
  useUpdateThreadMutation,
} from '../hooks/mutations'

const DEFAULT_VALUES = {
  codigo_hilo: '',
  nombre_hilo: '',
  composicion: '',
  abrev: '',
  instrucciones_cuidado: '',
  presentacion: '',
  peso: '',
  unidad_medida: '',
  codigo_color_hex: '',
  color_descripcion: '',
}

export const HiloFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const { data: thread, isLoading: isThreadLoading } = useGetThread(id)
  const createMutation = useCreateThreadMutation()
  const updateMutation = useUpdateThreadMutation()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULT_VALUES })

  const colorHexValue = watch('codigo_color_hex')
  const isValidHexColor = /^#([A-Fa-f0-9]{6})$/.test(colorHexValue || '')

  useEffect(() => {
    if (thread) {
      reset({
        codigo_hilo: thread.codigo_hilo ?? '',
        nombre_hilo: thread.nombre_hilo ?? '',
        composicion: thread.composicion ?? '',
        abrev: thread.abrev ?? '',
        instrucciones_cuidado: thread.instrucciones_cuidado ?? '',
        presentacion: thread.presentacion ?? '',
        peso: thread.peso ?? '',
        unidad_medida: thread.unidad_medida ?? '',
        codigo_color_hex: thread.codigo_color_hex ?? '',
        color_descripcion: thread.color_descripcion ?? '',
      })
    }
  }, [thread, reset])

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      navigate('/hilos')
    } catch {
      // Managed in mutation onError
    }
  }

  if (isThreadLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEditMode ? 'Editar Hilo' : 'Nuevo Hilo'}
      </Typography>

      <Card sx={{ p: 3, maxWidth: 920 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Información del hilo
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Identificación
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                {...register('codigo_hilo', {
                  required: 'El código del hilo es requerido',
                })}
                fullWidth
                label="Código Hilo *"
                error={!!errors.codigo_hilo}
                helperText={errors.codigo_hilo?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('nombre_hilo')}
                fullWidth
                label="Nombre Hilo"
                error={!!errors.nombre_hilo}
                helperText={errors.nombre_hilo?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField {...register('abrev')} fullWidth label="Abrev" error={!!errors.abrev} helperText={errors.abrev?.message} />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Especificaciones
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField {...register('composicion')} fullWidth label="Composición" error={!!errors.composicion} helperText={errors.composicion?.message} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('presentacion')}
                fullWidth
                label="Presentación"
                error={!!errors.presentacion}
                helperText={errors.presentacion?.message}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                {...register('peso', {
                  validate: (value) => value === '' || Number(value) >= 0 || 'Debe ser positivo',
                })}
                fullWidth
                label="Peso"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.peso}
                helperText={errors.peso?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('unidad_medida')}
                fullWidth
                label="Unidad de medida"
                error={!!errors.unidad_medida}
                helperText={errors.unidad_medida?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Color
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                {...register('color_descripcion')}
                fullWidth
                label="Color Descripción"
                error={!!errors.color_descripcion}
                helperText={errors.color_descripcion?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('codigo_color_hex', {
                  validate: (value) => {
                    if (!value) return true
                    return /^#([A-Fa-f0-9]{6})$/.test(value) || 'Formato válido: #RRGGBB'
                  },
                })}
                fullWidth
                label="Código color hex"
                error={!!errors.codigo_color_hex}
                helperText={errors.codigo_color_hex?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  height: 56,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: isValidHexColor ? colorHexValue : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  mt: { xs: 1, sm: 0 },
                }}
              >
                {!isValidHexColor ? 'Vista de color' : ''}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Cuidados
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register('instrucciones_cuidado')}
                fullWidth
                label="Instrucciones de Cuidado"
                multiline
                rows={2}
                error={!!errors.instrucciones_cuidado}
                helperText={errors.instrucciones_cuidado?.message}
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
              {isLoading ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear hilo'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/hilos')}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  )
}
