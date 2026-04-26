import { useState } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Search as SearchIcon } from '@mui/icons-material'
import { useGetAllUsers, useGetRoles } from '../hooks/queries'
import { useUpdateUserRoleMutation } from '../hooks/mutations'

export const UsersManagementPage = () => {
  const [search, setSearch] = useState('')
  const { data: users = [], isLoading } = useGetAllUsers()
  const { data: roles = [] } = useGetRoles()
  const updateUserRole = useUpdateUserRoleMutation()

  const filteredUsers = users.filter(
    (u) =>
      (u.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.apellido || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleChange = (userId, rolId) => {
    updateUserRole.mutate({ userId, rolId: rolId || null })
  }

  const columns = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 120,
      valueGetter: (value, row) => `${row.nombre || ''} ${row.apellido || ''}`.trim(),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'rol_id',
      headerName: 'Rol',
      width: 200,
      renderCell: (params) => (
        <FormControl size="small" fullWidth>
          <Select
            value={params.row.rol_id || ''}
            onChange={(e) => handleRoleChange(params.row.id, e.target.value)}
            displayEmpty
            sx={{ fontSize: 13 }}
          >
            <MenuItem value="">
              <em>Sin rol</em>
            </MenuItem>
            {roles
              .filter((r) => r.is_active)
              .map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.nombre}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      ),
    },
    {
      field: 'roles',
      headerName: 'Rol actual',
      width: 150,
      renderCell: (params) => {
        const roleName = params.row.roles?.nombre
        if (!roleName) return <Chip label="Sin rol" size="small" color="default" />
        const colorMap = { admin: 'error', supervisor: 'warning', usuario: 'info' }
        return <Chip label={roleName} size="small" color={colorMap[roleName] || 'default'} />
      },
    },
    {
      field: 'fecha_registro',
      headerName: 'Fecha registro',
      width: 160,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString('es') : '',
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <TextField
        placeholder="Buscar por nombre o email..."
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
          rows={filteredUsers}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
          }}
        />
      </Box>
    </Box>
  )
}
