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
import { useGetMachines } from '../hooks/queries'
import { useDeleteMachineMutation } from '../hooks/mutations'

const getMaintenanceColor = (status) => {
  const normalized = (status || '').toLowerCase()
  const colors = {
    operativa: 'success',
    mantenimiento: 'warning',
    inactiva: 'error',
  }
  return colors[normalized] || 'default'
}

export const MaquinasPage = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterGauge, setFilterGauge] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState(null)

  const { data: machines = [], isLoading } = useGetMachines()
  const deleteMutation = useDeleteMachineMutation()

  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.machine_brand?.toLowerCase().includes(searchText.toLowerCase()) ||
      machine.machine_model?.toLowerCase().includes(searchText.toLowerCase())
    const matchesType = !filterType || machine.machine_type === filterType
    const matchesGauge = !filterGauge || String(machine.gauge_number) === filterGauge

    return matchesSearch && matchesType && matchesGauge
  })

  const handleDeleteClick = (machine) => {
    setSelectedMachine(machine)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: selectedMachine.id })
    setDeleteDialogOpen(false)
    setSelectedMachine(null)
  }

  const columns = [
    { field: 'machine_type', headerName: 'Tipo', width: 90 },
    { field: 'gauge_number', headerName: 'Galga', width: 90 },
    { field: 'needle_count', headerName: 'Agujas', width: 95 },
    { field: 'machine_speed', headerName: 'RPM', width: 90 },
    { field: 'machine_brand', headerName: 'Marca', flex: 1, minWidth: 140 },
    { field: 'machine_model', headerName: 'Modelo', flex: 1, minWidth: 140 },
    {
      field: 'maintenance_status',
      headerName: 'Mantenimiento',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value || 'N/A'}
          color={getMaintenanceColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'calibration_date',
      headerName: 'Calibración',
      width: 130,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString('es-ES') : '-'),
    },
    {
      field: 'is_primary',
      headerName: 'Primaria',
      width: 110,
      renderCell: (params) => (params.value ? <Chip label="Sí" color="info" size="small" /> : null),
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
            onClick={() => navigate(`/maquinas/editar/${params.row.id}`)}
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
          onClick={() => navigate('/maquinas/nueva')}
        >
          Nuevo Parámetro
        </Button>

        <TextField
          placeholder="Buscar por marca o modelo"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 250 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filterType}
            label="Tipo"
            onChange={(e) => setFilterType(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
            <MenuItem value="D">D</MenuItem>
            <MenuItem value="E">E</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Galga</InputLabel>
          <Select
            value={filterGauge}
            label="Galga"
            onChange={(e) => setFilterGauge(e.target.value)}
            size="small"
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="6">6</MenuItem>
            <MenuItem value="7">7</MenuItem>
            <MenuItem value="9">9</MenuItem>
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
            rows={filteredMachines}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            disableSelectionOnClick
          />
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el parámetro de máquina "{selectedMachine?.machine_brand} {selectedMachine?.machine_model}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
