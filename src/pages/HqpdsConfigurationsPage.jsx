import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
  Popover,
  FormControlLabel,
  Switch,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  WarningAmberRounded as WarningIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  AccessTime as AccessTimeIcon,
  Settings as SettingsIcon,
  RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { useGetHqpdsConfigurations } from '../hooks/queries'
import { useDeleteHqpdsConfigurationMutation, useRestoreHqpdsConfigurationMutation } from '../hooks/mutations'
import { useHeaderActions } from '../components/HeaderActionsContext'
import { useAuthStore } from '../store/authStore'

export const HqpdsConfigurationsPage = () => {
  const navigate = useNavigate()
  const { setActions, clearActions } = useHeaderActions()
  const user = useAuthStore((state) => state.user)
  const userRole = useAuthStore((state) => state.userRole)
  const filterByUserId = userRole === 'usuario' ? user?.id : null
  const [searchText, setSearchText] = useState('')
  const [optionsAnchor, setOptionsAnchor] = useState(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [filterGarmentType, setFilterGarmentType] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [previewImages, setPreviewImages] = useState(null)
  const [starred, setStarred] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hqpds-starred') || '[]')
    } catch { return [] }
  })
  const [filterStarred, setFilterStarred] = useState(false)
  const [filterRecent, setFilterRecent] = useState(false)

  const { data: items = [], isLoading } = useGetHqpdsConfigurations(filterByUserId, showDeleted)
  const deleteMutation = useDeleteHqpdsConfigurationMutation()
  const restoreMutation = useRestoreHqpdsConfigurationMutation()

  useEffect(() => {
    setActions(
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/programas/nueva')}
        sx={{ bgcolor: '#1e1e1e', '&:hover': { bgcolor: '#333' }, '& .MuiButton-startIcon': { transition: 'transform 0.3s' }, '&:hover .MuiButton-startIcon': { transform: 'rotate(90deg)' } }}
      >
        Nuevo Programa
      </Button>
    )
    return () => clearActions()
  }, [setActions, clearActions, navigate])

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.design_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.created_by_user?.toLowerCase().includes(searchText.toLowerCase())
    const matchesGarmentType = !filterGarmentType || item.garment_type === filterGarmentType
    const matchesActive =
      !filterActive ||
      (filterActive === 'activa' ? Boolean(item.is_active) : !Boolean(item.is_active))

    return matchesSearch && matchesGarmentType && matchesActive
  })

  const filteredAfterStarred = filterStarred ? filtered.filter((item) => starred.includes(item.id)) : filtered
  const filteredFinal = filterRecent
    ? [...filteredAfterStarred].sort((a, b) => new Date(b.updated_at || b.creation_date) - new Date(a.updated_at || a.creation_date)).slice(0, 10)
    : filteredAfterStarred

  const toggleStar = (id) => {
    setStarred((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      localStorage.setItem('hqpds-starred', JSON.stringify(next))
      return next
    })
  }

  const handleDeleteClick = (row) => {
    setSelectedItem(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync(selectedItem.id)
    setDeleteDialogOpen(false)
    setSelectedItem(null)
  }

  const handleRestore = async (row) => {
    await restoreMutation.mutateAsync(row.id)
  }

  const columns = [
    { field: 'hqpds_id', headerName: 'ID HQPDS', width: 90, align: 'center', headerAlign: 'center' },
    { field: 'design_name', headerName: 'Diseño', flex: 1, minWidth: 180 },
    {
      field: 'starred',
      headerName: '',
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const isStarred = starred.includes(params.row.id)
        return (
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); toggleStar(params.row.id) }}
            title={isStarred ? 'Quitar destacado' : 'Destacar'}
            sx={{
              color: isStarred ? '#1e1e1e' : 'action.disabled',
              opacity: isStarred ? 1 : 0,
              transition: 'opacity 0.15s',
              '.MuiDataGrid-row:hover &': { opacity: 1 },
            }}
          >
            {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
          </IconButton>
        )
      },
    },
    { field: 'garment_type', headerName: 'Tipo de prenda', width: 120, align: 'center', headerAlign: 'center', valueFormatter: (value) => value || '-' },
    { field: 'version', headerName: 'Versión', width: 70, align: 'center', headerAlign: 'center' },
    { field: 'configuration_mode', headerName: 'Modo', width: 100, align: 'center', headerAlign: 'center' },
    {
      field: 'is_active',
      headerName: 'Estado',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activa' : 'Inactiva'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'updated_at',
      headerName: 'Última modificación',
      width: 170,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => {
        if (!value) return '-'
        const [date, time] = value.slice(0, 16).split('T')
        const [y, m, d] = date.split('-')
        return `${d}/${m}/${y} ${time || ''}`
      },
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {params.row.deleted_at ? (
            <Tooltip title="Restaurar">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleRestore(params.row) }}
                color="primary"
              >
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); navigate(`/programas/editar/${params.row.id}`) }}
                title="Editar"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleDeleteClick(params.row) }}
                title="Eliminar"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              {Array.isArray(params.row.image_file_design) && params.row.image_file_design.length > 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setPreviewImages(params.row.image_file_design) }}
                  title="Ver imágenes"
                >
                  <ImageIcon fontSize="small" />
                </IconButton>
              )}
            </>
          )}
        </Box>
      ),
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>Todos los programas</Typography>
        <Tooltip title="Más opciones">
          <IconButton size="small" sx={{ ml: 1 }} onClick={(e) => setOptionsAnchor(e.currentTarget)}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(optionsAnchor)}
          anchorEl={optionsAnchor}
          onClose={() => setOptionsAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 2 }}>
            <FormControlLabel
              control={<Switch checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} size="small" />}
              label="Mostrar eliminados"
            />
          </Box>
        </Popover>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flex: 1, minWidth: 280 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel size="small">Tipo de prenda</InputLabel>
          <Select
            value={filterGarmentType}
            label="Tipo de prenda"
            onChange={(e) => setFilterGarmentType(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Libre - LIB">Libre</MenuItem>
            <MenuItem value="Todo - TOD">Todo</MenuItem>
            <MenuItem value="Manga - MAN">Manga</MenuItem>
            <MenuItem value="Pecho - PEC">Pecho</MenuItem>
            <MenuItem value="Espalda - ESP">Espalda</MenuItem>
            <MenuItem value="Cuello - CUE">Cuello</MenuItem>
            <MenuItem value="Bolsillo - BOL">Bolsillo</MenuItem>
            <MenuItem value="Chalina - CHA">Chalina</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel size="small">Estado</InputLabel>
          <Select
            value={filterActive}
            label="Estado"
            onChange={(e) => setFilterActive(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="activa">Activa</MenuItem>
            <MenuItem value="inactiva">Inactiva</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Chip
          icon={<StarIcon sx={{ color: filterStarred ? '#fff !important' : 'action.disabled' }} fontSize="small" />}
          label="Destacados"
          onClick={() => setFilterStarred(!filterStarred)}
          sx={{
            px: 0.5,
            fontWeight: 500,
            bgcolor: filterStarred ? '#1e1e1e' : '#f3f2eb',
            color: filterStarred ? '#fff' : 'text.primary',
            borderColor: filterStarred ? '#1e1e1e' : 'divider',
            '&:hover': {
              bgcolor: filterStarred ? '#333' : '#e8e7e0',
            },
          }}
          variant={filterStarred ? 'filled' : 'outlined'}
        />

        <Chip
          icon={<AccessTimeIcon sx={{ color: filterRecent ? '#fff !important' : 'action.disabled' }} fontSize="small" />}
          label="Recientes"
          onClick={() => setFilterRecent(!filterRecent)}
          sx={{
            px: 0.5,
            fontWeight: 500,
            bgcolor: filterRecent ? '#1e1e1e' : '#f3f2eb',
            color: filterRecent ? '#fff' : 'text.primary',
            borderColor: filterRecent ? '#1e1e1e' : 'divider',
            '&:hover': {
              bgcolor: filterRecent ? '#333' : '#e8e7e0',
            },
          }}
          variant={filterRecent ? 'filled' : 'outlined'}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredFinal}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              columns: {
                columnVisibilityModel: {
                  configuration_mode: false,
                  is_active: false,
                },
              },
            }}
            disableSelectionOnClick
            onRowClick={(params) => !params.row.deleted_at && navigate(`/programas/editar/${params.row.id}`)}
            getRowClassName={(params) => params.row.deleted_at ? 'deleted-row' : ''}
            sx={{ cursor: 'pointer', border: 'none', '& .deleted-row': { opacity: 0.45, bgcolor: 'action.hover' } }}
          />
        )}
      </Box>

      <Dialog
        open={Boolean(previewImages)}
        onClose={() => setPreviewImages(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 2, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Imágenes de diseño ({previewImages?.length || 0})
            </Typography>
            <IconButton
              onClick={() => setPreviewImages(null)}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          {previewImages && (
            <ImageList variant="quilted" cols={previewImages.length === 1 ? 1 : 3} gap={8} rowHeight={200}>
              {previewImages.map((img, idx) => {
                const colSpan = previewImages.length === 1 ? 1 : idx === 0 ? 2 : 1
                const rowSpan = previewImages.length === 1 ? 2 : idx === 0 ? 2 : 1
                return (
                  <ImageListItem key={idx} cols={colSpan} rows={rowSpan}>
                    <img
                      src={img.simulation_image_url}
                      alt={img.simulation_image_name || `Imagen ${idx + 1}`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                      onClick={() => window.open(img.simulation_image_url, '_blank')}
                    />
                    <ImageListItemBar
                      title={img.simulation_image_name || `Imagen ${idx + 1}`}
                      subtitle={img.image_file_design_size ? `${(Number(img.image_file_design_size) / 1024).toFixed(1)} KB` : ''}
                      sx={{ borderRadius: '0 0 8px 8px' }}
                    />
                  </ImageListItem>
                )
              })}
            </ImageList>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(211,47,47,0.15)' : '#fdecea',
            }}
          >
            <WarningIcon sx={{ fontSize: 36, color: 'error.main' }} />
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            ¿Eliminar programa?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estás a punto de eliminar <strong>{selectedItem?.design_name}</strong>.
            Esta acción eliminará también los parámetros relacionados (máquina, tejido, materiales y prendas).
          </Typography>
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ minWidth: 120, borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            sx={{ minWidth: 120, borderRadius: 2 }}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
