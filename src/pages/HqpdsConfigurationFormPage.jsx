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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Popover,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import DeleteRowIcon from '@mui/icons-material/Delete'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../config/supabase'
import { useGetHqpdsConfiguration, useGetUserProfile } from '../hooks/queries'
import {
  useCreateHqpdsConfigurationMutation,
  useUpdateHqpdsConfigurationMutation,
} from '../hooks/mutations'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import imageCompression from 'browser-image-compression'

const CONFIG_MODES = ['simulacion', 'produccion', 'prueba']
const GARMENT_TYPES = ['Libre - LIB','Todo - TOD','Manga - MAN', 'Pecho - PEC', 'Espalda - ESP', 'Cuello - CUE', 'Bolsillo - BOL', 'Chalina - CHA']
const DENSITY_TYPES = ['DESPERDICIO', 'PRIMERA PASADA', 'PRETINA', 'CUERPO', 'REMALLE', 'ULTIMA PASADA', '1X1', '2X1', 'TUBULAR']

const MODE_CODE_MAP = { simulacion: 'S', produccion: 'P', prueba: 'T' }

const generateHqpdsId = (garmentType, configMode, version) => {
  const garmentCode = garmentType ? garmentType.split(' - ').pop()?.trim() || '' : ''
  const modeCode = MODE_CODE_MAP[configMode] || 'X'
  const versionStr = String(Number(version) || 1).padStart(2, '0')
  if (!garmentCode) return ''
  return `${garmentCode}${modeCode}${versionStr}`
}

const COLOR_PALETTE = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
  '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
  '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
  '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
  '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
  '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
  '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47',
  '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130',
]

const DEFAULT_VALUES = {
  hqpds_id: '',
  design_name: '',
  garment_type: '',
  garment_size: '',
  description: '',
  creation_date: new Date().toISOString().slice(0, 16),
  last_modified_date: new Date().toISOString().slice(0, 16),
  version: 1,
  image_file_design: [],
  pds_file: [],
  hcd_file: [],
  configuration_mode: '',
  estimated_knitting_time: '',
  thread_guide: [],
  stitch_density: [],
  created_by_user: '',
  is_active: true,
}

