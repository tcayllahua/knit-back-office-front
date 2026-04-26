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
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { useGetThreads } from '../hooks/queries'
import { useCreateThreadsBulkMutation, useDeleteThreadMutation } from '../hooks/mutations'
import { useHeaderActions } from '../components/HeaderActionsContext'

const REQUIRED_FIELDS = ['codigo_hilo']

const TEMPLATE_FIELDS = [
  'codigo_hilo',
  'nombre_hilo',
  'composicion',
  'abrev',
  'instrucciones_cuidado',
  'presentacion',
  'peso',
  'unidad_medida',
  'codigo_color_hex',
  'color_descripcion',
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
    codigohilo: 'codigo_hilo',
    nombrehilo: 'nombre_hilo',
    composicion: 'composicion',
    abrev: 'abrev',
    instruccionesdecuidado: 'instrucciones_cuidado',
    instrucionesdecuidado: 'instrucciones_cuidado',
    instrucciondecuidado: 'instrucciones_cuidado',
    instruccionescuidado: 'instrucciones_cuidado',
    presentacion: 'presentacion',
    peso: 'peso',
    unidaddemedida: 'unidad_medida',
    codigocolorhex: 'codigo_color_hex',
    colordescripcion: 'color_descripcion',
  }

  const normalized = {
    codigo_hilo: '',
    nombre_hilo: '',
    composicion: '',
    abrev: '',
    instrucciones_cuidado: '',
    presentacion: '',
    peso: '',
    unidad_medida: '',
    codigo_color_hex: '',
    color_descripcion: '',
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data: items = [], isLoading } = useGetThreads()
  const deleteMutation = useDeleteThreadMutation()
  const bulkCreateMutation = useCreateThreadsBulkMutation()

  const filtered = items.filter((item) => {
    const q = searchText.toLowerCase()
    return (
      item.codigo_hilo?.toLowerCase().includes(q) ||
      item.nombre_hilo?.toLowerCase().includes(q) ||
      item.color_descripcion?.toLowerCase().includes(q)
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
        codigo_hilo: 'H-001',
        nombre_hilo: 'ALGODON 24/1',
        composicion: '100% ALGODON',
        abrev: 'ALG24',
        instrucciones_cuidado: 'LAVAR A MANO',
        presentacion: 'CONO',
        peso: 500,
        unidad_medida: 'GRAMOS',
        codigo_color_hex: '#FFFFFF',
        color_descripcion: 'BLANCO',
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
    { field: 'codigo_hilo', headerName: 'Código Hilo', width: 130 },
    { field: 'nombre_hilo', headerName: 'Nombre Hilo', flex: 1, minWidth: 170 },
    { field: 'composicion', headerName: 'Composición', width: 170 },
    { field: 'abrev', headerName: 'Abrev', width: 100 },
    { field: 'presentacion', headerName: 'Presentación', width: 130 },
    { field: 'color_descripcion', headerName: 'Color', width: 140 },
    {
      field: 'vista_color',
      headerName: 'Vista',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const hex = params.row.codigo_color_hex
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
    { field: 'codigo_color_hex', headerName: 'Color Hex', width: 120 },
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
        </Box>
      ),
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
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
            sx={{ border: 'none' }}
          />
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar el hilo "{selectedItem?.nombre_hilo}"? Esta acción no se puede deshacer.
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
