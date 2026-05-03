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
  Typography,
  Tooltip,
  Popover,
  FormControlLabel,
  Switch,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { useGetKnittingParameters } from '../hooks/queries'
import { useDeleteKnittingParameterMutation, useRestoreKnittingParameterMutation } from '../hooks/mutations'
import { useHeaderActions } from '../components/HeaderActionsContext'
import { useAuthStore } from '../store/authStore'

const MODE_COLOR = {
  jacquard: 'primary',
  intarsia: 'secondary',
}

export const KnittingParametersPage = () => {
  const navigate = useNavigate()
  const { setActions, clearActions } = useHeaderActions()
  const user = useAuthStore((state) => state.user)
  const userRole = useAuthStore((state) => state.userRole)
  const filterByUserId = userRole === 'usuario' ? user?.id : null
  const [searchText, setSearchText] = useState('')
  const [optionsAnchor, setOptionsAnchor] = useState(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [filterMode, setFilterMode] = useState('')
  const [filterCanvas, setFilterCanvas] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data: items = [], isLoading } = useGetKnittingParameters(filterByUserId, showDeleted)
  const deleteMutation = useDeleteKnittingParameterMutation()
  const restoreMutation = useRestoreKnittingParameterMutation()

  useEffect(() => {
    setActions(
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/tejido/nueva')}
        sx={{ bgcolor: '#1e1e1e', '&:hover': { bgcolor: '#333' }, '& .MuiButton-startIcon': { transition: 'transform 0.3s' }, '&:hover .MuiButton-startIcon': { transform: 'rotate(90deg)' } }}
      >
        Nuevo Téjido
      </Button>
    )
    return () => clearActions()
  }, [setActions, clearActions, navigate])

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.stitch_type?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.knitting_submode?.toLowerCase().includes(searchText.toLowerCase())
    const matchesMode = !filterMode || item.knitting_mode === filterMode
    const matchesCanvas = !filterCanvas || item.canvas_type === filterCanvas
    return matchesSearch && matchesMode && matchesCanvas
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

  const handleRestore = async (row) => {
    await restoreMutation.mutateAsync(row.id)
  }

  const columns = [
    { field: 'parameter_order', headerName: 'Orden', width: 80 },
    { field: 'stitch_type', headerName: 'Tipo de punto', flex: 1, minWidth: 140 },
    { field: 'canvas_type', headerName: 'Canvas', width: 90 },
    {
      field: 'knitting_mode',
      headerName: 'Modo',
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <Chip
            label={params.value}
            size="small"
            color={MODE_COLOR[params.value] || 'default'}
          />
        ) : null,
    },
    { field: 'knitting_submode', headerName: 'Submodo', flex: 1, minWidth: 140 },
    { field: 'thread_count', headerName: 'Hilos', width: 80 },
    { field: 'stitch_density', headerName: 'Densidad', width: 100 },
    { field: 'tension_setting', headerName: 'Tensión', width: 100 },
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
          {params.row.deleted_at ? (
            <Tooltip title="Restaurar">
              <IconButton size="small" onClick={() => handleRestore(params.row)} color="primary">
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <IconButton
                size="small"
                onClick={() => navigate(`/tejido/editar/${params.row.id}`)}
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
            </>
          )}
        </Box>
      ),
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>Todos los parámetros de tejido</Typography>
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
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por punto o submodo"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 220 }}
        />

        <FormControl sx={{ minWidth: 130 }}>
          <InputLabel size="small">Modo</InputLabel>
          <Select
            value={filterMode}
            label="Modo"
            onChange={(e) => setFilterMode(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="jacquard">Jacquard</MenuItem>
            <MenuItem value="intarsia">Intarsia</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel size="small">Canvas</InputLabel>
          <Select
            value={filterCanvas}
            label="Canvas"
            onChange={(e) => setFilterCanvas(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            {['AL', 'VF', 'KF', 'GF', 'TR', 'CF'].map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
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
            getRowClassName={(params) => params.row.deleted_at ? 'deleted-row' : ''}
            sx={{ border: 'none', '& .deleted-row': { opacity: 0.45, bgcolor: 'action.hover' } }}
          />
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar el parámetro de tejido "{selectedItem?.stitch_type}"? Esta acción no se puede deshacer.
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
