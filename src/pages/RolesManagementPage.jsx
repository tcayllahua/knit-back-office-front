import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useGetRoles, useGetFormularios, useGetRole } from '../hooks/queries'
import { useHeaderActions } from '../components/HeaderActionsContext'
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useUpdateRolePermissionsMutation,
} from '../hooks/mutations'

export const RolesManagementPage = () => {
  const { setActions, clearActions } = useHeaderActions()
  const [search, setSearch] = useState('')
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [permissionsState, setPermissionsState] = useState({})

  const { data: roles = [], isLoading } = useGetRoles()
  const { data: formularios = [] } = useGetFormularios()
  const { data: roleDetail, isFetching: isRoleDetailFetching } = useGetRole(selectedRoleId)

  const createRole = useCreateRoleMutation()
  const updateRole = useUpdateRoleMutation()
  const deleteRole = useDeleteRoleMutation()
  const updatePermissions = useUpdateRolePermissionsMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  const filteredRoles = roles.filter((r) =>
    (r.nombre || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => {
    setEditingRole(null)
    reset({ nombre: '', descripcion: '' })
    setRoleDialogOpen(true)
  }

  useEffect(() => {
    setActions(
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
        sx={{ bgcolor: '#1e1e1e', '&:hover': { bgcolor: '#333' }, '& .MuiButton-startIcon': { transition: 'transform 0.3s' }, '&:hover .MuiButton-startIcon': { transform: 'rotate(90deg)' } }}
      >
        Nuevo Rol
      </Button>
    )
    return () => clearActions()
  }, [setActions, clearActions])

  const handleOpenEdit = (role) => {
    setEditingRole(role)
    reset({ nombre: role.nombre, descripcion: role.descripcion || '' })
    setRoleDialogOpen(true)
  }

  const handleOpenPermissions = (roleId) => {
    setSelectedRoleId(roleId)
    setPermissionsState({})
    setPermissionsDialogOpen(true)
  }

  // Sync permissions state when roleDetail loads/changes
  useEffect(() => {
    if (!roleDetail?.rol_formulario || !permissionsDialogOpen) return
    const state = {}
    roleDetail.rol_formulario.forEach((rf) => {
      const fId = rf.formularios?.id || rf.formulario_id
      state[fId] = {
        puede_ver: rf.puede_ver,
        puede_crear: rf.puede_crear,
        puede_editar: rf.puede_editar,
        puede_eliminar: rf.puede_eliminar,
      }
    })
    setPermissionsState(state)
  }, [roleDetail, permissionsDialogOpen])

  const onSubmitRole = async (data) => {
    try {
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole.id, data })
      } else {
        await createRole.mutateAsync(data)
      }
      setRoleDialogOpen(false)
    } catch {
      // Toast handled in mutation
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este rol?')) return
    try {
      await deleteRole.mutateAsync(id)
    } catch {
      // Toast handled in mutation
    }
  }

  const handlePermissionChange = (formularioId, field, checked) => {
    setPermissionsState((prev) => ({
      ...prev,
      [formularioId]: {
        ...prev[formularioId],
        puede_ver: prev[formularioId]?.puede_ver || false,
        puede_crear: prev[formularioId]?.puede_crear || false,
        puede_editar: prev[formularioId]?.puede_editar || false,
        puede_eliminar: prev[formularioId]?.puede_eliminar || false,
        [field]: checked,
      },
    }))
  }

  const handleSavePermissions = async () => {
    const permisos = Object.entries(permissionsState)
      .filter(([, p]) => p.puede_ver || p.puede_crear || p.puede_editar || p.puede_eliminar)
      .map(([formularioId, p]) => ({
        formulario_id: Number(formularioId),
        puede_ver: p.puede_ver,
        puede_crear: p.puede_crear,
        puede_editar: p.puede_editar,
        puede_eliminar: p.puede_eliminar,
      }))

    try {
      await updatePermissions.mutateAsync({ rolId: selectedRoleId, permisos })
      setPermissionsDialogOpen(false)
    } catch {
      // Toast handled in mutation
    }
  }

  const columns = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const colorMap = { admin: 'error', supervisor: 'warning', usuario: 'info' }
        return <Chip label={params.value} color={colorMap[params.value] || 'default'} size="small" />
      },
    },
    {
      field: 'descripcion',
      headerName: 'Descripción',
      flex: 2,
      minWidth: 250,
    },
    {
      field: 'is_active',
      headerName: 'Estado',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 180,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleOpenPermissions(params.row.id)}
            title="Permisos"
          >
            <SecurityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={() => handleOpenEdit(params.row)}
            title="Editar"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
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
      <TextField
        placeholder="Buscar rol..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: { xs: '100%', md: 350 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={filteredRoles}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{ border: 'none' }}
        />
      </Box>

      {/* Dialog: Create/Edit Role */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmitRole)}>
          <DialogTitle>{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nombre"
              {...register('nombre', { required: 'El nombre es requerido' })}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
              fullWidth
              size="small"
            />
            <TextField
              label="Descripción"
              {...register('descripcion')}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoleDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {editingRole ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog: Permissions */}
      <Dialog
        open={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Permisos del Rol: {roles.find((r) => r.id === selectedRoleId)?.nombre}
        </DialogTitle>
        <DialogContent>
          {isRoleDetailFetching && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          <TableContainer component={Paper} variant="outlined" sx={{ opacity: isRoleDetailFetching ? 0.5 : 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Formulario</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Ver</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Crear</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Editar</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formularios.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.nombre}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        size="small"
                        checked={permissionsState[f.id]?.puede_ver || false}
                        onChange={(e) => handlePermissionChange(f.id, 'puede_ver', e.target.checked)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        size="small"
                        checked={permissionsState[f.id]?.puede_crear || false}
                        onChange={(e) => handlePermissionChange(f.id, 'puede_crear', e.target.checked)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        size="small"
                        checked={permissionsState[f.id]?.puede_editar || false}
                        onChange={(e) => handlePermissionChange(f.id, 'puede_editar', e.target.checked)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        size="small"
                        checked={permissionsState[f.id]?.puede_eliminar || false}
                        onChange={(e) => handlePermissionChange(f.id, 'puede_eliminar', e.target.checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionsDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSavePermissions}>
            Guardar Permisos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
