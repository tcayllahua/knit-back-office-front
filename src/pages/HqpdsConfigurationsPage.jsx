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
import { useGetHqpdsConfigurations } from '../hooks/queries'
import { useDeleteHqpdsConfigurationMutation } from '../hooks/mutations'

export const HqpdsConfigurationsPage = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [filterMode, setFilterMode] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

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
    { field: 'design_name', headerName: 'Diseño', flex: 1, minWidth: 180 },
    { field: 'version', headerName: 'Versión', width: 90 },
    { field: 'configuration_mode', headerName: 'Modo', width: 140 },
    { field: 'estimated_knitting_time', headerName: 'Tiempo Est. (min)', width: 140 },
    { field: 'created_by_user', headerName: 'Creado por', width: 150 },
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
      width: 120,
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
          <IconButton
            size="small"
            onClick={() => navigate(`/configuraciones/editar/${params.row.id}`)}
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
          />
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar la configuración "{selectedItem?.design_name}"? Esta acción eliminará también parámetros relacionados (máquina, tejido, materiales y prendas).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
