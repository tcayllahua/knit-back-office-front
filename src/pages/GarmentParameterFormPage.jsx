import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import { useGetGarmentParameter } from '../hooks/queries'
import {
  useCreateGarmentParameterMutation,
  useUpdateGarmentParameterMutation,
} from '../hooks/mutations'

const GARMENT_TYPES = ['Manga - MAN', 'Pecho - PEC', 'Espalda - ESP', 'Cuello - CUE', 'Bolsillo - BOL', 'Libre - LIB', 'Chalina - CHA']
const GARMENT_MODELS = ['indu', 'sacón', 'fanny', 'chaleco', 'libre']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Estándar']
const FINISHING_TYPES = ['overlock', 'cosido', 'sin terminar']
const COMPLEXITIES = ['simple', 'medio', 'complejo']

const DEFAULT_VALUES = {
  garment_type: '',
  garment_model: '',
  size: '',
  length: '',
  width: '',
  sleeve_length: '',
  chest_circumference: '',
  waist_circumference: '',
  neck_circumference: '',
  stitch_count_horizontal: '',
  stitch_count_vertical: '',
  gauge_horizontal: '',
  gauge_vertical: '',
  finishing_type: '',
  pattern_complexity: '',
  garment_order: '',
  is_main_piece: false,
  notes: '',
}

export const GarmentParameterFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setActions, clearActions } = useHeaderActions()
  const isEditMode = !!id

  const { data: garment, isLoading: isGarmentLoading } = useGetGarmentParameter(id)
  const createMutation = useCreateGarmentParameterMutation()
  const updateMutation = useUpdateGarmentParameterMutation()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULT_VALUES })

  useEffect(() => {
    if (garment) {
      reset({
        garment_type: garment.garment_type ?? '',
        garment_model: garment.garment_model ?? '',
        size: garment.size ?? '',
        length: garment.length ?? '',
        width: garment.width ?? '',
        sleeve_length: garment.sleeve_length ?? '',
        chest_circumference: garment.chest_circumference ?? '',
        waist_circumference: garment.waist_circumference ?? '',
        neck_circumference: garment.neck_circumference ?? '',
        stitch_count_horizontal: garment.stitch_count_horizontal ?? '',
        stitch_count_vertical: garment.stitch_count_vertical ?? '',
        gauge_horizontal: garment.gauge_horizontal ?? '',
        gauge_vertical: garment.gauge_vertical ?? '',
        finishing_type: garment.finishing_type ?? '',
        pattern_complexity: garment.pattern_complexity ?? '',
        garment_order: garment.garment_order ?? '',
        is_main_piece: garment.is_main_piece ?? false,
        notes: garment.notes ?? '',
      })
    }
  }, [garment, reset])

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      navigate('/prendas')
    } catch {
      // Error handled in mutation onError
    }
  }

  if (isGarmentLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    const title = isEditMode ? 'Editar Parámetro de Prenda' : 'Nuevo Parámetro de Prenda'
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
      <Card sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* ── Identificación ── */}
          {sectionTitle('Identificación')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.garment_type}>
                <InputLabel>Tipo de prenda *</InputLabel>
                <Select
                  {...register('garment_type', { required: 'Tipo de prenda es requerido' })}
                  label="Tipo de prenda *"
                  defaultValue=""
                >
                  {GARMENT_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>
                  ))}
                </Select>
                {errors.garment_type && <FormHelperText>{errors.garment_type.message}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.garment_model}>
                <InputLabel>Modelo *</InputLabel>
                <Select
                  {...register('garment_model', { required: 'Modelo es requerido' })}
                  label="Modelo *"
                  defaultValue=""
                >
                  {GARMENT_MODELS.map((m) => (
                    <MenuItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</MenuItem>
                  ))}
                </Select>
                {errors.garment_model && <FormHelperText>{errors.garment_model.message}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.size}>
                <InputLabel>Talla *</InputLabel>
                <Select
                  {...register('size', { required: 'Talla es requerida' })}
                  label="Talla *"
                  defaultValue=""
                >
                  {SIZES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
                {errors.size && <FormHelperText>{errors.size.message}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>

          {/* ── Medidas ── */}
          {sectionTitle('Medidas (cm)')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('length', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Largo"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.length}
                helperText={errors.length?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('width', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Ancho"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.width}
                helperText={errors.width?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('sleeve_length', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Largo de manga"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.sleeve_length}
                helperText={errors.sleeve_length?.message}
              />
            </Grid>
          </Grid>

          {/* ── Circunferencias ── */}
          {sectionTitle('Circunferencias (cm)')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('chest_circumference', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Contorno pecho"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.chest_circumference}
                helperText={errors.chest_circumference?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('waist_circumference', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Contorno cintura"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.waist_circumference}
                helperText={errors.waist_circumference?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('neck_circumference', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Contorno cuello"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.neck_circumference}
                helperText={errors.neck_circumference?.message}
              />
            </Grid>
          </Grid>

          {/* ── Parámetros de tejido ── */}
          {sectionTitle('Parámetros de Tejido')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('stitch_count_horizontal', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Puntos horizontal"
                type="number"
                error={!!errors.stitch_count_horizontal}
                helperText={errors.stitch_count_horizontal?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('stitch_count_vertical', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Puntos vertical"
                type="number"
                error={!!errors.stitch_count_vertical}
                helperText={errors.stitch_count_vertical?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('gauge_horizontal', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Galga horizontal (p/cm)"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.gauge_horizontal}
                helperText={errors.gauge_horizontal?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('gauge_vertical', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Galga vertical (f/cm)"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.gauge_vertical}
                helperText={errors.gauge_vertical?.message}
              />
            </Grid>
          </Grid>

          {/* ── Configuración ── */}
          {sectionTitle('Configuración')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de terminado</InputLabel>
                <Select
                  {...register('finishing_type')}
                  label="Tipo de terminado"
                  defaultValue=""
                >
                  <MenuItem value="">— Ninguno —</MenuItem>
                  {FINISHING_TYPES.map((f) => (
                    <MenuItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Complejidad patrón</InputLabel>
                <Select
                  {...register('pattern_complexity')}
                  label="Complejidad patrón"
                  defaultValue=""
                >
                  <MenuItem value="">— Ninguna —</MenuItem>
                  {COMPLEXITIES.map((c) => (
                    <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('garment_order', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Orden"
                type="number"
                error={!!errors.garment_order}
                helperText={errors.garment_order?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="is_main_piece"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={Boolean(field.value)} />}
                    label="Es pieza principal"
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* ── Notas ── */}
          {sectionTitle('Notas')}
          <Divider sx={{ mb: 2 }} />
          <TextField
            {...register('notes')}
            fullWidth
            label="Notas adicionales"
            multiline
            rows={4}
          />

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
            <Button variant="outlined" onClick={() => navigate('/prendas')} sx={{ color: 'common.black', borderColor: 'common.black', '&:hover': { borderColor: '#333', color: '#333' } }}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  )
}
