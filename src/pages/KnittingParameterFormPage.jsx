import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useHeaderActions } from '../components/HeaderActionsContext'
import {
  Box,
  Card,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  FormHelperText,
  FormControlLabel,
  Switch,
  Divider,
  Grid,
} from '@mui/material'
import { useGetKnittingParameter } from '../hooks/queries'
import {
  useCreateKnittingParameterMutation,
  useUpdateKnittingParameterMutation,
} from '../hooks/mutations'

const STITCH_TYPES = ['trenza', 'aranes', 'arroz', 'jersey', 'retenido', 'rib', 'lim lim']
const CANVAS_TYPES = ['AL', 'VF', 'KF', 'GF', 'TR', 'CF']
const KNITTING_MODES = ['jacquard', 'intarsia']

const DEFAULT_VALUES = {
  stitch_type: '',
  canvas_type: '',
  knitting_mode: '',
  knitting_submode: '',
  thread_count: '',
  stitch_density: '',
  pattern_repeat: '',
  tension_setting: '',
  parameter_order: '',
  is_primary: false,
  notes: '',
}

export const KnittingParameterFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setActions, clearActions } = useHeaderActions()
  const isEditMode = !!id

  const { data: knittingParameter, isLoading: isKnittingParameterLoading } = useGetKnittingParameter(id)
  const createMutation = useCreateKnittingParameterMutation()
  const updateMutation = useUpdateKnittingParameterMutation()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULT_VALUES })

  useEffect(() => {
    if (knittingParameter) {
      reset({
        stitch_type: knittingParameter.stitch_type ?? '',
        canvas_type: knittingParameter.canvas_type ?? '',
        knitting_mode: knittingParameter.knitting_mode ?? '',
        knitting_submode: knittingParameter.knitting_submode ?? '',
        thread_count: knittingParameter.thread_count ?? '',
        stitch_density: knittingParameter.stitch_density ?? '',
        pattern_repeat: knittingParameter.pattern_repeat ?? '',
        tension_setting: knittingParameter.tension_setting ?? '',
        parameter_order: knittingParameter.parameter_order ?? '',
        is_primary: knittingParameter.is_primary ?? false,
        notes: knittingParameter.notes ?? '',
      })
    }
  }, [knittingParameter, reset])

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      navigate('/tejido')
    } catch {
      // Managed in mutation onError
    }
  }

  if (isKnittingParameterLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    const title = isEditMode ? 'Editar Parámetro de Tejido' : 'Nuevo Parámetro de Tejido'
    setActions(<Typography variant="h5" fontWeight={700}>{title}</Typography>)
    return () => clearActions()
  }, [isEditMode])

  const sectionTitle = (text) => (
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
      {text}
    </Typography>
  )

  return (
    <Box>
      <Card sx={{ p: 3, maxWidth: 780 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {sectionTitle('Identificación')}
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.stitch_type}>
                <InputLabel>Tipo de punto *</InputLabel>
                <Select
                  {...register('stitch_type', { required: 'Tipo de punto es requerido' })}
                  label="Tipo de punto *"
                  defaultValue=""
                >
                  {STITCH_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                  ))}
                </Select>
                {errors.stitch_type && <FormHelperText>{errors.stitch_type.message}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de canvas</InputLabel>
                <Select {...register('canvas_type')} label="Tipo de canvas" defaultValue="">
                  <MenuItem value="">— Ninguno —</MenuItem>
                  {CANVAS_TYPES.map((canvas) => (
                    <MenuItem key={canvas} value={canvas}>{canvas}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Modo de tejido</InputLabel>
                <Select {...register('knitting_mode')} label="Modo de tejido" defaultValue="">
                  <MenuItem value="">— Ninguno —</MenuItem>
                  {KNITTING_MODES.map((mode) => (
                    <MenuItem key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register('knitting_submode')}
                fullWidth
                label="Submodo de tejido"
                placeholder="Ej: jacquard doble cama"
              />
            </Grid>
          </Grid>

          {sectionTitle('Parámetros técnicos')}
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('thread_count', {
                  min: { value: 1, message: 'Mínimo 1' },
                  max: { value: 9, message: 'Máximo 9' },
                })}
                fullWidth
                label="Cantidad de hilos"
                type="number"
                error={!!errors.thread_count}
                helperText={errors.thread_count?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('stitch_density', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Densidad de punto"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.stitch_density}
                helperText={errors.stitch_density?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('pattern_repeat', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Repetición patrón"
                type="number"
                error={!!errors.pattern_repeat}
                helperText={errors.pattern_repeat?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('tension_setting', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Tensión"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.tension_setting}
                helperText={errors.tension_setting?.message}
              />
            </Grid>
          </Grid>

          {sectionTitle('Control')}
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('parameter_order', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Orden"
                type="number"
                error={!!errors.parameter_order}
                helperText={errors.parameter_order?.message}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Controller
                name="is_primary"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={Boolean(field.value)} />}
                    label="Parámetro primario"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('notes')}
                fullWidth
                label="Notas"
                multiline
                rows={4}
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
              {isLoading ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear parámetro'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/tejido')} sx={{ color: 'common.black', borderColor: 'common.black', '&:hover': { borderColor: '#333', color: '#333' } }}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  )
}
