import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
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
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { useGetProviders } from '../hooks/queries'
import { useCreateProvidersBulkMutation, useDeleteProviderMutation, useRestoreProviderMutation } from '../hooks/mutations'
import { useHeaderActions } from '../components/HeaderActionsContext'

const REQUIRED_FIELDS = ['business_name', 'tax_id', 'address', 'email', 'phone', 'mobile']

const normalizeHeader = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')

const normalizeRow = (row) => {
  const keyMap = {
    razonsocial: 'business_name',
    businessname: 'business_name',
    ruc: 'tax_id',
    taxid: 'tax_id',
    direccion: 'address',
    address: 'address',
    email: 'email',
    telefono: 'phone',
    phone: 'phone',
    celular: 'mobile',
    mobile: 'mobile',
  }

  const normalized = {
    business_name: '',
    tax_id: '',
    address: '',
    email: '',
    phone: '',
    mobile: '',
  }

  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = keyMap[normalizeHeader(key)]
    if (normalizedKey) {
      normalized[normalizedKey] = String(value ?? '').trim()
    }
  })

  return normalized
}

export const ProveedoresPage = () => {
  const navigate = useNavigate()
  const { setActions, clearActions } = useHeaderActions()
  const [searchText, setSearchText] = useState('')
  const [optionsAnchor, setOptionsAnchor] = useState(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data: items = [], isLoading } = useGetProviders(showDeleted)
  const deleteMutation = useDeleteProviderMutation()
  const bulkCreateMutation = useCreateProvidersBulkMutation()
  const restoreMutation = useRestoreProviderMutation()

  useEffect(() => {
    setActions(
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/proveedores/nuevo')}
        sx={{ bgcolor: '#1e1e1e', '&:hover': { bgcolor: '#333' }, '& .MuiButton-startIcon': { transition: 'transform 0.3s' }, '&:hover .MuiButton-startIcon': { transform: 'rotate(90deg)' } }}
      >
        Nuevo Proveedor
      </Button>
    )
    return () => clearActions()
  }, [setActions, clearActions, navigate])

  const filtered = items.filter((item) => {
    const q = searchText.toLowerCase()
    return (
      item.business_name?.toLowerCase().includes(q) ||
      item.tax_id?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q)
    )
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

  const handleMassiveUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]

      if (!firstSheetName) {
        toast.error('El archivo Excel no contiene hojas')
        return
      }

      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' })

      if (!rows.length) {
        toast.error('El archivo no contiene registros para importar')
        return
      }

      const normalizedRows = rows.map(normalizeRow)

      const invalidRows = normalizedRows
        .map((row, index) => {
          const missing = REQUIRED_FIELDS.filter((field) => !row[field])
          return missing.length ? { row: index + 2, missing } : null
        })
        .filter(Boolean)

      if (invalidRows.length) {
        const first = invalidRows[0]
        toast.error(
          `Error en fila ${first.row}: faltan ${first.missing.join(', ')}. Verifica las columnas del Excel.`
        )
        return
      }

      await bulkCreateMutation.mutateAsync(normalizedRows)
    } catch (error) {
      toast.error(error.message || 'No se pudo procesar el archivo Excel')
    } finally {
      event.target.value = ''
    }
  }

  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        business_name: 'Textiles Andinos SAC',
        tax_id: '20123456789',
        address: 'Av. Industrial 123, Lima',
        email: 'contacto@textilesandinos.com',
        phone: '014123456',
        mobile: '987654321',
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateRows, {
      header: REQUIRED_FIELDS,
    })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Proveedores')
    XLSX.writeFile(workbook, 'plantilla_proveedores.xlsx')
  }

  const columns = [
    { field: 'business_name', headerName: 'Razón social', flex: 1, minWidth: 180 },
    { field: 'tax_id', headerName: 'RUC', width: 150 },
    { field: 'address', headerName: 'Dirección', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 190 },
    { field: 'phone', headerName: 'Teléfono', width: 130 },
    { field: 'mobile', headerName: 'Celular', width: 130 },
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
                onClick={() => navigate(`/proveedores/editar/${params.row.id}`)}
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
        <Typography variant="h6" fontWeight={600}>Todos los proveedores</Typography>
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
        <Button
          variant="outlined"
          component="label"
          startIcon={bulkCreateMutation.isPending ? <CircularProgress size={18} /> : <UploadFileIcon />}
          disabled={bulkCreateMutation.isPending}
        >
          {bulkCreateMutation.isPending ? 'Cargando...' : 'Carga masiva Excel'}
          <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={handleMassiveUpload}
          />
        </Button>

        <Button variant="text" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate}>
          Descargar plantilla
        </Button>

        <TextField
          placeholder="Buscar por razón social, RUC o email"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 280 }}
        />
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
            ¿Eliminar el proveedor "{selectedItem?.business_name}"? Esta acción no se puede deshacer.
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
