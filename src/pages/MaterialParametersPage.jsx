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
import { useGetMaterialParameters } from '../hooks/queries'
import { useDeleteMaterialParameterMutation } from '../hooks/mutations'
import { useHeaderActions } from '../components/HeaderActionsContext'
import { useAuthStore } from '../store/authStore'

export const MaterialParametersPage = () => {
  const navigate = useNavigate()
  const { setActions, clearActions } = useHeaderActions()
  const user = useAuthStore((state) => state.user)
  const userRole = useAuthStore((state) => state.userRole)
  const filterByUserId = userRole === 'usuario' ? user?.id : null
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterUnit, setFilterUnit] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data: items = [], isLoading } = useGetMaterialParameters(filterByUserId)
  const deleteMutation = useDeleteMaterialParameterMutation()

  useEffect(() => {
    setActions(
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/materiales/nueva')}
        sx={{ bgcolor: '#1e1e1e', '&:hover': { bgcolor: '#333' }, '& .MuiButton-startIcon': { transition: 'transform 0.3s' }, '&:hover .MuiButton-startIcon': { transform: 'rotate(90deg)' } }}
      >
        Nuevo Material
      </Button>
    )
    return () => clearActions()
  }, [setActions, clearActions, navigate])

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.yarn_type?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.yarn_brand?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.yarn_color?.toLowerCase().includes(searchText.toLowerCase())
    const matchesType = !filterType || item.yarn_type === filterType
    const matchesUnit = !filterUnit || item.quantity_unit === filterUnit
    return matchesSearch && matchesType && matchesUnit
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
    { field: 'material_order', headerName: 'Orden', width: 80 },
    { field: 'yarn_type', headerName: 'Tipo de hilo', flex: 1, minWidth: 140 },
    { field: 'yarn_weight', headerName: 'Peso', width: 120 },
    { field: 'yarn_color', headerName: 'Color', width: 120 },
    { field: 'yarn_brand', headerName: 'Marca', width: 130 },
    { field: 'yarn_count', headerName: 'Numeración', width: 120 },
    { field: 'quantity_used', headerName: 'Cantidad', width: 110 },
    { field: 'quantity_unit', headerName: 'Unidad', width: 90 },
    { field: 'cost_per_unit', headerName: 'Costo/u', width: 100 },
    {
      field: 'is_primary',
      headerName: 'Primario',
      width: 100,
      renderCell: (params) => (params.value ? <Chip label="Sí" color="success" size="small" /> : null),
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
            onClick={() => navigate(`/materiales/editar/${params.row.id}`)}
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por tipo, marca o color"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 230 }}
        />

        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel size="small">Tipo hilo</InputLabel>
          <Select
            value={filterType}
            label="Tipo hilo"
            onChange={(e) => setFilterType(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="lana">Lana</MenuItem>
            <MenuItem value="alpaca">Alpaca</MenuItem>
            <MenuItem value="dralón">Dralón</MenuItem>
            <MenuItem value="rabbit">Rabbit</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 130 }}>
          <InputLabel size="small">Unidad</InputLabel>
          <Select
            value={filterUnit}
            label="Unidad"
            onChange={(e) => setFilterUnit(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="gramos">Gramos</MenuItem>
            <MenuItem value="metros">Metros</MenuItem>
            <MenuItem value="ovillos">Ovillos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableSelectionOnClick
            sx={{ border: 'none' }}
          />
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar el material "{selectedItem?.yarn_type} {selectedItem?.yarn_brand}"? Esta acción no se puede deshacer.
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
