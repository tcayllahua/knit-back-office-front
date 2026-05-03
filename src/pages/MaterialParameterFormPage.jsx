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
import { useGetMaterialParameter } from '../hooks/queries'
import {
  useCreateMaterialParameterMutation,
  useUpdateMaterialParameterMutation,
} from '../hooks/mutations'

const YARN_TYPES = ['lana', 'alpaca', 'dralón', 'rabbit']
const YARN_WEIGHTS = ['fingering', 'sport', 'dk', 'worsted', 'bulky']
const QUANTITY_UNITS = ['gramos', 'metros', 'ovillos']

const DEFAULT_VALUES = {
  yarn_type: '',
  yarn_weight: '',
  yarn_color: '',
  yarn_brand: '',
  yarn_composition: '',
  yarn_thickness: '',
  yarn_count: '',
  quantity_used: '',
  quantity_unit: '',
  cost_per_unit: '',
  supplier: '',
  lot_number: '',
  hqpds_configuration_id: '',
  material_order: '',
  is_primary: false,
  notes: '',
}

export const MaterialParameterFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setActions, clearActions } = useHeaderActions()
  const isEditMode = !!id

  const { data: materialParameter, isLoading: isMaterialParameterLoading } = useGetMaterialParameter(id)
  const createMutation = useCreateMaterialParameterMutation()
  const updateMutation = useUpdateMaterialParameterMutation()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULT_VALUES })

  useEffect(() => {
    if (materialParameter) {
      reset({
        yarn_type: materialParameter.yarn_type ?? '',
        yarn_weight: materialParameter.yarn_weight ?? '',
        yarn_color: materialParameter.yarn_color ?? '',
        yarn_brand: materialParameter.yarn_brand ?? '',
        yarn_composition: materialParameter.yarn_composition ?? '',
        yarn_thickness: materialParameter.yarn_thickness ?? '',
        yarn_count: materialParameter.yarn_count ?? '',
        quantity_used: materialParameter.quantity_used ?? '',
        quantity_unit: materialParameter.quantity_unit ?? '',
        cost_per_unit: materialParameter.cost_per_unit ?? '',
        supplier: materialParameter.supplier ?? '',
        lot_number: materialParameter.lot_number ?? '',
        hqpds_configuration_id: materialParameter.hqpds_configuration_id ?? '',
        material_order: materialParameter.material_order ?? '',
        is_primary: materialParameter.is_primary ?? false,
        notes: materialParameter.notes ?? '',
      })
    }
  }, [materialParameter, reset])

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      navigate('/materiales')
    } catch {
      // Managed in mutation onError
    }
  }

  if (isMaterialParameterLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    const title = isEditMode ? 'Editar Parámetro de Material' : 'Nuevo Parámetro de Material'
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
      <Card sx={{ p: 3, maxWidth: 820 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {sectionTitle('Información de hilo')}
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de hilo</InputLabel>
                <Select {...register('yarn_type')} label="Tipo de hilo" defaultValue="">
                  <MenuItem value="">— Ninguno —</MenuItem>
                  {YARN_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Peso del hilo</InputLabel>
                <Select {...register('yarn_weight')} label="Peso del hilo" defaultValue="">
                  <MenuItem value="">— Ninguno —</MenuItem>
                  {YARN_WEIGHTS.map((weight) => (
                    <MenuItem key={weight} value={weight}>{weight}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField {...register('yarn_color')} fullWidth label="Color" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField {...register('yarn_brand')} fullWidth label="Marca" />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField {...register('yarn_composition')} fullWidth label="Composición" placeholder="Ej: 50% alpaca 50% lana" />
            </Grid>
          </Grid>

          {sectionTitle('Parámetros técnicos y costo')}
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('yarn_thickness', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Grosor (mm)"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.yarn_thickness}
                helperText={errors.yarn_thickness?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField {...register('yarn_count')} fullWidth label="Numeración" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('quantity_used', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Cantidad usada"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.quantity_used}
                helperText={errors.quantity_used?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Unidad</InputLabel>
                <Select {...register('quantity_unit')} label="Unidad" defaultValue="">
                  <MenuItem value="">— Ninguna —</MenuItem>
                  {QUANTITY_UNITS.map((unit) => (
                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                {...register('cost_per_unit', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Costo por unidad"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.cost_per_unit}
                helperText={errors.cost_per_unit?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField {...register('supplier')} fullWidth label="Proveedor" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField {...register('lot_number')} fullWidth label="Lote" />
            </Grid>
          </Grid>

          {sectionTitle('Control y relación')}
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('hqpds_configuration_id', {
                  required: 'La configuración principal es requerida',
                  min: { value: 1, message: 'Debe ser un ID válido' },
                })}
                fullWidth
                label="ID Configuración HQPDS *"
                type="number"
                error={!!errors.hqpds_configuration_id}
                helperText={errors.hqpds_configuration_id?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('material_order', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Orden"
                type="number"
                error={!!errors.material_order}
                helperText={errors.material_order?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="is_primary"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={Boolean(field.value)} />}
                    label="Material primario"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField {...register('notes')} fullWidth label="Notas" multiline rows={4} />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            >
              {isLoading ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear parámetro'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/materiales')}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  )
}
