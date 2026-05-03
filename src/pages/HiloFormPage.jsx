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
import { useGetThread } from '../hooks/queries'
import {
  useCreateThreadMutation,
  useUpdateThreadMutation,
} from '../hooks/mutations'

const DEFAULT_VALUES = {
  thread_code: '',
  thread_name: '',
  composition: '',
  abbreviation: '',
  care_instructions: '',
  presentation: '',
  weight: '',
  unit_of_measure: '',
  hex_color_code: '',
  color_description: '',
}

export const HiloFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setActions, clearActions } = useHeaderActions()
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

  const colorHexValue = watch('hex_color_code')
  const isValidHexColor = /^#([A-Fa-f0-9]{6})$/.test(colorHexValue || '')

  useEffect(() => {
    if (thread) {
      reset({
        thread_code: thread.thread_code ?? '',
        thread_name: thread.thread_name ?? '',
        composition: thread.composition ?? '',
        abbreviation: thread.abbreviation ?? '',
        care_instructions: thread.care_instructions ?? '',
        presentation: thread.presentation ?? '',
        weight: thread.weight ?? '',
        unit_of_measure: thread.unit_of_measure ?? '',
        hex_color_code: thread.hex_color_code ?? '',
        color_description: thread.color_description ?? '',
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

  useEffect(() => {
    const title = isEditMode ? 'Editar Hilo' : 'Nuevo Hilo'
    setActions(<Typography variant="h5" fontWeight={700}>{title}</Typography>)
    return () => clearActions()
  }, [isEditMode])

  return (
    <Box>
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
                {...register('thread_code', {
                  required: 'El código del hilo es requerido',
                })}
                fullWidth
                label="Código Hilo *"
                error={!!errors.thread_code}
                helperText={errors.thread_code?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('thread_name')}
                fullWidth
                label="Nombre Hilo"
                error={!!errors.thread_name}
                helperText={errors.thread_name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField {...register('abbreviation')} fullWidth label="Abrev" error={!!errors.abbreviation} helperText={errors.abbreviation?.message} />
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
              <TextField {...register('composition')} fullWidth label="Composición" error={!!errors.composition} helperText={errors.composition?.message} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('presentation')}
                fullWidth
                label="Presentación"
                error={!!errors.presentation}
                helperText={errors.presentation?.message}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                {...register('weight', {
                  validate: (value) => value === '' || Number(value) >= 0 || 'Debe ser positivo',
                })}
                fullWidth
                label="Peso"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.weight}
                helperText={errors.weight?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('unit_of_measure')}
                fullWidth
                label="Unidad de medida"
                error={!!errors.unit_of_measure}
                helperText={errors.unit_of_measure?.message}
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
                {...register('color_description')}
                fullWidth
                label="Color Descripción"
                error={!!errors.color_description}
                helperText={errors.color_description?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('hex_color_code', {
                  validate: (value) => {
                    if (!value) return true
                    return /^#([A-Fa-f0-9]{6})$/.test(value) || 'Formato válido: #RRGGBB'
                  },
                })}
                fullWidth
                label="Código color hex"
                error={!!errors.hex_color_code}
                helperText={errors.hex_color_code?.message}
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
                {...register('care_instructions')}
                fullWidth
                label="Instrucciones de Cuidado"
                multiline
                rows={2}
                error={!!errors.care_instructions}
                helperText={errors.care_instructions?.message}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
              sx={{ bgcolor: 'common.black', '&:hover': { bgcolor: '#333' } }}
            >
              {isLoading ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear hilo'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/hilos')} sx={{ color: 'common.black', borderColor: 'common.black', '&:hover': { borderColor: '#333', color: '#333' } }}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  )
}
