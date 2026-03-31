import { useEffect, useState } from 'react'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../config/supabase'
import { useGetHqpdsConfiguration, useGetUserProfile } from '../hooks/queries'
import {
  useCreateHqpdsConfigurationMutation,
} from '../hooks/mutations'

const CONFIG_MODES = ['simulacion', 'produccion', 'prueba']
const GARMENT_TYPES = ['Libre - LIB','Manga - MAN', 'Pecho - PEC', 'Espalda - ESP', 'Cuello - CUE', 'Bolsillo - BOL', 'Chalina - CHA']

const DEFAULT_VALUES = {
  design_name: '',
  garment_type: '',
  description: '',
  creation_date: new Date().toISOString().slice(0, 16),
  last_modified_date: new Date().toISOString().slice(0, 16),
  version: 1,
  simulation_image_path: '',
  simulation_image_name: '',
  simulation_image_url: '',
  simulation_image_size: '',
  pds_file_path: '',
  pds_file_name: '',
  pds_file_url: '',
  pds_file_size: '',
  configuration_mode: '',
  estimated_knitting_time: '',
  created_by_user: '',
  is_active: true,
}

export const HqpdsConfigurationFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [showNoChangesModal, setShowNoChangesModal] = useState(false)
  const [pdsUploading, setPdsUploading] = useState(false)
  const [pdsUploadError, setPdsUploadError] = useState('')
  const [simUploading, setSimUploading] = useState(false)
  const [simUploadError, setSimUploadError] = useState('')
  const user = useAuthStore((state) => state.user)

  const { data: configuration, isLoading: isConfigurationLoading } = useGetHqpdsConfiguration(id)
  const { data: profile } = useGetUserProfile(user?.id)
  const createMutation = useCreateHqpdsConfigurationMutation()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm({ defaultValues: DEFAULT_VALUES })

  const sessionUserName =
    `${profile?.nombre || ''} ${profile?.apellido || ''}`.trim() ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    ''
  const currentVersion = watch('version')

  // Función para determinar si un campo debe estar deshabilitado
  const isFieldDisabled = (fieldName) => {
    const alwaysDisabledFields = ['version', 'created_by_user']

    // Si es una NUEVA configuración, desbloqueamos todos excepto version y created_by_user
    if (!isEditMode) {
      return alwaysDisabledFields.includes(fieldName)
    }

    // Si es una configuración EXISTENTE y NO estamos en modo edición, bloqueamos todo
    if (isEditMode && !isEditingMode) {
      return true
    }

    // Si es una configuración EXISTENTE y estamos en modo edición
    if (isEditMode && isEditingMode) {
      const disabledInEditMode = ['design_name']
      if (alwaysDisabledFields.includes(fieldName) || disabledInEditMode.includes(fieldName)) {
        return true
      }
    }

    return false
  }

  useEffect(() => {
    if (configuration) {
      reset({
        design_name: configuration.design_name ?? '',
        garment_type: configuration.garment_type ?? '',
        description: configuration.description ?? '',
        creation_date: configuration.creation_date
          ? new Date(configuration.creation_date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        last_modified_date: configuration.last_modified_date
          ? new Date(configuration.last_modified_date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        version: configuration.version ?? 1,
        simulation_image_path: configuration.simulation_image_path ?? '',
        simulation_image_name: configuration.simulation_image_name ?? '',
        simulation_image_url: configuration.simulation_image_url ?? '',
        simulation_image_size: configuration.simulation_image_size ?? '',
        pds_file_path: configuration.pds_file_path ?? '',
        pds_file_name: configuration.pds_file_name ?? '',
        pds_file_url: configuration.pds_file_url ?? '',
        pds_file_size: configuration.pds_file_size ?? '',
        configuration_mode: configuration.configuration_mode ?? '',
        estimated_knitting_time: configuration.estimated_knitting_time ?? '',
        created_by_user: sessionUserName || configuration.created_by_user || '',
        is_active: configuration.is_active ?? true,
      })
    }
  }, [configuration, reset, sessionUserName])

  useEffect(() => {
    if (sessionUserName) {
      setValue('created_by_user', sessionUserName, { shouldDirty: false })
    }
  }, [sessionUserName, setValue])

  useEffect(() => {
    if (!isEditMode) {
      setValue('version', 1, { shouldDirty: false })
    }
  }, [isEditMode, setValue])

  const handleSimulationImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setSimUploadError('Solo se permiten imágenes PNG, JPG o JPEG')
      return
    }

    const MAX_SIZE_MB = 10
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setSimUploadError(`El archivo supera el límite de ${MAX_SIZE_MB} MB`)
      return
    }

    setSimUploadError('')
    setSimUploading(true)
    try {
      const fileName = `simulacion/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('kinit-files-01')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('kinit-files-01')
        .getPublicUrl(fileName)

      setValue('simulation_image_path', fileName, { shouldDirty: true })
      setValue('simulation_image_name', file.name, { shouldDirty: true })
      setValue('simulation_image_url', publicUrlData.publicUrl, { shouldDirty: true })
      setValue('simulation_image_size', file.size, { shouldDirty: true })
    } catch (err) {
      setSimUploadError(err.message || 'Error al subir la imagen de simulación')
    } finally {
      setSimUploading(false)
      e.target.value = ''
    }
  }

  const handlePdsUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_SIZE_MB = 20
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setPdsUploadError(`El archivo supera el límite de ${MAX_SIZE_MB} MB`)
      return
    }

    setPdsUploadError('')
    setPdsUploading(true)
    try {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const hh = String(now.getHours()).padStart(2, '0')
      const min = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      const configurationId = id || configuration?.id || 'tmp'
      const versionNumber = isEditMode ? Number(currentVersion || 0) + 1 : Number(currentVersion || 1)
      const extension = file.name.includes('.') ? file.name.split('.').pop() : 'pds'
      const generatedFileName = `${dd}${mm}${yyyy}-${hh}${min}${ss}-${configurationId}-v${versionNumber}.${extension}`
      const fileName = `PROCESSED/PDS/${yyyy}/${mm}/${dd}/${generatedFileName}`
      const { error: uploadError } = await supabase.storage
        .from('kinit-files-01')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('kinit-files-01')
        .getPublicUrl(fileName)

      setValue('pds_file_path', fileName, { shouldDirty: true })
      setValue('pds_file_name', generatedFileName, { shouldDirty: true })
      setValue('pds_file_url', publicUrlData.publicUrl, { shouldDirty: true })
      setValue('pds_file_size', file.size, { shouldDirty: true })
    } catch (err) {
      setPdsUploadError(err.message || 'Error al subir el archivo PDS')
    } finally {
      setPdsUploading(false)
      // Limpiar input para permitir subir el mismo archivo de nuevo
      e.target.value = ''
    }
  }

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        const hasChanges = isDirty && Object.keys(dirtyFields || {}).length > 0
        if (!hasChanges) {
          setShowNoChangesModal(true)
          return
        }

        const newVersionPayload = {
          ...data,
          version: Number(data.version || 0) + 1,
        }

        const createdConfiguration = await createMutation.mutateAsync(newVersionPayload)
        reset({
          design_name: createdConfiguration.design_name ?? '',
          garment_type: createdConfiguration.garment_type ?? '',
          description: createdConfiguration.description ?? '',
          creation_date: createdConfiguration.creation_date
            ? new Date(createdConfiguration.creation_date).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          last_modified_date: createdConfiguration.last_modified_date
            ? new Date(createdConfiguration.last_modified_date).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          version: createdConfiguration.version ?? 1,
          simulation_image_path: createdConfiguration.simulation_image_path ?? '',
          simulation_image_name: createdConfiguration.simulation_image_name ?? '',
          simulation_image_url: createdConfiguration.simulation_image_url ?? '',
          simulation_image_size: createdConfiguration.simulation_image_size ?? '',
          pds_file_path: createdConfiguration.pds_file_path ?? '',
          pds_file_name: createdConfiguration.pds_file_name ?? '',
          pds_file_url: createdConfiguration.pds_file_url ?? '',
          pds_file_size: createdConfiguration.pds_file_size ?? '',
          configuration_mode: createdConfiguration.configuration_mode ?? '',
          estimated_knitting_time: createdConfiguration.estimated_knitting_time ?? '',
          created_by_user: sessionUserName || createdConfiguration.created_by_user || '',
          is_active: createdConfiguration.is_active ?? true,
        })
        setValue('version', createdConfiguration.version, { shouldDirty: false })
        setIsEditingMode(false)
        navigate(`/configuraciones/editar/${createdConfiguration.id}`)
        return
      } else {
        const createdConfiguration = await createMutation.mutateAsync(data)
        setValue('version', createdConfiguration.version, { shouldDirty: false })
        navigate(`/configuraciones/editar/${createdConfiguration.id}`)
        return
      }
    } catch {
      // Managed in mutation onError
    }
  }

  if (isConfigurationLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const isLoading = isSubmitting || createMutation.isPending
  const hasChangesInEdit = isDirty && Object.keys(dirtyFields || {}).length > 0
  const isSaveDisabled = isLoading || (isEditMode && !hasChangesInEdit)

  const sectionTitle = (text) => (
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
      {text}
    </Typography>
  )

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {!isEditMode
          ? 'Nuevo Programa HQPDS'
          : isEditingMode
            ? 'Editar Configuración HQPDS'
            : 'Ver Configuración HQPDS'}
      </Typography>

      <Card sx={{ p: 3, maxWidth: 900 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {sectionTitle('Información general')}
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('design_name', { required: 'Nombre de diseño es requerido' })}
                fullWidth
                label="Nombre de diseño *"
                disabled={isFieldDisabled('design_name')}
                error={!!errors.design_name}
                helperText={errors.design_name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.garment_type} disabled={isFieldDisabled('garment_type')}>
                <InputLabel>Tipo de prenda</InputLabel>
                <Controller
                  name="garment_type"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Tipo de prenda">
                      <MenuItem value="">— Ninguno —</MenuItem>
                      {GARMENT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.garment_type && (
                  <FormHelperText>{errors.garment_type.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('creation_date', { required: 'Fecha de creación requerida' })}
                fullWidth
                type="datetime-local"
                label="Fecha creación *"
                disabled
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                error={!!errors.creation_date}
                helperText={errors.creation_date?.message}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('last_modified_date')}
                fullWidth
                type="datetime-local"
                label="Última modificación"
                disabled
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                helperText="Actualizada automáticamente"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Creado por"
                value={sessionUserName}
                InputProps={{ readOnly: true }}
                disabled
                helperText="Tomado del usuario en sesión"
              />
              <input type="hidden" {...register('created_by_user')} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Versión"
                value={currentVersion ?? 1}
                InputProps={{ readOnly: true }}
                disabled
                helperText={isEditMode ? 'Se incrementa automáticamente al guardar' : 'Versión inicial'}
              />
              <input type="hidden" {...register('version')} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('description')}
                fullWidth
                label="Descripción"
                disabled={isFieldDisabled('description')}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>

          {sectionTitle('Archivos de simulación')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} alignItems="center">
            {/* Botón de carga */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  type="button"
                  variant="outlined"
                  component="label"
                  startIcon={simUploading ? <CircularProgress size={18} /> : <UploadFileIcon />}
                  disabled={isFieldDisabled('simulation_image_path') || simUploading}
                  sx={{ height: 56 }}
                >
                  {simUploading ? 'Subiendo...' : 'Carga de imagen'}
                  <input
                    type="file"
                    hidden
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleSimulationImageUpload}
                  />
                </Button>
                {simUploadError && (
                  <Typography variant="caption" color="error">{simUploadError}</Typography>
                )}
              </Box>
            </Grid>

            {/* Preview / info de imagen cargada */}
            <Grid item xs={12} sm={8}>
              {watch('simulation_image_url') ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box
                    component="img"
                    src={watch('simulation_image_url')}
                    alt={watch('simulation_image_name')}
                    sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                  />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="body2" noWrap fontWeight={500}>
                      {watch('simulation_image_name')}
                    </Typography>
                    {watch('simulation_image_size') && (
                      <Typography variant="caption" color="text.secondary">
                        {(Number(watch('simulation_image_size')) / 1024).toFixed(1)} KB
                      </Typography>
                    )}
                  </Box>
                  <Button
                    type="button"
                    size="small"
                    href={watch('simulation_image_url')}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ ml: 'auto', flexShrink: 0 }}
                  >
                    Ver imagen
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No hay imagen de simulación cargada
                </Typography>
              )}
            </Grid>

            {/* Campos ocultos para el formulario */}
            <input type="hidden" {...register('simulation_image_path')} />
            <input type="hidden" {...register('simulation_image_name')} />
            <input type="hidden" {...register('simulation_image_url')} />
            <input type="hidden" {...register('simulation_image_size')} />
          </Grid>

          {sectionTitle('Archivo PDS')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} alignItems="center">
            {/* Botón de carga */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  type="button"
                  variant="outlined"
                  component="label"
                  startIcon={pdsUploading ? <CircularProgress size={18} /> : <UploadFileIcon />}
                  disabled={isFieldDisabled('pds_file_path') || pdsUploading}
                  sx={{ height: 56 }}
                >
                  {pdsUploading ? 'Subiendo...' : 'Cargar archivo PDS'}
                  <input
                    type="file"
                    hidden
                    onChange={handlePdsUpload}
                  />
                </Button>
                {pdsUploadError && (
                  <Typography variant="caption" color="error">{pdsUploadError}</Typography>
                )}
              </Box>
            </Grid>

            {/* Nombre del archivo subido */}
            <Grid item xs={12} sm={8}>
              {watch('pds_file_name') ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                  }}
                >
                  <InsertDriveFileIcon color="primary" fontSize="small" />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="body2" noWrap fontWeight={500}>
                      {watch('pds_file_name')}
                    </Typography>
                    {watch('pds_file_size') && (
                      <Typography variant="caption" color="text.secondary">
                        {(Number(watch('pds_file_size')) / 1024).toFixed(1)} KB
                      </Typography>
                    )}
                  </Box>
                  {watch('pds_file_url') && (
                    <Button
                      type="button"
                      size="small"
                      href={watch('pds_file_url')}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ ml: 'auto', flexShrink: 0 }}
                    >
                      Ver archivo
                    </Button>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No hay archivo PDS cargado
                </Typography>
              )}
            </Grid>

            {/* Campos ocultos para el formulario */}
            <input type="hidden" {...register('pds_file_path')} />
            <input type="hidden" {...register('pds_file_name')} />
            <input type="hidden" {...register('pds_file_url')} />
            <input type="hidden" {...register('pds_file_size')} />
          </Grid>

          {sectionTitle('Control de configuración')}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth disabled={isFieldDisabled('configuration_mode')}>
                <InputLabel>Modo de configuración</InputLabel>
                <Select {...register('configuration_mode')} label="Modo de configuración" defaultValue="">
                  <MenuItem value="">— Ninguno —</MenuItem>
                  {CONFIG_MODES.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('estimated_knitting_time', { min: { value: 0, message: 'Debe ser positivo' } })}
                fullWidth
                label="Tiempo estimado (min)"
                type="number"
                disabled={isFieldDisabled('estimated_knitting_time')}
                error={!!errors.estimated_knitting_time}
                helperText={errors.estimated_knitting_time?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={Boolean(field.value)} disabled={isFieldDisabled('is_active')} />}
                    label="Configuración activa"
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            {/* Nueva configuración o editando */}
            {isEditingMode || !isEditMode ? (
              <>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSaveDisabled}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {isLoading ? 'Guardando...' : isEditMode ? 'Guardar nueva versión' : 'Crear configuración'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  disabled={isLoading}
                  startIcon={<CancelIcon />}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!isEditMode) {
                      navigate('/configuraciones')
                    } else {
                      setIsEditingMode(false)
                    }
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              /* Viendo configuración existente */
              <>
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsEditingMode(true)
                  }}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigate('/configuraciones')
                  }}
                >
                  Cancelar
                </Button>
              </>
            )}
          </Box>
        </form>
      </Card>

      <Dialog open={showNoChangesModal} onClose={() => setShowNoChangesModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Sin cambios para guardar</DialogTitle>
        <DialogContent>
          <DialogContentText>
            No se actualizaron campos. Realiza al menos una modificación para guardar y generar una nueva versión.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setShowNoChangesModal(false)} autoFocus>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