export const HqpdsConfigurationFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [showNoChangesModal, setShowNoChangesModal] = useState(false)
  const [densityErrors, setDensityErrors] = useState([])
  const [threadGuideErrors, setThreadGuideErrors] = useState([])
  const [pdsUploading, setPdsUploading] = useState(false)
  const [pdsUploadError, setPdsUploadError] = useState('')
  const [hcdUploading, setHcdUploading] = useState(false)
  const [hcdUploadError, setHcdUploadError] = useState('')
  const [simUploading, setSimUploading] = useState(false)
  const [simUploadError, setSimUploadError] = useState('')
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null)
  const [colorPickerIndex, setColorPickerIndex] = useState(null)
  const user = useAuthStore((state) => state.user)

  const { data: configuration, isLoading: isConfigurationLoading } = useGetHqpdsConfiguration(id)
  const { data: profile } = useGetUserProfile(user?.id)
  const createMutation = useCreateHqpdsConfigurationMutation()
  const updateMutation = useUpdateHqpdsConfigurationMutation()
  const [isNewVersioning, setIsNewVersioning] = useState(false)

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
  const watchedGarmentType = watch('garment_type')
  const watchedConfigMode = watch('configuration_mode')

  useEffect(() => {
    const newId = generateHqpdsId(watchedGarmentType, watchedConfigMode, currentVersion)
    setValue('hqpds_id', newId, { shouldDirty: false })
  }, [watchedGarmentType, watchedConfigMode, currentVersion, setValue])

  // Función para determinar si un campo debe estar deshabilitado
  const isFieldDisabled = (fieldName) => {
    const alwaysDisabledFields = ['version', 'created_by_user']

    // Si es una NUEVA configuración, desbloqueamos todos excepto version y created_by_user
    if (!isEditMode) {
      return alwaysDisabledFields.includes(fieldName)
    }

    // Si es una configuración EXISTENTE y NO estamos en modo edición ni nueva versión, bloqueamos todo
    if (isEditMode && !isEditingMode && !isNewVersioning) {
      return true
    }

    // Si es una configuración EXISTENTE y estamos en modo edición
    if (isEditMode && isEditingMode) {
      const disabledInEditMode = ['design_name']
      if (alwaysDisabledFields.includes(fieldName) || disabledInEditMode.includes(fieldName)) {
        return true
      }
    }

    // Si es una configuración EXISTENTE y estamos generando nueva versión
    if (isEditMode && isNewVersioning) {
      if (alwaysDisabledFields.includes(fieldName)) {
        return true
      }
    }

    return false
  }

  useEffect(() => {
    if (configuration) {
      reset({
        hqpds_id: configuration.hqpds_id ?? '',
        design_name: configuration.design_name ?? '',
        garment_type: configuration.garment_type ?? '',
        garment_size: configuration.garment_size ?? '',
        description: configuration.description ?? '',
        creation_date: configuration.creation_date
          ? new Date(configuration.creation_date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        last_modified_date: configuration.last_modified_date
          ? new Date(configuration.last_modified_date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        version: configuration.version ?? 1,
        image_file_design: Array.isArray(configuration.image_file_design) ? configuration.image_file_design : [],
        pds_file: Array.isArray(configuration.pds_file) ? configuration.pds_file : [],
        hcd_file: Array.isArray(configuration.hcd_file) ? configuration.hcd_file : [],
        configuration_mode: configuration.configuration_mode ?? '',
        estimated_knitting_time: configuration.estimated_knitting_time ?? '',
        thread_guide: Array.isArray(configuration.thread_guide) ? configuration.thread_guide : [],
        stitch_density: Array.isArray(configuration.stitch_density) ? configuration.stitch_density : [],
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    const MAX_SIZE_MB = 10

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setSimUploadError('Solo se permiten imágenes PNG, JPG, JPEG o WebP')
        e.target.value = ''
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setSimUploadError(`El archivo ${file.name} supera el límite de ${MAX_SIZE_MB} MB`)
        e.target.value = ''
        return
      }
    }

    setSimUploadError('')
    setSimUploading(true)
    try {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const hh = String(now.getHours()).padStart(2, '0')
      const min = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      const configurationId = id || 'new'
      const versionNumber = Number(currentVersion || 1)

      const currentImages = watch('image_file_design') || []

      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.8,
      }

      const uploadedImages = []
      for (let i = 0; i < files.length; i++) {
        const originalFile = files[i]
        const compressedFile = await imageCompression(originalFile, compressionOptions)
        const index = currentImages.length + i + 1
        const generatedFileName = `${dd}${mm}${yyyy}-${hh}${min}${ss}-${configurationId}-v${versionNumber}-${index}.webp`
        const fileName = `PROCESSED/IMG/${yyyy}/${mm}/${dd}/${generatedFileName}`
        const { error: uploadError } = await supabase.storage
          .from('kinit-files-01')
          .upload(fileName, compressedFile, { upsert: true, contentType: 'image/webp' })
        if (uploadError) throw uploadError
        const { data: publicUrlData } = supabase.storage
          .from('kinit-files-01')
          .getPublicUrl(fileName)
        uploadedImages.push({
          simulation_image_path: fileName,
          simulation_image_name: generatedFileName,
          simulation_image_url: publicUrlData.publicUrl,
          image_file_design_size: compressedFile.size,
        })
      }

      const newDesignImage = [...currentImages, ...uploadedImages]
      setValue('image_file_design', newDesignImage, { shouldDirty: true })
    } catch (err) {
      setSimUploadError(err.message || 'Error al subir la imagen')
    } finally {
      setSimUploading(false)
      e.target.value = ''
    }
  }

  const handlePdsUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const MAX_SIZE_MB = 20
    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setPdsUploadError(`El archivo ${file.name} supera el límite de ${MAX_SIZE_MB} MB`)
        e.target.value = ''
        return
      }
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
      const configurationId = id || 'new'
      const versionNumber = Number(currentVersion || 1)

      const currentFiles = watch('pds_file') || []

      const uploadedFiles = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const extension = file.name.includes('.') ? file.name.split('.').pop() : 'pds'
        const index = currentFiles.length + i + 1
        const generatedFileName = `${dd}${mm}${yyyy}-${hh}${min}${ss}-${configurationId}-v${versionNumber}-${index}.${extension}`
        const fileName = `PROCESSED/PDS/${yyyy}/${mm}/${dd}/${generatedFileName}`
        const { error: uploadError } = await supabase.storage
          .from('kinit-files-01')
          .upload(fileName, file, { upsert: true })
        if (uploadError) throw uploadError
        const { data: publicUrlData } = supabase.storage
          .from('kinit-files-01')
          .getPublicUrl(fileName)
        uploadedFiles.push({
          id: crypto.randomUUID(),
          pds_file_path: fileName,
          pds_file_name: generatedFileName,
          pds_file_url: publicUrlData.publicUrl,
          pds_file_size: file.size,
        })
      }

      const newPdsFile = [...currentFiles, ...uploadedFiles]
      setValue('pds_file', newPdsFile, { shouldDirty: true })
    } catch (err) {
      setPdsUploadError(err.message || 'Error al subir el archivo PDS')
    } finally {
      setPdsUploading(false)
      e.target.value = ''
    }
  }

  const handleHcdUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const MAX_SIZE_MB = 20
    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setHcdUploadError(`El archivo ${file.name} supera el límite de ${MAX_SIZE_MB} MB`)
        e.target.value = ''
        return
      }
    }

    setHcdUploadError('')
    setHcdUploading(true)
    try {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const hh = String(now.getHours()).padStart(2, '0')
      const min = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      const configurationId = id || 'new'
      const versionNumber = Number(currentVersion || 1)

      const currentFiles = watch('hcd_file') || []

      const uploadedFiles = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const extension = file.name.includes('.') ? file.name.split('.').pop() : 'hcd'
        const index = currentFiles.length + i + 1
        const generatedFileName = `${dd}${mm}${yyyy}-${hh}${min}${ss}-${configurationId}-v${versionNumber}-${index}.${extension}`
        const fileName = `PROCESSED/HCD/${yyyy}/${mm}/${dd}/${generatedFileName}`
        const { error: uploadError } = await supabase.storage
          .from('kinit-files-01')
          .upload(fileName, file, { upsert: true })
        if (uploadError) throw uploadError
        const { data: publicUrlData } = supabase.storage
          .from('kinit-files-01')
          .getPublicUrl(fileName)
        uploadedFiles.push({
          id: crypto.randomUUID(),
          hcd_file_path: fileName,
          hcd_file_name: generatedFileName,
          hcd_file_url: publicUrlData.publicUrl,
          hcd_file_size: file.size,
        })
      }

      const newHcdFile = [...currentFiles, ...uploadedFiles]
      setValue('hcd_file', newHcdFile, { shouldDirty: true })
    } catch (err) {
      setHcdUploadError(err.message || 'Error al subir el archivo HCD')
    } finally {
      setHcdUploading(false)
      e.target.value = ''
    }
  }

  const onSubmit = async (data) => {
    // Validar guía de hilos
    const threads = data.thread_guide || []
    if (threads.length > 0) {
      const tErrors = threads.map((row) => ({
        thread_number: row.thread_number === '' || row.thread_number === null || row.thread_number === undefined,
        figure: !row.figure || !row.figure.trim(),
        color: !row.color || row.color === '#000000' && false,
      }))
      // color siempre tiene default, validar que no sea vacío
      const tErrorsFinal = threads.map((row) => ({
        thread_number: row.thread_number === '' || row.thread_number === null || row.thread_number === undefined,
        figure: !row.figure || !String(row.figure).trim(),
        color: !row.color || !String(row.color).trim(),
      }))
      const hasThreadErrors = tErrorsFinal.some((e) => e.thread_number || e.figure || e.color)
      setThreadGuideErrors(tErrorsFinal)
      if (hasThreadErrors) return
    } else {
      setThreadGuideErrors([])
    }

    // Validar densidades
    const densities = data.stitch_density || []
    if (densities.length > 0) {
      const errors = densities.map((row) => ({
        position: row.position === '' || row.position === null || row.position === undefined,
        density_type: !row.density_type,
      }))
      const hasErrors = errors.some((e) => e.position || e.density_type)
      setDensityErrors(errors)
      if (hasErrors) return
    } else {
      setDensityErrors([])
    }

    try {
      if (isEditMode && isNewVersioning) {
        // Nueva versión: crear un nuevo registro con versión incrementada
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
          hqpds_id: createdConfiguration.hqpds_id ?? '',
          design_name: createdConfiguration.design_name ?? '',
          garment_type: createdConfiguration.garment_type ?? '',
          garment_size: createdConfiguration.garment_size ?? '',
          description: createdConfiguration.description ?? '',
          creation_date: createdConfiguration.creation_date
            ? new Date(createdConfiguration.creation_date).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          last_modified_date: createdConfiguration.last_modified_date
            ? new Date(createdConfiguration.last_modified_date).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          version: createdConfiguration.version ?? 1,
          image_file_design: Array.isArray(createdConfiguration.image_file_design) ? createdConfiguration.image_file_design : [],
          pds_file: Array.isArray(createdConfiguration.pds_file) ? createdConfiguration.pds_file : [],
          hcd_file: Array.isArray(createdConfiguration.hcd_file) ? createdConfiguration.hcd_file : [],
          configuration_mode: createdConfiguration.configuration_mode ?? '',
          estimated_knitting_time: createdConfiguration.estimated_knitting_time ?? '',
          thread_guide: Array.isArray(createdConfiguration.thread_guide) ? createdConfiguration.thread_guide : [],
          stitch_density: Array.isArray(createdConfiguration.stitch_density) ? createdConfiguration.stitch_density : [],
          created_by_user: sessionUserName || createdConfiguration.created_by_user || '',
          is_active: createdConfiguration.is_active ?? true,
        })
        setValue('version', createdConfiguration.version, { shouldDirty: false })
        setIsEditingMode(false)
        setIsNewVersioning(false)
        navigate(`/configuraciones/editar/${createdConfiguration.id}`)
        return
      } else if (isEditMode && isEditingMode) {
        // Editar: actualizar sobre la misma versión
        const hasChanges = isDirty && Object.keys(dirtyFields || {}).length > 0
        if (!hasChanges) {
          setShowNoChangesModal(true)
          return
        }

        const updatedConfiguration = await updateMutation.mutateAsync({ id, data })
        reset({
          hqpds_id: updatedConfiguration.hqpds_id ?? '',
          design_name: updatedConfiguration.design_name ?? '',
          garment_type: updatedConfiguration.garment_type ?? '',
          garment_size: updatedConfiguration.garment_size ?? '',
          description: updatedConfiguration.description ?? '',
          creation_date: updatedConfiguration.creation_date
            ? new Date(updatedConfiguration.creation_date).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          last_modified_date: updatedConfiguration.last_modified_date
            ? new Date(updatedConfiguration.last_modified_date).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          version: updatedConfiguration.version ?? 1,
          image_file_design: Array.isArray(updatedConfiguration.image_file_design) ? updatedConfiguration.image_file_design : [],
          pds_file: Array.isArray(updatedConfiguration.pds_file) ? updatedConfiguration.pds_file : [],
          hcd_file: Array.isArray(updatedConfiguration.hcd_file) ? updatedConfiguration.hcd_file : [],
          configuration_mode: updatedConfiguration.configuration_mode ?? '',
          estimated_knitting_time: updatedConfiguration.estimated_knitting_time ?? '',
          thread_guide: Array.isArray(updatedConfiguration.thread_guide) ? updatedConfiguration.thread_guide : [],
          stitch_density: Array.isArray(updatedConfiguration.stitch_density) ? updatedConfiguration.stitch_density : [],
          created_by_user: sessionUserName || updatedConfiguration.created_by_user || '',
          is_active: updatedConfiguration.is_active ?? true,
        })
        setValue('version', updatedConfiguration.version, { shouldDirty: false })
        setIsEditingMode(false)
        return
      } else {
        // Crear nueva configuración
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

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending
  const hasChangesInEdit = isDirty && Object.keys(dirtyFields || {}).length > 0
  const isSaveDisabled = isLoading || (isEditMode && (isEditingMode || isNewVersioning) && !hasChangesInEdit)

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
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ID HQPDS"
                value={watch('hqpds_id') || '—'}
                InputProps={{ readOnly: true }}
                disabled
                helperText="Generado automáticamente"
              />
              <input type="hidden" {...register('hqpds_id')} />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                {...register('design_name', { required: 'Nombre de diseño es requerido' })}
                fullWidth
                label="Nombre de diseño *"
                disabled={isFieldDisabled('design_name')}
                error={!!errors.design_name}
                helperText={errors.design_name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.garment_type} disabled={isFieldDisabled('garment_type')}>
                <InputLabel>Tipo de prenda</InputLabel>
                <Controller
                  name="garment_type"
                  control={control}
                  rules={{ required: 'Tipo de prenda requerido' }}
                  render={({ field }) => (
                    <Select {...field} label="Tipo de prenda">
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
              <FormControl fullWidth disabled={isFieldDisabled('garment_size')}>
                <InputLabel>Talla</InputLabel>
                <Select {...register('garment_size')} label="Talla" defaultValue="">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
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

          {sectionTitle('Carga de archivos')}
          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            Imagen
          </Typography>
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
                  {simUploading ? 'Subiendo...' : 'Cargar imágenes'}
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageUpload}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  PNG, JPG o WebP (máx 10 MB). Se convierten a WebP 1920px automáticamente.
                </Typography>
                {simUploadError && (
                  <Typography variant="caption" color="error">{simUploadError}</Typography>
                )}
              </Box>
            </Grid>

            {/* Galería de imágenes cargadas */}
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {(watch('image_file_design') || []).length > 0 ? (
                  (watch('image_file_design')).map((img, idx) => (
                    <Box
                      key={idx}
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
                        src={img.simulation_image_url}
                        alt={img.simulation_image_name}
                        sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                      />
                      <Box sx={{ overflow: 'hidden', flex: 1 }}>
                        <Typography variant="caption" color="primary" fontWeight={600}>
                          Imagen {idx + 1}
                        </Typography>
                        <Typography variant="body2" noWrap fontWeight={500}>
                          {img.simulation_image_name}
                        </Typography>
                        {img.image_file_design_size && (
                          <Typography variant="caption" color="text.secondary">
                            {(Number(img.image_file_design_size) / 1024).toFixed(1)} KB
                          </Typography>
                        )}
                      </Box>
                      <Button
                        type="button"
                        size="small"
                        href={img.simulation_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ flexShrink: 0 }}
                      >
                        Ver
                      </Button>
                      {!isFieldDisabled('image_file_design') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            const current = watch('image_file_design') || []
                            setValue('image_file_design', current.filter((_, i) => i !== idx), { shouldDirty: true })
                          }}
                          title="Eliminar imagen"
                        >
                          <DeleteRowIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No hay imágenes cargadas
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
            Archivo PDS
          </Typography>
          <Grid container spacing={2} alignItems="center">
            {/* Botón de carga */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  type="button"
                  variant="outlined"
                  component="label"
                  startIcon={pdsUploading ? <CircularProgress size={18} /> : <UploadFileIcon />}
                  disabled={isFieldDisabled('pds_file') || pdsUploading}
                  sx={{ height: 56 }}
                >
                  {pdsUploading ? 'Subiendo...' : 'Cargar archivo PDS'}
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handlePdsUpload}
                  />
                </Button>
                {pdsUploadError && (
                  <Typography variant="caption" color="error">{pdsUploadError}</Typography>
                )}
              </Box>
            </Grid>

            {/* Lista de archivos PDS subidos */}
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(watch('pds_file') || []).length > 0 ? (
                  (watch('pds_file') || []).map((pds, idx) => (
                    <Box
                      key={pds.id || idx}
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
                      <Box sx={{ overflow: 'hidden', flex: 1 }}>
                        <Typography variant="caption" color="primary" fontWeight={600}>
                          PDS {idx + 1}
                        </Typography>
                        <Typography variant="body2" noWrap fontWeight={500}>
                          {pds.pds_file_name}
                        </Typography>
                        {pds.pds_file_size && (
                          <Typography variant="caption" color="text.secondary">
                            {(Number(pds.pds_file_size) / 1024).toFixed(1)} KB
                          </Typography>
                        )}
                      </Box>
                      {pds.pds_file_url && (
                        <Button
                          type="button"
                          size="small"
                          href={pds.pds_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ flexShrink: 0 }}
                        >
                          Ver
                        </Button>
                      )}
                      {!isFieldDisabled('pds_file') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            const current = watch('pds_file') || []
                            setValue('pds_file', current.filter((_, i) => i !== idx), { shouldDirty: true })
                          }}
                          title="Eliminar archivo PDS"
                        >
                          <DeleteRowIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No hay archivos PDS cargados
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
            Archivo HCD
          </Typography>
          <Grid container spacing={2} alignItems="center">
            {/* Botón de carga */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  type="button"
                  variant="outlined"
                  component="label"
                  startIcon={hcdUploading ? <CircularProgress size={18} /> : <UploadFileIcon />}
                  disabled={isFieldDisabled('hcd_file') || hcdUploading}
                  sx={{ height: 56 }}
                >
                  {hcdUploading ? 'Subiendo...' : 'Cargar archivo HCD'}
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleHcdUpload}
                  />
                </Button>
                {hcdUploadError && (
                  <Typography variant="caption" color="error">{hcdUploadError}</Typography>
                )}
              </Box>
            </Grid>

            {/* Lista de archivos HCD subidos */}
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(watch('hcd_file') || []).length > 0 ? (
                  (watch('hcd_file') || []).map((hcd, idx) => (
                    <Box
                      key={hcd.id || idx}
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
                      <Box sx={{ overflow: 'hidden', flex: 1 }}>
                        <Typography variant="caption" color="primary" fontWeight={600}>
                          HCD {idx + 1}
                        </Typography>
                        <Typography variant="body2" noWrap fontWeight={500}>
                          {hcd.hcd_file_name}
                        </Typography>
                        {hcd.hcd_file_size && (
                          <Typography variant="caption" color="text.secondary">
                            {(Number(hcd.hcd_file_size) / 1024).toFixed(1)} KB
                          </Typography>
                        )}
                      </Box>
                      {hcd.hcd_file_url && (
                        <Button
                          type="button"
                          size="small"
                          href={hcd.hcd_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ flexShrink: 0 }}
                        >
                          Ver
                        </Button>
                      )}
                      {!isFieldDisabled('hcd_file') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            const current = watch('hcd_file') || []
                            setValue('hcd_file', current.filter((_, i) => i !== idx), { shouldDirty: true })
                          }}
                          title="Eliminar archivo HCD"
                        >
                          <DeleteRowIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No hay archivos HCD cargados
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {sectionTitle('Parámetros técnicos')}
          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            Guía de hilos
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 90 }}>Nro hilo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Figura</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 160 }}>Color</TableCell>
                  {!isFieldDisabled('thread_guide') && (
                    <TableCell sx={{ fontWeight: 600, width: 70 }} align="center">Acción</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {(watch('thread_guide') || []).map((row, index) => (
                  <TableRow key={row.id || index}>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.thread_number ?? ''}
                        disabled={isFieldDisabled('thread_guide')}
                        error={!!threadGuideErrors[index]?.thread_number}
                        helperText={threadGuideErrors[index]?.thread_number ? 'Requerido' : ''}
                        onChange={(e) => {
                          const updated = [...(watch('thread_guide') || [])]
                          updated[index] = { ...updated[index], thread_number: e.target.value ? Number(e.target.value) : '' }
                          setValue('thread_guide', updated, { shouldDirty: true })
                          setThreadGuideErrors((prev) => {
                            const copy = [...prev]
                            if (copy[index]) copy[index] = { ...copy[index], thread_number: false }
                            return copy
                          })
                        }}
                        fullWidth
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.figure ?? ''}
                        disabled={isFieldDisabled('thread_guide')}
                        error={!!threadGuideErrors[index]?.figure}
                        helperText={threadGuideErrors[index]?.figure ? 'Requerido' : ''}
                        onChange={(e) => {
                          const updated = [...(watch('thread_guide') || [])]
                          updated[index] = { ...updated[index], figure: e.target.value }
                          setValue('thread_guide', updated, { shouldDirty: true })
                          setThreadGuideErrors((prev) => {
                            const copy = [...prev]
                            if (copy[index]) copy[index] = { ...copy[index], figure: false }
                            return copy
                          })
                        }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          onClick={(e) => {
                            if (!isFieldDisabled('thread_guide')) {
                              setColorPickerIndex(index)
                              setColorPickerAnchor(e.currentTarget)
                            }
                          }}
                          sx={{
                            width: 36,
                            height: 32,
                            bgcolor: row.color || '#000000',
                            border: '2px solid',
                            borderColor: threadGuideErrors[index]?.color ? 'error.main' : 'divider',
                            borderRadius: 1,
                            cursor: isFieldDisabled('thread_guide') ? 'default' : 'pointer',
                            flexShrink: 0,
                            '&:hover': !isFieldDisabled('thread_guide') ? { borderColor: 'primary.main' } : {},
                          }}
                        />
                        <TextField
                          size="small"
                          value={row.color || '#000000'}
                          disabled={isFieldDisabled('thread_guide')}
                          error={!!threadGuideErrors[index]?.color}
                          helperText={threadGuideErrors[index]?.color ? 'Requerido' : ''}
                          onChange={(e) => {
                            let val = e.target.value
                            if (!val.startsWith('#')) val = '#' + val
                            const updated = [...(watch('thread_guide') || [])]
                            updated[index] = { ...updated[index], color: val }
                            setValue('thread_guide', updated, { shouldDirty: true })
                            setThreadGuideErrors((prev) => {
                              const copy = [...prev]
                              if (copy[index]) copy[index] = { ...copy[index], color: false }
                              return copy
                            })
                          }}
                          inputProps={{ maxLength: 7, style: { fontFamily: 'monospace', fontSize: 13 } }}
                          sx={{ width: 100 }}
                        />
                      </Box>
                    </TableCell>
                    {!isFieldDisabled('thread_guide') && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            const updated = (watch('thread_guide') || []).filter((_, i) => i !== index)
                            setValue('thread_guide', updated, { shouldDirty: true })
                          }}
                        >
                          <DeleteRowIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {(watch('thread_guide') || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isFieldDisabled('thread_guide') ? 3 : 4} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                        No hay hilos registrados
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {!isFieldDisabled('thread_guide') && (
            <Button
              type="button"
              size="small"
              startIcon={<AddCircleOutlineIcon />}
              disabled={(watch('thread_guide') || []).length >= 30}
              onClick={() => {
                const current = watch('thread_guide') || []
                if (current.length < 30) {
                  const newId = current.length > 0 ? Math.max(...current.map((r) => r.id || 0)) + 1 : 1
                  setValue('thread_guide', [...current, { id: newId, thread_number: '', figure: '', color: '#000000' }], { shouldDirty: true })
                }
              }}
            >
              Agregar hilo {(watch('thread_guide') || []).length}/30
            </Button>
          )}

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
            Densidad de punto
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 120 }}>Stitch</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Zona de tejido</TableCell>
                  {!isFieldDisabled('stitch_density') && (
                    <TableCell sx={{ fontWeight: 600, width: 70 }} align="center">Acción</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {(watch('stitch_density') || []).map((row, index) => (
                  <TableRow key={row.id || index}>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.position ?? ''}
                        disabled={isFieldDisabled('stitch_density')}
                        error={!!densityErrors[index]?.position}
                        helperText={densityErrors[index]?.position ? 'Requerido' : ''}
                        onChange={(e) => {
                          const updated = [...(watch('stitch_density') || [])]
                          updated[index] = { ...updated[index], position: e.target.value ? Number(e.target.value) : '' }
                          setValue('stitch_density', updated, { shouldDirty: true })
                          setDensityErrors((prev) => {
                            const copy = [...prev]
                            if (copy[index]) copy[index] = { ...copy[index], position: false }
                            return copy
                          })
                        }}
                        fullWidth
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={row.density_type ?? ''}
                        disabled={isFieldDisabled('stitch_density')}
                        error={!!densityErrors[index]?.density_type}
                        onChange={(e) => {
                          const updated = [...(watch('stitch_density') || [])]
                          updated[index] = { ...updated[index], density_type: e.target.value }
                          setValue('stitch_density', updated, { shouldDirty: true })
                          setDensityErrors((prev) => {
                            const copy = [...prev]
                            if (copy[index]) copy[index] = { ...copy[index], density_type: false }
                            return copy
                          })
                        }}
                        fullWidth
                        displayEmpty
                      >
                        <MenuItem value=""><em>— Seleccionar —</em></MenuItem>
                        {DENSITY_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                      {densityErrors[index]?.density_type && (
                        <FormHelperText error>Requerido</FormHelperText>
                      )}
                    </TableCell>
                    {!isFieldDisabled('stitch_density') && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            const updated = (watch('stitch_density') || []).filter((_, i) => i !== index)
                            setValue('stitch_density', updated, { shouldDirty: true })
                          }}
                        >
                          <DeleteRowIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {(watch('stitch_density') || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isFieldDisabled('stitch_density') ? 2 : 3} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                        No hay densidades registradas
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {!isFieldDisabled('stitch_density') && (
            <Button
              type="button"
              size="small"
              startIcon={<AddCircleOutlineIcon />}
              disabled={(watch('stitch_density') || []).length >= 30}
              onClick={() => {
                const current = watch('stitch_density') || []
                if (current.length < 30) {
                  const newId = current.length > 0 ? Math.max(...current.map((r) => r.id || 0)) + 1 : 1
                  setValue('stitch_density', [...current, { id: newId, position: '', density_type: '' }], { shouldDirty: true })
                }
              }}
            >
              Agregar fila {(watch('stitch_density') || []).length}/30
            </Button>
          )}

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
            {isEditingMode || isNewVersioning || !isEditMode ? (
              /* Creando, editando o generando nueva versión */
              <>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSaveDisabled}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {isLoading
                    ? 'Guardando...'
                    : isNewVersioning
                      ? 'Guardar nueva versión'
                      : isEditMode
                        ? 'Guardar cambios'
                        : 'Crear configuración'}
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
                      setIsNewVersioning(false)
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
                  variant="contained"
                  color="secondary"
                  startIcon={<AddCircleOutline />}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsNewVersioning(true)
                  }}
                >
                  Nueva versión
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

      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={() => { setColorPickerAnchor(null); setColorPickerIndex(null) }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, width: 260 }}>
          <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
            Seleccionar color
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {COLOR_PALETTE.map((color) => (
              <Box
                key={color}
                onClick={() => {
                  if (colorPickerIndex !== null) {
                    const updated = [...(watch('thread_guide') || [])]
                    updated[colorPickerIndex] = { ...updated[colorPickerIndex], color }
                    setValue('thread_guide', updated, { shouldDirty: true })
                  }
                  setColorPickerAnchor(null)
                  setColorPickerIndex(null)
                }}
                sx={{
                  width: 22,
                  height: 22,
                  bgcolor: color,
                  borderRadius: 0.5,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: color === '#FFFFFF' || color === '#F3F3F3' || color === '#EFEFEF' ? 'grey.400' : 'transparent',
                  '&:hover': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 1 },
                }}
              />
            ))}
          </Box>
        </Box>
      </Popover>

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
