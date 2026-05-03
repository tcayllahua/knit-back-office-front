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
import { useGetThreads } from '../hooks/queries'
import { useCreateThreadsBulkMutation, useDeleteThreadMutation, useRestoreThreadMutation } from '../hooks/mutations'
import { useHeaderActions } from '../components/HeaderActionsContext'

const REQUIRED_FIELDS = ['thread_code']

const TEMPLATE_FIELDS = [
  'thread_code',
  'thread_name',
  'composition',
  'abbreviation',
  'care_instructions',
  'presentation',
  'weight',
  'unit_of_measure',
  'hex_color_code',
  'color_description',
]

const normalizeHeader = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')

const normalizeRow = (row) => {
  const keyMap = {
    codigohilo: 'thread_code',
    threadcode: 'thread_code',
    nombrehilo: 'thread_name',
    threadname: 'thread_name',
    composicion: 'composition',
    composition: 'composition',
    abrev: 'abbreviation',
    abbreviation: 'abbreviation',
    instruccionesdecuidado: 'care_instructions',
    instrucionesdecuidado: 'care_instructions',
    instrucciondecuidado: 'care_instructions',
    instruccionescuidado: 'care_instructions',
    careinstructions: 'care_instructions',
    presentacion: 'presentation',
    presentation: 'presentation',
    peso: 'weight',
    weight: 'weight',
    unidaddemedida: 'unit_of_measure',
    unitofmeasure: 'unit_of_measure',
    codigocolorhex: 'hex_color_code',
    hexcolorcode: 'hex_color_code',
    colordescripcion: 'color_description',
    colordescription: 'color_description',
  }

  const normalized = {
    thread_code: '',
    thread_name: '',
    composition: '',
    abbreviation: '',
    care_instructions: '',
    presentation: '',
    weight: '',
    unit_of_measure: '',
    hex_color_code: '',
    color_description: '',
  }

  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = keyMap[normalizeHeader(key)]
    if (normalizedKey) {
      normalized[normalizedKey] = String(value ?? '').trim()
    }
  })

  return normalized
}

export const HilosPage = () => {
  const navigate = useNavigate()
  const { setActions, clearActions } = useHeaderActions()
  const [searchText, setSearchText] = useState('')
  const [optionsAnchor, setOptionsAnchor] = useState(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data: items = [], isLoading } = useGetThreads(showDeleted)
  const deleteMutation = useDeleteThreadMutation()
  const bulkCreateMutation = useCreateThreadsBulkMutation()
  const restoreMutation = useRestoreThreadMutation()

  const filtered = items.filter((item) => {
    const q = searchText.toLowerCase()
    return (
      item.thread_code?.toLowerCase().includes(q) ||
      item.thread_name?.toLowerCase().includes(q) ||
      item.color_description?.toLowerCase().includes(q)
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
        thread_code: 'H-001',
        thread_name: 'ALGODON 24/1',
        composition: '100% ALGODON',
        abbreviation: 'ALG24',
        care_instructions: 'LAVAR A MANO',
        presentation: 'CONO',
        weight: 500,
        unit_of_measure: 'GRAMOS',
        hex_color_code: '#FFFFFF',
        color_description: 'BLANCO',
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateRows, {
      header: TEMPLATE_FIELDS,
    })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hilos')
    XLSX.writeFile(workbook, 'plantilla_hilos.xlsx')
  }

  const columns = [
    { field: 'thread_code', headerName: 'Código Hilo', width: 130 },
    { field: 'thread_name', headerName: 'Nombre Hilo', flex: 1, minWidth: 170 },
    { field: 'composition', headerName: 'Composición', width: 170 },
    { field: 'abbreviation', headerName: 'Abrev', width: 100 },
    { field: 'presentation', headerName: 'Presentación', width: 130 },
    { field: 'color_description', headerName: 'Color', width: 140 },
    {
      field: 'vista_color',
      headerName: 'Vista',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const hex = params.row.hex_color_code
        const isValidHex = /^#([A-Fa-f0-9]{6})$/.test(hex || '')

        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isValidHex ? hex : 'transparent',
              }}
            />
          </Box>
        )
      },
    },
    { field: 'hex_color_code', headerName: 'Color Hex', width: 120 },
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
                onClick={() => navigate(`/hilos/editar/${params.row.id}`)}
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
        <Typography variant="h6" fontWeight={600}>Todos los hilos</Typography>
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
          placeholder="Buscar por código, nombre o color"
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
            ¿Eliminar el hilo "{selectedItem?.thread_name}"? Esta acción no se puede deshacer.
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
