import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
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
import { useGetMachine } from '../hooks/queries'
import { useCreateMachineMutation, useUpdateMachineMutation } from '../hooks/mutations'

const MACHINE_TYPES = ['A', 'B', 'C', 'D', 'E']
const GAUGE_OPTIONS = [3, 6, 7, 9]
const MAINTENANCE_OPTIONS = ['operativa', 'mantenimiento', 'inactiva']

const DEFAULT_VALUES = {
  machine_type: '',
  gauge_number: '',
  needle_count: '',
  machine_speed: '',
  working_width: '',
  feeder_count: '',
  cylinder_diameter: '',
  machine_brand: '',
  machine_model: '',
  hqpds_configuration_id: '',
  is_primary: false,
  maintenance_status: '',
  calibration_date: '',
  notes: '',
}

export const MaquinaFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const { data: machine, isLoading: isMachineLoading } = useGetMachine(id)
  const createMutation = useCreateMachineMutation()
  const updateMutation = useUpdateMachineMutation()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULT_VALUES })

  useEffect(() => {
    if (machine) {
      reset({
        machine_type: machine.machine_type ?? '',
        gauge_number: machine.gauge_number ?? '',
        needle_count: machine.needle_count ?? '',
        machine_speed: machine.machine_speed ?? '',
        working_width: machine.working_width ?? '',
        feeder_count: machine.feeder_count ?? '',
        cylinder_diameter: machine.cylinder_diameter ?? '',
        machine_brand: machine.machine_brand ?? '',
        machine_model: machine.machine_model ?? '',
        hqpds_configuration_id: machine.hqpds_configuration_id ?? '',
        is_primary: machine.is_primary ?? false,
        maintenance_status: machine.maintenance_status ?? '',
        calibration_date: machine.calibration_date ?? '',
        notes: machine.notes ?? '',
      })
    }
  }, [machine, reset])

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, machineData: data })
      } else {
        await createMutation.mutateAsync({ machineData: data })
      }
      navigate('/maquinas')
    } catch {
      // Error handled in mutation onError.
    }
  }

  if (isMachineLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending
  const sectionTitle = (text) => (
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
      {text}
    </Typography>
  )

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEditMode ? 'Editar Parámetro de Máquina' : 'Nuevo Parámetro de Máquina'}
      </Typography>

      <Card sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {sectionTitle('Datos base')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.machine_type}>
                <InputLabel>Tipo de máquina *</InputLabel>
                <Select
                  {...register('machine_type', { required: 'Tipo de máquina requerido' })}
                  label="Tipo de máquina *"
                  defaultValue=""
                >
                  {MACHINE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
                {errors.machine_type && <FormHelperText>{errors.machine_type.message}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.gauge_number}>
                <InputLabel>Galga *</InputLabel>
                <Select
                  {...register('gauge_number', { required: 'Galga requerida' })}
                  label="Galga *"
                  defaultValue=""
                >
                  {GAUGE_OPTIONS.map((gauge) => (
                    <MenuItem key={gauge} value={gauge}>{gauge}</MenuItem>
                  ))}
                </Select>
                {errors.gauge_number && <FormHelperText>{errors.gauge_number.message}</FormHelperText>}
              </FormControl>
            </Grid>
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
          </Grid>

          {sectionTitle('Capacidad mecánica')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('needle_count', { min: { value: 1, message: 'Debe ser mayor a 0' } })}
                fullWidth
                label="Cantidad de agujas"
                type="number"
                error={!!errors.needle_count}
                helperText={errors.needle_count?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('machine_speed', { min: { value: 1, message: 'Debe ser mayor a 0' } })}
                fullWidth
                label="Velocidad (RPM)"
                type="number"
                error={!!errors.machine_speed}
                helperText={errors.machine_speed?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('feeder_count', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Cantidad de alimentadores"
                type="number"
                error={!!errors.feeder_count}
                helperText={errors.feeder_count?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('working_width', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Ancho de trabajo (cm)"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.working_width}
                helperText={errors.working_width?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('cylinder_diameter', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Diámetro del cilindro (cm)"
                type="number"
                inputProps={{ step: '0.01' }}
                error={!!errors.cylinder_diameter}
                helperText={errors.cylinder_diameter?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('machine_brand')}
                fullWidth
                label="Marca"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('machine_model')}
                fullWidth
                label="Modelo"
              />
            </Grid>
          </Grid>

          {sectionTitle('Estado y control')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Estado de mantenimiento</InputLabel>
                <Select {...register('maintenance_status')} label="Estado de mantenimiento" defaultValue="">
                  <MenuItem value="">-- Sin estado --</MenuItem>
                  {MAINTENANCE_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('calibration_date')}
                fullWidth
                label="Fecha de calibración"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="is_primary"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={Boolean(field.value)} />}
                    label="Máquina primaria"
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
            >
              {isLoading ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear parámetro'}
            </Button>

            <Button variant="outlined" onClick={() => navigate('/maquinas')}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  )
}
