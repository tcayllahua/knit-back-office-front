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
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { useGetGarmentParameters } from '../hooks/queries'
import { useDeleteGarmentParameterMutation } from '../hooks/mutations'

const COMPLEXITY_COLOR = {
  simple: 'success',
  medio: 'warning',
  complejo: 'error',
}

export const GarmentParametersPage = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSize, setFilterSize] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data: garments = [], isLoading } = useGetGarmentParameters()
  const deleteMutation = useDeleteGarmentParameterMutation()

  const filtered = garments.filter((g) => {
    const matchesSearch =
      g.garment_type?.toLowerCase().includes(searchText.toLowerCase()) ||
      g.garment_model?.toLowerCase().includes(searchText.toLowerCase())
    const matchesType = !filterType || g.garment_type === filterType
    const matchesSize = !filterSize || g.size === filterSize
    return matchesSearch && matchesType && matchesSize
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
    { field: 'garment_order', headerName: 'Orden', width: 80 },
    { field: 'garment_type', headerName: 'Tipo', flex: 1, minWidth: 120 },
    { field: 'garment_model', headerName: 'Modelo', flex: 1, minWidth: 120 },
    { field: 'size', headerName: 'Talla', width: 80 },
    { field: 'finishing_type', headerName: 'Terminado', flex: 1, minWidth: 130 },
    {
      field: 'pattern_complexity',
      headerName: 'Complejidad',
      width: 130,
      renderCell: (params) =>
        params.value ? (
          <Chip
            label={params.value}
            color={COMPLEXITY_COLOR[params.value] || 'default'}
            size="small"
          />
        ) : null,
    },
    {
      field: 'is_main_piece',
      headerName: 'Pieza Principal',
      width: 130,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Principal" color="primary" size="small" />
        ) : null,
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/prendas/editar/${params.row.id}`)}
            title="Editar"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(params.row)}
            title="Eliminar"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/prendas/nueva')}
        >
          Nuevo Parámetro
        </Button>

        <TextField
          placeholder="Buscar por tipo o modelo"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 220 }}
        />

        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel size="small">Tipo</InputLabel>
          <Select
            value={filterType}
            label="Tipo"
            onChange={(e) => setFilterType(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="manga">Manga</MenuItem>
            <MenuItem value="pecho">Pecho</MenuItem>
            <MenuItem value="espalda">Espalda</MenuItem>
            <MenuItem value="cuello">Cuello</MenuItem>
            <MenuItem value="bolsillo">Bolsillo</MenuItem>
            <MenuItem value="otra">Otra</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 110 }}>
          <InputLabel size="small">Talla</InputLabel>
          <Select
            value={filterSize}
            label="Talla"
            onChange={(e) => setFilterSize(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todas</MenuItem>
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableSelectionOnClick
          />
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el parámetro "{selectedItem?.garment_type} — {selectedItem?.garment_model} ({selectedItem?.size})"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
