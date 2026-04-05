import { useState } from 'react'
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
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  WarningAmberRounded as WarningIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { useGetHqpdsConfigurations } from '../hooks/queries'
import { useDeleteHqpdsConfigurationMutation } from '../hooks/mutations'

export const HqpdsConfigurationsPage = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [filterMode, setFilterMode] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [previewImages, setPreviewImages] = useState(null)

  const { data: items = [], isLoading } = useGetHqpdsConfigurations()
  const deleteMutation = useDeleteHqpdsConfigurationMutation()

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.design_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.created_by_user?.toLowerCase().includes(searchText.toLowerCase())
    const matchesMode = !filterMode || item.configuration_mode === filterMode
    const matchesActive =
      !filterActive ||
      (filterActive === 'activa' ? Boolean(item.is_active) : !Boolean(item.is_active))

    return matchesSearch && matchesMode && matchesActive
  })

  const handleDeleteClick = (row) => {
    setSelectedItem(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync(selectedItem.id)
    setDeleteDialogOpen(false)
    setSelectedItem(null)
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'hqpds_id', headerName: 'ID HQPDS', width: 120 },
    { field: 'design_name', headerName: 'Diseño', flex: 1, minWidth: 180 },
    { field: 'garment_type', headerName: 'Tipo de prenda', width: 160, valueFormatter: (value) => value || '-' },
    { field: 'version', headerName: 'Versión', width: 90 },
    { field: 'configuration_mode', headerName: 'Modo', width: 140 },
    {
      field: 'is_active',
      headerName: 'Estado',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activa' : 'Inactiva'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'creation_date',
      headerName: 'Fecha de creación',
      width: 170,
      valueFormatter: (value) => (value ? new Date(value).toLocaleString('es-ES') : '-'),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      align: 'left',
      headerAlign: 'left',
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); navigate(`/configuraciones/editar/${params.row.id}`) }}
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
              color="primary"
            >
              <ImageIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/configuraciones/nueva')}>
          Nuevo Programa HQPDS
        </Button>

        <TextField
          placeholder="Buscar por diseño o usuario"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 240 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel size="small">Modo</InputLabel>
          <Select
            value={filterMode}
            label="Modo"
            onChange={(e) => setFilterMode(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="simulacion">Simulación</MenuItem>
            <MenuItem value="produccion">Producción</MenuItem>
            <MenuItem value="prueba">Prueba</MenuItem>
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

      <Box sx={{ height: 620, width: '100%' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableSelectionOnClick
            onRowClick={(params) => navigate(`/configuraciones/editar/${params.row.id}`)}
            sx={{ cursor: 'pointer' }}
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
            ¿Eliminar configuración?
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
